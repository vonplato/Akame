import Anthropic from "@anthropic-ai/sdk";
import {
  FLOOR_IDENTIFICATION_SYSTEM_PROMPT,
  FLOOR_IDENTIFICATION_USER_PROMPT,
} from "./prompts";
import { parseAiResponse, type FloorIdentificationResult } from "./parse-result";

let _client: Anthropic | undefined;

function getClient() {
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}

export async function identifyFloor(
  imageUrl: string
): Promise<FloorIdentificationResult> {
  const client = getClient();

  // Fetch the image and convert to base64
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString("base64");

  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const mediaType = contentType.startsWith("image/png")
    ? "image/png"
    : contentType.startsWith("image/webp")
      ? "image/webp"
      : contentType.startsWith("image/gif")
        ? "image/gif"
        : "image/jpeg";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: FLOOR_IDENTIFICATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: FLOOR_IDENTIFICATION_USER_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return parseAiResponse(textBlock.text);
}
