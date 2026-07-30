"use client";

import { notFound, redirect } from "next/navigation";
import { isListingRouteType } from "@/lib/listing-routes";

type Props = {
  params: {
    type: string;
    id: string;
  };
};

export default function BookingPage({ params }: Props) {
  const { type, id } = params;

  if (!isListingRouteType(type)) {
    notFound();
  }

  redirect(`/listings/${type}/${encodeURIComponent(id)}`);
}
