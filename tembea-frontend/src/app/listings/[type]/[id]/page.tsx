import { notFound } from "next/navigation";
import { AccommodationBooking } from "@/components/booking/AccommodationBooking";
import { GenericBookingPage } from "@/components/booking/GenericBookingPage";
import { isListingRouteType, type ListingRouteType } from "@/lib/listing-routes";

type Props = {
  params: {
    type: string;
    id: string;
  };
};

export default function LiveListingPage({ params }: Props) {
  if (!isListingRouteType(params.type)) {
    notFound();
  }

  const type = params.type as ListingRouteType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {type === "accommodation" ? (
        <AccommodationBooking listingId={params.id} />
      ) : (
        <GenericBookingPage listingId={params.id} type={type} />
      )}
    </div>
  );
}
