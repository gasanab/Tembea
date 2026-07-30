import { listingsApi } from "@/lib/api-client";

export async function getHotels() {
  const response: any = await listingsApi.getAll({ type: "ACCOMMODATION" });
  return response.listings || [];
}
