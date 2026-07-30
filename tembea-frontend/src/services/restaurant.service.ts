import { listingsApi } from "@/lib/api-client";

export async function getRestaurants() {
  const response: any = await listingsApi.getAll({ type: "RESTAURANTS" });
  return response.listings || [];
}
