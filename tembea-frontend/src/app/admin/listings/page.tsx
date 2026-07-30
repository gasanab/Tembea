"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, CheckCircle2, Sparkles, X, ChevronRight,
  AlertCircle, Loader2, CheckCircle, FileText
} from "lucide-react";
import { adminApi } from "@/lib/api-client";
import { RWANDA_IMAGES } from "@/utils/constants/rwanda-images";

// ── Helper: render any extraData as a pretty key-value section ──────────────
function ExtraDataSection({
  title,
  data,
  color = "gray",
}: {
  title: string;
  data: Record<string, any>;
  color?: string;
}) {
  const entries = Object.entries(data).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && v !== false
  );
  if (entries.length === 0) return null;
  return (
    <div className={`bg-${color}-50 p-4 rounded-xl border border-${color}-100`}>
      <h3 className={`text-xs font-bold text-${color}-700 uppercase tracking-wider mb-3`}>
        {title}
      </h3>
      <div className="space-y-1.5">
        {entries.map(([key, value]) => {
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase());
          if (Array.isArray(value)) {
            if (value.length === 0) return null;
            if (typeof value[0] === "object") return null; // handled separately
            return (
              <div key={key}>
                <span className="text-xs font-bold text-gray-500 block mb-1">{label}:</span>
                <div className="flex flex-wrap gap-1">
                  {value.map((v: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-700"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            );
          }
          if (typeof value === "boolean") {
            if (!value) return null;
            return (
              <div key={key} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <CheckCircle size={11} className="text-green-500 shrink-0" /> {label}
              </div>
            );
          }
          if (typeof value === "object") return null;
          return (
            <div key={key} className="flex justify-between items-start gap-4 text-xs">
              <span className="text-gray-500 font-semibold shrink-0">{label}:</span>
              <span className="font-bold text-gray-800 text-right">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Full listing detail view (reads extraData per type) ─────────────────────
function ListingDetailView({ listing }: { listing: any }) {
  const extra = listing.extraData || {};
  const subType = extra.listingSubType || listing.type?.toLowerCase();
  const allImages = listing.images || [];

  return (
    <div className="space-y-6">
      {/* Images */}
      {allImages.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Images ({allImages.length})
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                className="w-28 h-24 rounded-xl object-cover bg-gray-200 shrink-0 border border-gray-100"
                alt=""
              />
            ))}
          </div>
        </div>
      )}

      {/* Core fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Name</p>
          <p className="text-sm font-black text-gray-900">{listing.name || "—"}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Type</p>
          <p className="text-sm font-black text-gray-900">{listing.type}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Base Price</p>
          <p className="text-lg font-black text-emerald-600">
            ${listing.price}{" "}
            <span className="text-xs text-gray-400">{listing.priceLabel}</span>
          </p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Location</p>
          <p className="text-sm font-bold text-gray-800 leading-tight">{listing.location || "—"}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Description</p>
        <p className="text-sm text-gray-700 leading-relaxed">{listing.description || "—"}</p>
      </div>

      {listing.coordinates && (
        <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs font-mono text-gray-600">
          📍 GPS: {listing.coordinates.lat?.toFixed(6)}, {listing.coordinates.lng?.toFixed(6)}
        </div>
      )}

      {/* ═══ PARKS ═══ */}
      {subType === "parks" && (
        <>
          <ExtraDataSection title="Park Details" color="green" data={{
            parkCategory: extra.parkCategory,
            managedBy: extra.managedBy,
            establishedYear: extra.establishedYear,
            officialWebsite: extra.officialWebsite,
            nearestTown: extra.nearestTown,
            gpsCoordinates: extra.gpsCoordinates,
          }} />
          <ExtraDataSection title="Entry Fees" color="emerald" data={{
            adultFee: extra.adultFee ? `${extra.currency || "$"}${extra.adultFee}` : undefined,
            childFee: extra.childFee ? `${extra.currency || "$"}${extra.childFee}` : undefined,
            eastAfricanFee: extra.eastAfricanFee ? `${extra.currency || "$"}${extra.eastAfricanFee}` : undefined,
            vehicleFee: extra.vehicleFee ? `${extra.currency || "$"}${extra.vehicleFee}` : undefined,
            campingFee: extra.campingFee ? `${extra.currency || "$"}${extra.campingFee}` : undefined,
            guideFee: extra.guideFee ? `${extra.currency || "$"}${extra.guideFee}` : undefined,
          }} />
          <ExtraDataSection title="Visitor Capacity" color="sky" data={{
            maxVisitorsPerDay: extra.maxVisitorsPerDay,
            maxGroupSize: extra.maxGroupSize,
            morningSlots: extra.morningSlots,
            afternoonSlots: extra.afternoonSlots,
          }} />
          <ExtraDataSection title="Descriptions" color="amber" data={{
            about: extra.about,
            history: extra.history,
            conservationStory: extra.conservationStory,
            landscape: extra.landscape,
            climate: extra.climate,
            visitorExperience: extra.visitorExperience,
          }} />
          {extra.wildlife?.length > 0 && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h3 className="text-xs font-bold text-green-700 uppercase mb-2">🦁 Wildlife</h3>
              <div className="flex flex-wrap gap-1">
                {extra.wildlife.map((w: string) => (
                  <span key={w} className="px-2 py-1 bg-white border border-green-200 rounded-md text-[10px] font-bold text-green-800">{w}</span>
                ))}
              </div>
            </div>
          )}
          {extra.activities?.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <h3 className="text-xs font-bold text-amber-700 uppercase mb-3">🏃 Activities</h3>
              <div className="space-y-2">
                {extra.activities.map((act: any) => (
                  <div key={act.id} className="bg-white p-3 rounded-lg border border-amber-100">
                    <div className="flex justify-between">
                      <span className="font-bold text-sm">{act.name}</span>
                      <span className="font-black text-green-600">${act.price}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-amber-700 font-semibold mt-1">
                      {act.duration && <span>⏱ {act.duration}</span>}
                      {act.maxGuests && <span>👥 {act.maxGuests}</span>}
                    </div>
                    {act.description && <p className="text-[10px] text-gray-500 mt-1">{act.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <ExtraDataSection title="Facilities" color="blue" data={{ facilities: extra.facilities }} />
          <ExtraDataSection title="Best Months" color="sky" data={{ bestMonths: extra.bestMonths }} />
          <ExtraDataSection title="Safety" color="red" data={{
            rangerAvailable: extra.rangerAvailable,
            emergencyContact: extra.emergencyContact,
            medicalCenterInfo: extra.medicalCenterInfo,
          }} />
          <ExtraDataSection title="Nearby Attractions" color="rose" data={{
            hotelsNearby: extra.hotelsNearby,
            restaurantsNearby: extra.restaurantsNearby,
            transportNearby: extra.transportNearby,
          }} />
        </>
      )}

      {/* ═══ RESTAURANTS ═══ */}
      {subType === "restaurants" && (
        <>
          <ExtraDataSection title="Restaurant Info" color="red" data={{
            businessType: extra.businessType,
            ownerName: extra.ownerName,
            tagline: extra.tagline,
          }} />
          <ExtraDataSection title="Location Details" color="gray" data={{
            streetAddress: extra.streetAddress,
            sector: extra.sector,
            district: extra.district,
            province: extra.province,
            country: extra.country,
            nearestLandmark: extra.nearestLandmark,
          }} />
          <ExtraDataSection title="Contact" color="blue" data={{
            phone: extra.phone,
            whatsapp: extra.whatsapp,
            email: extra.email,
            website: extra.website,
            facebook: extra.facebook,
            instagram: extra.instagram,
            tiktok: extra.tiktok,
            twitter: extra.twitter,
          }} />
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">⏰ Operating Hours</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold text-gray-600">
              {extra.mondayHours && <div className="flex justify-between"><span>Mon</span><span>{extra.mondayHours}</span></div>}
              {extra.tuesdayHours && <div className="flex justify-between"><span>Tue</span><span>{extra.tuesdayHours}</span></div>}
              {extra.wednesdayHours && <div className="flex justify-between"><span>Wed</span><span>{extra.wednesdayHours}</span></div>}
              {extra.thursdayHours && <div className="flex justify-between"><span>Thu</span><span>{extra.thursdayHours}</span></div>}
              {extra.fridayHours && <div className="flex justify-between"><span>Fri</span><span>{extra.fridayHours}</span></div>}
              {extra.saturdayHours && <div className="flex justify-between"><span>Sat</span><span>{extra.saturdayHours}</span></div>}
              {extra.sundayHours && <div className="flex justify-between"><span>Sun</span><span>{extra.sundayHours}</span></div>}
            </div>
            <div className="flex gap-2 mt-2">
              {extra.isOpen24Hours && <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">24 Hours</span>}
              {extra.isClosedOnSundays && <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">Closed Sundays</span>}
              {extra.isReservationsOnly && <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Reservations Only</span>}
            </div>
          </div>
          <ExtraDataSection title="Capacity & Pricing" color="emerald" data={{
            priceRange: extra.priceRange,
            averagePricePerPerson: extra.averagePricePerPerson ? `$${extra.averagePricePerPerson}` : undefined,
            maxCapacity: extra.maxCapacity,
            indoorSeats: extra.indoorSeats,
            outdoorSeats: extra.outdoorSeats,
            privateRooms: extra.privateRooms,
            vipRooms: extra.vipRooms,
          }} />
          {extra.cuisine?.length > 0 && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="text-xs font-bold text-red-700 uppercase mb-2">🍽 Cuisine</h3>
              <div className="flex flex-wrap gap-1">
                {extra.cuisine.map((c: string) => (
                  <span key={c} className="px-2 py-1 bg-white border border-red-200 rounded-md text-[10px] font-bold text-red-800">{c}</span>
                ))}
              </div>
            </div>
          )}
          {extra.diningExperience?.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h3 className="text-xs font-bold text-orange-700 uppercase mb-2">✨ Dining Experience</h3>
              <div className="flex flex-wrap gap-1">
                {extra.diningExperience.map((e: string) => (
                  <span key={e} className="px-2 py-1 bg-white border border-orange-200 rounded-md text-[10px] font-bold text-orange-800">{e}</span>
                ))}
              </div>
            </div>
          )}
          {extra.services?.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-700 uppercase mb-2">🛎 Services</h3>
              <div className="flex flex-wrap gap-1">
                {extra.services.map((s: string) => (
                  <span key={s} className="px-2 py-1 bg-white border border-blue-200 rounded-md text-[10px] font-bold text-blue-800">{s}</span>
                ))}
              </div>
            </div>
          )}
          {extra.menuCategories?.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-black text-gray-900 mb-4">📋 Full Menu</h3>
              <div className="space-y-4">
                {extra.menuCategories.map((cat: any) => (
                  <div key={cat.id}>
                    <h4 className="text-xs font-black text-red-700 uppercase bg-red-50 px-2 py-1 rounded-md mb-2">{cat.name}</h4>
                    <div className="space-y-2">
                      {cat.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                          {item.photo && (
                            <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <span className="font-bold text-sm">{item.name}</span>
                              <span className="font-black text-red-600">${item.price}</span>
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-gray-500 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex gap-1 mt-1">
                              {item.isVegetarian && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 rounded font-bold">VEG</span>}
                              {item.isSpicy && <span className="text-[8px] bg-red-100 text-red-700 px-1.5 rounded font-bold">SPICY</span>}
                              {item.isPopular && <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 rounded font-bold">POPULAR</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ExtraDataSection title="Amenities" color="gray" data={{ amenities: extra.amenities }} />
          <ExtraDataSection title="Reservation Settings" color="red" data={{
            acceptReservations: extra.acceptReservations,
            reservationFee: extra.reservationFee ? `$${extra.reservationFee}` : undefined,
            minGuests: extra.minGuests,
            maxGuests: extra.maxGuests,
            advanceBooking: extra.advanceBooking,
            cancellationPolicy: extra.cancellationPolicy,
          }} />
        </>
      )}

      {/* ═══ TOURS ═══ */}
      {subType === "tours" && (
        <>
          <ExtraDataSection title="Tour Details" color="cyan" data={{
            tourCategory: extra.tourCategory,
            destination: extra.destination,
            meetingPoint: extra.meetingPoint,
            duration: extra.duration,
            difficulty: extra.difficulty,
            minAge: extra.minAge,
            maxParticipants: extra.maxParticipants,
            isPrivateTour: extra.isPrivateTour,
            languages: extra.languages,
          }} />
          <ExtraDataSection title="Schedule" color="blue" data={{
            availableDays: extra.availableDays,
            startTime: extra.startTime,
            endTime: extra.endTime,
            bookingCutoff: extra.bookingCutoff,
            seasonalAvailability: extra.seasonalAvailability,
          }} />
          <ExtraDataSection title="Pricing" color="emerald" data={{
            adultPrice: extra.adultPrice ? `${extra.currency || "$"}${extra.adultPrice}` : undefined,
            childPrice: extra.childPrice ? `${extra.currency || "$"}${extra.childPrice}` : undefined,
            residentPrice: extra.residentPrice ? `${extra.currency || "$"}${extra.residentPrice}` : undefined,
            eastAfricanPrice: extra.eastAfricanPrice ? `${extra.currency || "$"}${extra.eastAfricanPrice}` : undefined,
            groupDiscount: extra.groupDiscount ? `${extra.groupDiscount}%` : undefined,
            depositRequired: extra.depositRequired ? `${extra.currency || "$"}${extra.depositRequired}` : undefined,
          }} />
          <ExtraDataSection title="Tour Description" color="amber" data={{
            overview: extra.overview,
            highlights: extra.highlights,
            whyChoose: extra.whyChoose,
            whatToExpect: extra.whatToExpect,
          }} />
          {extra.included?.length > 0 && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h3 className="text-xs font-bold text-green-700 uppercase mb-2">✅ Included</h3>
              <div className="flex flex-wrap gap-1">
                {extra.included.map((i: string) => (
                  <span key={i} className="px-2 py-1 bg-white border border-green-200 rounded-md text-[10px] font-bold text-green-800">✓ {i}</span>
                ))}
              </div>
            </div>
          )}
          {extra.notIncluded?.length > 0 && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="text-xs font-bold text-red-700 uppercase mb-2">❌ Not Included</h3>
              <div className="flex flex-wrap gap-1">
                {extra.notIncluded.map((i: string) => (
                  <span key={i} className="px-2 py-1 bg-white border border-red-200 rounded-md text-[10px] font-bold text-red-700">✕ {i}</span>
                ))}
              </div>
            </div>
          )}
          {extra.itinerary?.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-black text-gray-900 mb-4">🗓 Full Itinerary</h3>
              <div className="space-y-4">
                {extra.itinerary.map((day: any) => (
                  <div key={day.id} className="border-l-2 border-cyan-300 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-cyan-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">Day {day.dayNumber}</span>
                      <span className="font-black text-sm text-gray-800">{day.title}</span>
                    </div>
                    {day.activities?.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {day.activities.map((act: any) => (
                          <div key={act.id} className="flex gap-2 text-xs text-gray-600">
                            {act.time && <span className="font-black text-cyan-600 w-12 shrink-0">{act.time}</span>}
                            <span className="font-semibold">{act.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <ExtraDataSection title="Requirements & Accessibility" color="purple" data={{
            requirements: extra.requirements,
            accessibility: extra.accessibility,
            cancellationPolicy: extra.cancellationPolicy,
          }} />
          <ExtraDataSection title="Pickup & Safety" color="red" data={{
            pickupIncluded: extra.pickupIncluded,
            pickupLocations: extra.pickupLocations,
            healthAdvice: extra.healthAdvice,
            emergencyContact: extra.emergencyContact,
          }} />
          {extra.gorillaPermitNumber && (
            <ExtraDataSection title="🦍 Gorilla Trekking" color="green" data={{
              gorillaPermitNumber: extra.gorillaPermitNumber,
              trekkingSector: extra.trekkingSector,
              permitAvailability: extra.permitAvailability,
            }} />
          )}
          {extra.vehicleType && (
            <ExtraDataSection title="🚙 Safari" color="amber" data={{
              vehicleType: extra.vehicleType,
              gameDriveDuration: extra.gameDriveDuration,
              guideIncluded: extra.guideIncluded,
            }} />
          )}
          {extra.trailLength && (
            <ExtraDataSection title="⛰ Hiking" color="gray" data={{
              mountainName: extra.mountainName,
              trailLength: extra.trailLength,
              elevationGain: extra.elevationGain,
              estimatedHikingTime: extra.estimatedHikingTime,
            }} />
          )}
          {extra.waterBody && (
            <ExtraDataSection title="⛵ Boat Tour" color="blue" data={{
              waterBody: extra.waterBody,
              departureDock: extra.departureDock,
              boatCapacity: extra.boatCapacity,
            }} />
          )}
        </>
      )}

      {/* ═══ ACCOMMODATION ═══ */}
      {subType === "accommodation" && (() => {
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
        
        return (
          <>
            <ExtraDataSection title="Accommodation Details" color="blue" data={{
              accommodationCategory: extra.accommodationCategory || extra.propertyType,
              languages: extra.languages,
              nearbyAttractions: extra.nearbyAttractions,
              ...extra.unitDetails
            }} />
            
            {allUnits.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Accommodation Units</h3>
                <div className="space-y-2">
                  {allUnits.map((unit: any, idx: number) => {
                    const features = [...(unit.features || []), ...(unit.configuration || [])];
                    return (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-bold text-sm text-gray-900">{unit.name || unit.type || "Unit"}</p>
                            <p className="text-[10px] text-gray-500 font-semibold mt-1">
                              {[
                                unit.rentalType && `${unit.rentalType}`,
                                unit.apartmentType && `${unit.apartmentType}`,
                                unit.beds && `${unit.beds}`,
                                unit.bathrooms && `${unit.bathrooms}`,
                                unit.guests && `Max ${unit.guests}`,
                                unit.capacity && `Max ${unit.capacity}`
                              ].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-emerald-600">${unit.price}<span className="text-[10px] text-gray-400 font-normal">/night</span></p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">{unit.remainingRooms || unit.available || 1} left</p>
                          </div>
                        </div>
                        {features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 border-t border-gray-100 pt-2">
                            {features.map((f: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-bold text-gray-600">✓ {f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <ExtraDataSection title="Amenities" color="emerald" data={{ amenities: extra.amenities }} />
            <ExtraDataSection title="Policies" color="amber" data={{
              cancellationPolicy: extra.cancellationPolicy,
              smokingAllowed: extra.smokingAllowed,
              petsAllowed: extra.petsAllowed,
              childrenAllowed: extra.childrenAllowed,
              quietHours: extra.quietHours,
            }} />
            <ExtraDataSection title="Availability" color="red" data={{
              unavailableDates: extra.unavailableDates,
            }} />
            <ExtraDataSection title="Contact" color="gray" data={{
              contactPhone: extra.contactPhone,
              contactEmail: extra.contactEmail,
              website: extra.website,
              instagram: extra.socialMedia?.instagram,
              facebook: extra.socialMedia?.facebook,
              tiktok: extra.socialMedia?.tiktok,
            }} />
          </>
        );
      })()}

      {/* ═══ EVENTS ═══ */}
      {subType === "events" && (
        <>
          <ExtraDataSection title="Event Details" color="purple" data={{
            eventCategory: extra.eventCategory,
            venue: extra.venue,
            eventDate: extra.eventDate,
            endDate: extra.endDate,
            startTime: extra.startTime,
            endTime: extra.endTime,
            expectedAttendance: extra.expectedAttendance,
            ageRestriction: extra.ageRestriction,
            dressCode: extra.dressCode,
            language: extra.language,
          }} />
          {extra.ticketCategories?.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h3 className="text-xs font-bold text-purple-700 uppercase mb-3">🎟 Ticket Categories</h3>
              <div className="space-y-2">
                {extra.ticketCategories.map((t: any) => (
                  <div key={t.id} className="flex justify-between p-2 bg-white rounded-lg border border-purple-100">
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.quantity} tickets</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-purple-600">${t.price}</p>
                      {t.isVIP && <span className="text-[8px] bg-yellow-100 text-yellow-700 px-1.5 rounded font-bold">VIP</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ExtraDataSection title="Contact" color="gray" data={{
            contactPerson: extra.contactPerson,
            phone: extra.phone,
            email: extra.email,
            website: extra.website,
          }} />
        </>
      )}

      {/* ═══ Generic fallback for other types ═══ */}
      {!["parks", "restaurants", "tours", "accommodation", "events"].includes(subType) && (
        <ExtraDataSection
          title="Listing Details"
          color="gray"
          data={Object.fromEntries(
            Object.entries(extra).filter(([k]) => !["listingSubType", "type"].includes(k))
          )}
        />
      )}

      {/* Documents */}
      {listing.documents?.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
            📄 Documents ({listing.documents.length})
          </h3>
          <div className="space-y-1">
            {listing.documents.map((doc: string, i: number) => (
              <a
                key={i}
                href={doc}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline"
              >
                <FileText size={14} /> {doc.split("/").pop()}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Listings Page ──────────────────────────────────────────────────
export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllListings();
      let data: any[] = [];
      if (Array.isArray(res)) data = res;
      else if (res?.listings && Array.isArray(res.listings)) data = res.listings;
      else if (res?.data && Array.isArray(res.data)) data = res.data;
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const safe = Array.isArray(listings) ? listings : [];
  const pending = safe.filter((l) => !l.published && !l.isPublished);
  const active  = safe.filter((l) =>  l.published ||  l.isPublished);
  const displayed = (activeTab === "pending" ? pending : active).filter((l) =>
    !search ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing(true);
      await adminApi.approveListing(id);
      await fetchListings();
      setSelectedListing(null);
      alert("Listing approved and published successfully!");
      setTimeout(() => window.dispatchEvent(new Event("refetch-listings")), 300);
    } catch (err: any) {
      alert(`Failed to approve: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsProcessing(true);
      await adminApi.rejectListing(id);
      await fetchListings();
      setSelectedListing(null);
      alert("Listing rejected and unpublished.");
      setTimeout(() => window.dispatchEvent(new Event("refetch-listings")), 300);
    } catch (err: any) {
      alert(`Failed to reject: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Listings Moderation</h1>
            <p className="text-gray-500 font-medium mt-1">
              Review and approve partner listings before they go live.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/admin/listings/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
            >
              <Sparkles size={18} /> Create Listing
            </Link>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "pending" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Pending ({pending.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Live ({active.length})
              </button>
            </div>
          </div>
        </div>
        {/* Search */}
        <div className="mt-4 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or type..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-emerald-600 flex flex-col items-center">
            <Loader2 className="animate-spin w-10 h-10 mb-4" />
            <p className="font-bold">Fetching listings...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-black text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-500">No {activeTab} listings found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Listing Details</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((l) => {
                const thumb =
                  l.images?.[0] ||
                  l.extraData?.coverImage ||
                  l.extraData?.coverPhoto ||
                  RWANDA_IMAGES.kigali;
                return (
                  <tr
                    key={l.id}
                    className="hover:bg-emerald-50/50 transition cursor-pointer"
                    onClick={() => setSelectedListing(l)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{l.name || "Unnamed Listing"}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{l.location || "No location"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">ID: {l.id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-700">{l.type}</td>
                    <td className="p-4 text-sm font-black text-emerald-700">
                      ${l.price} <span className="text-xs text-gray-400 font-normal">{l.priceLabel}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          activeTab === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {activeTab === "pending" ? "PENDING REVIEW" : "PUBLISHED"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedListing(l); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition"
                      >
                        Review <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Review Modal ── */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{selectedListing.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {selectedListing.type}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedListing.published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {selectedListing.published ? "LIVE" : "PENDING"}
                  </span>
                  <span className="text-xs text-gray-400">ID: {selectedListing.id?.slice(0, 12)}...</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex overflow-hidden flex-1">
              {/* Left: full listing data */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
                <ListingDetailView listing={selectedListing} />
              </div>

              {/* Right: moderation actions */}
              <div className="w-80 shrink-0 border-l border-gray-100 overflow-y-auto p-6 space-y-6 bg-white">
                {/* Action buttons */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Ensure all details meet platform standards.
                  </p>
                  <button
                    onClick={() => handleApprove(selectedListing.id)}
                    disabled={isProcessing || selectedListing.published}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {selectedListing.published
                      ? "✅ Already Live"
                      : isProcessing
                      ? "Processing..."
                      : "Approve & Publish"}
                  </button>
                  <button
                    onClick={() => handleReject(selectedListing.id)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl border-2 border-red-100 text-red-600 font-black hover:bg-red-50 transition disabled:opacity-50"
                  >
                    Reject Listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
