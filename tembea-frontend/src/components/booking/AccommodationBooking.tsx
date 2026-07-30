"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Star,
  Heart,
  Share2,
  Users,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Loader2,
  ImageOff,
} from "lucide-react";
import { BookingWidget } from "./BookingWidget";
import { useListing } from "@/hooks/useListings";
import { useWishlist } from "@/hooks/useWishlist";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  gym: Dumbbell,
  pool: Waves,
};

function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(amenityIcons)) {
    if (lower.includes(key)) return amenityIcons[key];
  }
  return CheckCircle2;
}

type Props = {
  listingId: string;
};

export function AccommodationBooking({ listingId }: Props) {
  const { listing, isLoading, error } = useListing(listingId);
  const [currentImage, setCurrentImage] = useState(0);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const images = listing?.images?.filter(Boolean) || [];

  const wishlisted = isWishlisted(listingId);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-600" size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">This listing could not be loaded. It may have been removed or is temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  const amenities: string[] = Array.isArray(listing.amenities) ? listing.amenities : [];
  const availableSlots =
    typeof listing.available === "number" ? listing.available : 0;

  return (
    <>
      {/* Hero Image Gallery */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        {images.length > 0 ? (
          <Image
            src={images[currentImage]}
            alt={listing.name}
            fill
            className="object-cover transition-opacity duration-500"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white/80">
            <span className="flex items-center gap-2 font-semibold">
              <ImageOff aria-hidden="true" size={22} />
              No image provided
            </span>
          </div>
        )}

        {/* Gallery Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentImage ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Floating Actions */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (!isToggling) {
                setIsToggling(true);
                try { await toggleWishlist(listingId); } finally { setIsToggling(false); }
              }
            }}
            disabled={isToggling}
            className={`p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all hover:scale-110 ${isToggling ? "opacity-50" : ""}`}
          >
            <Heart size={20} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
          </button>
          <button
            onClick={() => {
              navigator.share?.({ title: listing.name, url: window.location.href });
            }}
            className="p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all hover:scale-110"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-8 left-8 z-20 text-white">
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-black mb-3 inline-block">
            Accommodation
          </span>
          <h1 className="text-5xl font-black mb-2">{listing.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin size={18} />
              <span className="font-bold">{listing.location}, {listing.region}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <Star size={16} fill="#FFC700" stroke="#FFC700" />
              <span className="font-black">{listing.rating?.toFixed(1) || "New"}</span>
              <span className="font-semibold">
                ({listing.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Description */}
            <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
              <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={28} />
                About This Property
              </h2>
              <p className="text-gray-700 leading-relaxed font-semibold text-lg">
                {listing.description}
              </p>
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
              <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
                <h2 className="text-3xl font-black mb-6">Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {amenities.map((amenity: string, idx: number) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200"
                      >
                        <Icon className="text-emerald-600" size={24} />
                        <span className="font-bold text-gray-800">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Available Options / Units */}
            {(() => {
              const extra = listing.extraData || {};
              const allUnits = [
                ...(extra.roomTypes || []),
                ...(extra.apartmentUnits || []),
                ...(extra.villaUnits || []),
                ...(extra.lodgeRooms || []),
                ...(extra.guestHouseRooms || []),
                ...(extra.hostelBedTypes || []),
                ...(extra.resortRoomTypes || []),
                ...(extra.homestayRooms || []),
                ...(extra.campsiteUnits || [])
              ];

              if (allUnits.length === 0) return null;

              return (
                <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-600" size={28} />
                    Available Options
                  </h2>
                  <div className="space-y-4">
                    {allUnits.map((unit: any, idx: number) => {
                      const title = unit.name || unit.apartmentType || unit.type || `Unit ${idx + 1}`;
                      const features = [...(unit.features || []), ...(unit.configuration || [])];
                      const isSelected = selectedUnit === unit;
                      return (
                        <div key={idx} className={`bg-white border-2 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300'}`}>
                          <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                            <div>
                              <h5 className="text-xl font-black text-gray-900">{title}</h5>
                              {unit.roomType && <div className="text-sm font-bold text-emerald-600 mb-1">{unit.roomType}</div>}
                              {unit.rentalType && <div className="text-sm font-bold text-emerald-600 mb-1">{unit.rentalType}</div>}
                              
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-600 font-semibold">
                                {unit.guests && <span className="flex items-center gap-1"><Users size={14}/> Max {unit.guests} Guests</span>}
                                {unit.capacity && <span className="flex items-center gap-1"><Users size={14}/> Capacity: {unit.capacity}</span>}
                                {unit.bedrooms && <span>🛏 {unit.bedrooms} Bedrooms</span>}
                                {unit.beds && <span>🛏 {unit.beds}</span>}
                                {unit.bathrooms && <span>🚿 {unit.bathrooms} Bathrooms</span>}
                                {unit.view && <span>👁 {unit.view}</span>}
                                {unit.tentType && <span>⛺ {unit.tentType}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-emerald-600">${unit.price || 0}</div>
                              <div className="text-sm font-bold text-gray-500 mt-1">
                                {unit.remainingRooms || unit.available || 1} available
                              </div>
                            </div>
                          </div>
                          
                          {/* Features */}
                          {features.length > 0 && (
                            <div className="p-4 bg-gray-50">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Unit Features</p>
                              <div className="flex flex-wrap gap-2">
                                {features.map((feature: string, fIdx: number) => (
                                  <span key={fIdx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                                    ✓ {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Select Action */}
                          <div className="p-4 bg-white flex justify-end">
                            <button 
                              onClick={() => {
                                setSelectedUnit(unit);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-emerald-600'}`}
                            >
                              {isSelected ? "Selected" : `Select ${title.split(' ')[0]}`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* Reviews Section */}
            <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
                <MessageSquare className="text-emerald-600" size={28} />
                Guest Reviews
              </h2>
              <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-center">
                  <div className="text-5xl font-black text-emerald-600">
                    {listing.rating?.toFixed(1) || "—"}
                  </div>
                  <div className="text-sm font-bold text-gray-600">Excellent</div>
                </div>
                <div className="flex-1">
                  <div className="text-xl font-black mb-2">
                    {listing.reviewCount || 0} Reviews
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        fill={star <= Math.round(listing.rating || 0) ? "#FFC700" : "none"}
                        stroke="#FFC700"
                      />
                    ))}
                  </div>
                </div>
              </div>
              {(listing.reviews || []).slice(0, 3).map((review: any, idx: number) => (
                <div key={idx} className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                      {review.user?.name?.[0] || "U"}
                    </div>
                    <span className="font-bold text-gray-800">{review.user?.name || "Guest"}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= review.rating ? "#FFC700" : "none"}
                          stroke="#FFC700"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">{review.comment}</p>
                </div>
              ))}
            </section>

            {/* Location */}
            <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
              <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-600" size={28} />
                Location
              </h2>
              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-4">
                <MapPin size={18} className="text-emerald-600" />
                {listing.location}, {listing.region}
              </div>
              <div className="h-48 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center border-2 border-emerald-200">
                <div className="text-center">
                  <MapPin size={36} className="text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-emerald-800">{listing.location}</p>
                  <p className="text-sm text-emerald-600">{listing.region}, Rwanda</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Booking Widget */}
          <div className="lg:sticky lg:top-24 h-fit">
            <BookingWidget
              type="accommodation"
              price={selectedUnit ? (selectedUnit.price || 0) : listing.price}
              available={selectedUnit ? (selectedUnit.remainingRooms ?? selectedUnit.available ?? 0) : availableSlots}
              itemName={selectedUnit ? `${listing.name} - ${selectedUnit.name || selectedUnit.apartmentType || selectedUnit.type || "Unit"}` : listing.name}
              listingId={listingId}
            />

            {/* Trust Badges */}
            <div className="mt-6 rounded-2xl bg-white border-2 border-gray-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-emerald-600" size={24} />
                <span className="font-black text-gray-800">Before you book</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                Review the listing details, dates, guest count, and total before submitting your booking.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
