import { auth } from "@clerk/nextjs/server";

export async function getTenantContext() {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: no user session");
  }

  if (!orgId) {
    throw new Error("No organization selected. Please select or create a company.");
  }

  return { userId, companyId: orgId };
}

export async function getUserContext() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: no user session");
  }

  return { userId };
}
