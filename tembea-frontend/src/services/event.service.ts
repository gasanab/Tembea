import { listingsApi } from "@/lib/api-client";

export async function getEvents() {
  const response: any = await listingsApi.getAll({ type: "EVENTS" });
  return response.listings || [];
}
