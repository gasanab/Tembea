import { redirect } from "next/navigation";
import { getListingHref } from "@/lib/listing-routes";

type Props = {
  params: {
    category: string;
    id: string;
  };
};

export default function LegacyDetailPage({ params }: Props) {
  redirect(getListingHref(params.category, params.id));
}
