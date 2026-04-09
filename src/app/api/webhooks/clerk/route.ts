import { type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { companies, users, memberships } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    switch (evt.type) {
      case "organization.created":
      case "organization.updated": {
        const { id, name, slug } = evt.data;
        await db
          .insert(companies)
          .values({
            id,
            name,
            slug: slug || id,
          })
          .onConflictDoUpdate({
            target: companies.id,
            set: {
              name,
              slug: slug || id,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case "organization.deleted": {
        const { id } = evt.data;
        if (id) {
          await db.delete(companies).where(eq(companies.id, id));
        }
        break;
      }

      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;
        const primaryEmail = email_addresses.find(
          (e) => e.id === evt.data.primary_email_address_id
        );
        const name = [first_name, last_name].filter(Boolean).join(" ") || null;

        await db
          .insert(users)
          .values({
            id,
            email: primaryEmail?.email_address || "",
            name,
            avatarUrl: image_url || null,
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              email: primaryEmail?.email_address || "",
              name,
              avatarUrl: image_url || null,
            },
          });
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (id) {
          await db.delete(users).where(eq(users.id, id));
        }
        break;
      }

      case "organizationMembership.created": {
        const { organization, public_user_data, role } = evt.data;
        await db
          .insert(memberships)
          .values({
            userId: public_user_data.user_id,
            companyId: organization.id,
            role: role === "org:admin" ? "admin" : "member",
          })
          .onConflictDoNothing();
        break;
      }

      case "organizationMembership.deleted": {
        const { organization, public_user_data } = evt.data;
        await db
          .delete(memberships)
          .where(
            and(
              eq(memberships.userId, public_user_data.user_id),
              eq(memberships.companyId, organization.id)
            )
          );
        break;
      }

      case "organizationMembership.updated": {
        const { organization, public_user_data, role } = evt.data;
        await db
          .update(memberships)
          .set({ role: role === "org:admin" ? "admin" : "member" })
          .where(
            and(
              eq(memberships.userId, public_user_data.user_id),
              eq(memberships.companyId, organization.id)
            )
          );
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
