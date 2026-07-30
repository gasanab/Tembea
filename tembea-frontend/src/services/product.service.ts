import { listingsApi } from "@/lib/api-client";

export async function getMarketplaceProducts() {
  const response: any = await listingsApi.getAll({ type: "MARKETPLACE" });
  return response.listings || [];
}
