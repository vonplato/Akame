import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _r2Client: S3Client | undefined;

function getR2Client() {
  if (!_r2Client) {
    _r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _r2Client;
}

const BUCKET = process.env.R2_BUCKET_NAME || "akame-floor-images";

export async function createPresignedUploadUrl(
  companyId: string,
  contentType: string
) {
  const client = getR2Client();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const imageId = crypto.randomUUID();
  const ext = contentType === "image/png" ? "png" : "jpg";
  const key = `${companyId}/scans/${year}/${month}/${imageId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : uploadUrl.split("?")[0];

  return { uploadUrl, key, publicUrl };
}

export async function createPresignedDownloadUrl(key: string) {
  const client = getR2Client();

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 });
}
