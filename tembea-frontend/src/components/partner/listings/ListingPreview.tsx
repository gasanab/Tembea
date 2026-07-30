"use client";

import { 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  Clock, 
  ShoppingCart,
  Heart,
  Share2,
  Award,
  Languages,
  Compass,
  BookOpen,
  Globe,
  Camera,
  UserRound,
  CheckCircle,
  Sun,
  Utensils,
  Navigation,
  Settings
} from "lucide-react";
import type { AnyListing } from "@/types/listing.types";
import { useExchangeRate } from "@/hooks/useExchangeRate";

type Props = {
  data: AnyListing;
};

export function ListingPreview({ data }: Props) {
  if (!data.type) return null;

  switch (data.type) {
    case "accommodation":
      return <AccommodationCard data={data} />;
    case "parks":
      return <ParkCard data={data} />;
    case "events":
      return <EventCard data={data} />;
    case "marketplace":
      return <MarketplaceCard data={data} />;
    case "restaurants":
      return <RestaurantCard data={data} />;
    case "tours":
      return <TourCard data={data} />;
    case "transport":
      return <TransportCard data={data} />;
    case "museums":
      return <MuseumCard data={data} />;
    case "memorial-sites":
      return <MemorialSiteCard data={data} />;
    case "guides":
      return <GuideCard data={data} />;
    default:
      return null;
  }
}

// 1. ACCOMMODATION CARD
function AccommodationCard({ data }: { data: any }) {
  const { formatRwf } = useExchangeRate();
  const roomTypes = data.roomTypes || [];
  const languages = data.languages || [];
  const nearbyAttractions = data.nearbyAttractions || [];
  
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-gray-200 hover:border-emerald-500 shadow-lg hover:shadow-2xl transition-all duration-500">
      {/* Image Carousel */}
      {data.images?.[0] && (
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <img 
            src={data.images[0]} 
            alt={data.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Floating Badges */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black backdrop-blur-sm">
              Available
            </span>
            {data.featured && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black backdrop-blur-sm">
                Featured
              </span>
            )}
          </div>

          {/* Rating */}
          {data.rating && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm">
              <Star size={14} fill="#FFC700" stroke="#FFC700" />
              <span className="text-sm font-black">{data.rating}</span>
            </div>
          )}

          {/* Actions */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all hover:scale-110">
              <Heart size={18} />
            </button>
            <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all hover:scale-110">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {data.name && (
          <div>
            {data.propertyType && (
              <div className="text-xs font-bold text-emerald-600 mb-1">{data.propertyType}</div>
            )}
            <h3 className="text-2xl font-black text-gray-900 mb-1">{data.name}</h3>
            {(data.location || data.city) && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin size={14} />
                <span className="font-semibold">{data.location}{data.location && data.city && ", "}{data.city}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">About This Property</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* Amenities */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              {data.amenities.map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accommodation Units */}
        {(() => {
          const allUnits = [
            ...(data.roomTypes || []),
            ...(data.apartmentUnits || []),
            ...(data.villaUnits || []),
            ...(data.lodgeRooms || []),
            ...(data.guestHouseRooms || []),
            ...(data.hostelBedTypes || []),
            ...(data.resortRoomTypes || []),
            ...(data.homestayRooms || []),
            ...(data.campsiteUnits || [])
          ];

          if (allUnits.length === 0) return null;

          return (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" /> Available Options
              </h4>
              <div className="space-y-4">
                {allUnits.map((unit: any, idx: number) => {
                  const title = unit.name || unit.apartmentType || unit.type || `Unit ${idx + 1}`;
                  const features = [...(unit.features || []), ...(unit.configuration || [])];
                  return (
                    <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-400 transition-all shadow-sm hover:shadow-md">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                        <div>
                          <h5 className="text-lg font-black text-gray-900">{title}</h5>
                          {unit.roomType && <div className="text-xs font-bold text-emerald-600 mb-1">{unit.roomType}</div>}
                          {unit.rentalType && <div className="text-xs font-bold text-emerald-600 mb-1">{unit.rentalType}</div>}
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-600 font-semibold">
                            {unit.guests && <span className="flex items-center gap-1"><Users size={12}/> Max {unit.guests} Guests</span>}
                            {unit.capacity && <span className="flex items-center gap-1"><Users size={12}/> Capacity: {unit.capacity}</span>}
                            {unit.bedrooms && <span>🛏 {unit.bedrooms} Bedrooms</span>}
                            {unit.beds && <span>🛏 {unit.beds}</span>}
                            {unit.bathrooms && <span>🚿 {unit.bathrooms} Bathrooms</span>}
                            {unit.view && <span>👁 {unit.view}</span>}
                            {unit.tentType && <span>⛺ {unit.tentType}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-600">${unit.price || 0}</div>
                          <div className="text-xs font-bold text-emerald-700/70">{formatRwf(unit.price || 0)}</div>
                          <div className="text-xs font-semibold text-gray-500 mt-1">
                            {unit.remainingRooms || unit.available || 1} available
                          </div>
                        </div>
                      </div>
                      
                      {/* Features / Amenities inside the unit */}
                      {features.length > 0 && (
                        <div className="p-4 bg-gray-50">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Unit Features</p>
                          <div className="flex flex-wrap gap-1.5">
                            {features.map((feature: string, fIdx: number) => (
                              <span key={fIdx} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-700">
                                ✓ {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Booking Action */}
                      <div className="p-4 bg-white flex justify-end">
                        <button className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors">
                          Book {title.split(' ')[0]}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Languages Spoken */}
        {languages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages size={14} className="text-emerald-600" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Languages</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.slice(0, 5).map((lang: string) => (
                <span key={lang} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Attractions */}
        {nearbyAttractions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-emerald-600" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nearby</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {nearbyAttractions.slice(0, 4).map((attraction: string, idx: number) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                  {attraction}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        {(data.cancellationPolicy || data.petsAllowed || data.childrenAllowed) && (
          <div className="flex flex-wrap gap-2">
            {data.cancellationPolicy && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">✓ Free Cancellation</span>
            )}
            {data.petsAllowed && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">✓ Pets Allowed</span>
            )}
            {data.childrenAllowed && (
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">✓ Children Welcome</span>
            )}
          </div>
        )}

        {/* Unit Details - Category Specific */}
        {data.unitDetails && (
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {data.accommodationCategory || "Property"} Configuration
            </h4>
            
            {/* Dynamic content based on property type */}
            <div className="space-y-2">
            {/* Room Type for Hotels */}
            {data.unitDetails.roomType && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">🏨 {data.unitDetails.roomType}</span>
              </div>
            )}
            
            {/* Apartment Type for Apartments */}
            {data.unitDetails.apartmentType && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">🏢 {data.unitDetails.apartmentType}</span>
              </div>
            )}
            
            {/* Rental Type */}
            {data.unitDetails.rentalType && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">🔑 {data.unitDetails.rentalType}</span>
              </div>
            )}
            
            {/* Number Fields */}
              {data.unitDetails.numberOfRooms && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">📊 {data.unitDetails.numberOfRooms} Total Rooms</span>
                </div>
              )}
              {data.unitDetails.maxGuests && (
                <div className="flex items-center gap-1 text-gray-700">
                  <Users size={12} />
                  <span className="font-semibold">Max {data.unitDetails.maxGuests} guests</span>
                </div>
              )}
              {data.unitDetails.bedType && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">🛏 {data.unitDetails.bedType}</span>
                </div>
              )}
              {data.unitDetails.roomView && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">👁 {data.unitDetails.roomView}</span>
                </div>
              )}
              {data.unitDetails.breakfastIncluded !== undefined && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">🍳 {data.unitDetails.breakfastIncluded ? "Breakfast Included" : "No Breakfast"}</span>
                </div>
              )}
              
              {/* Apartment/Villa specific */}
              {data.unitDetails.bedrooms && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">🛏 {data.unitDetails.bedrooms} Bedrooms</span>
                </div>
              )}
              {data.unitDetails.bathrooms && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">🚿 {data.unitDetails.bathrooms} Bathrooms</span>
                </div>
              )}
              
              {/* Hostel/Campsite specific */}
              {data.unitDetails.bedsAvailable && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">🛏 {data.unitDetails.bedsAvailable} Beds Available</span>
                </div>
              )}
              {data.unitDetails.tentCapacity && (
                <div className="flex items-center gap-1 text-gray-700">
                  <span className="font-semibold">⛺ {data.unitDetails.tentCapacity} Person Capacity</span>
                </div>
              )}
              
              {/* Boolean Features - dynamically show only selected ones */}
              {(() => {
                const booleanFeatures = [
                  { key: 'livingRoom', label: 'Living Room', icon: '🛋' },
                  { key: 'diningRoom', label: 'Dining Room', icon: '🍽' },
                  { key: 'kitchen', label: 'Kitchen', icon: '🍳' },
                  { key: 'balcony', label: 'Balcony', icon: '🌅' },
                  { key: 'privateCompound', label: 'Private Compound', icon: '🏡' },
                  { key: 'garden', label: 'Garden', icon: '🌳' },
                  { key: 'parking', label: 'Parking', icon: '🚗' },
                  { key: 'laundryRoom', label: 'Laundry Room', icon: '🧺' },
                  { key: 'storeRoom', label: 'Store Room', icon: '📦' },
                  { key: 'elevator', label: 'Elevator', icon: '🛗' },
                  { key: 'swimmingPool', label: 'Swimming Pool', icon: '🏊' },
                  { key: 'bbqArea', label: 'BBQ Area', icon: '🍖' },
                  { key: 'privateChef', label: 'Private Chef', icon: '👨‍🍳' },
                  { key: 'security', label: 'Security', icon: '🔒' },
                  { key: 'natureView', label: 'Nature View', icon: '🏔' },
                  { key: 'campFire', label: 'Camp Fire', icon: '🔥' },
                  { key: 'wildlifeExperience', label: 'Wildlife Experience', icon: '🦁' },
                  { key: 'hikingTrails', label: 'Hiking Trails', icon: '🥾' },
                  { key: 'sharedKitchen', label: 'Shared Kitchen', icon: '🍳' },
                  { key: 'sharedLounge', label: 'Shared Lounge', icon: '🛋' },
                  { key: 'sharedBathroom', label: 'Shared Bathroom', icon: '🚿' },
                  { key: 'lockers', label: 'Lockers', icon: '🔐' },
                  { key: 'spa', label: 'Spa', icon: '💆' },
                  { key: 'kidsClub', label: 'Kids Club', icon: '👶' },
                  { key: 'golf', label: 'Golf', icon: '⛳' },
                  { key: 'conferenceHall', label: 'Conference Hall', icon: '🏢' },
                  { key: 'beachAccess', label: 'Beach Access', icon: '🏖' },
                  { key: 'hostLivesOnProperty', label: 'Host Lives on Property', icon: '👤' },
                  { key: 'mealsIncluded', label: 'Meals Included', icon: '🍽' },
                  { key: 'culturalExperience', label: 'Cultural Experience', icon: '🎭' },
                  { key: 'farmActivities', label: 'Farm Activities', icon: '🚜' },
                  { key: 'firePit', label: 'Fire Pit', icon: '🔥' },
                  { key: 'toilets', label: 'Toilets', icon: '🚽' },
                  { key: 'shower', label: 'Shower', icon: '🚿' },
                  { key: 'electricity', label: 'Electricity', icon: '⚡' },
                  { key: 'waterSupply', label: 'Water Supply', icon: '💧' },
                ];
                
                const activeFeatures = booleanFeatures.filter(f => data.unitDetails[f.key]);
                
                if (activeFeatures.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-200">
                      {activeFeatures.map((feature) => (
                        <span key={feature.key} className="px-2.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                          {feature.icon} {feature.label}
                        </span>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(data.contactPhone || data.website || data.socialMedia) && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {data.contactPhone && (
              <div className="text-xs text-gray-600 font-semibold">📞 {data.contactPhone}</div>
            )}
            {data.contactEmail && (
              <div className="text-xs text-gray-600 font-semibold">✉️ {data.contactEmail}</div>
            )}
            {data.website && (
              <div className="text-xs text-gray-600 font-semibold">🌐 {data.website}</div>
            )}
            {data.socialMedia && (
              <div className="flex flex-wrap gap-2">
                {data.socialMedia.instagram && (
                  <span className="text-xs text-pink-600 font-bold">📷 Instagram</span>
                )}
                {data.socialMedia.facebook && (
                  <span className="text-xs text-blue-600 font-bold">👤 Facebook</span>
                )}
                {data.socialMedia.tiktok && (
                  <span className="text-xs text-gray-900 font-bold">🎵 TikTok</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {data.documents && data.documents.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <BookOpen size={14} className="text-blue-600" /> Documents
            </h4>
            <div className="space-y-1 text-xs font-semibold text-blue-600">
              {data.documents.map((doc: string, idx: number) => (
                <div key={idx} className="truncate">
                  📄 {doc.split('/').pop()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unavailable Dates */}
        {data.unavailableDates && data.unavailableDates.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={14} className="text-red-600" /> Unavailable Dates
            </h4>
            <div className="flex flex-wrap gap-1">
              {data.unavailableDates.slice(0, 5).map((date: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold border border-red-100 rounded-md">
                  {date}
                </span>
              ))}
              {data.unavailableDates.length > 5 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold border border-gray-200 rounded-md">
                  +{data.unavailableDates.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quiet Hours */}
        {data.quietHours && (
          <div className="text-xs text-gray-600 font-semibold">
            🕐 Quiet Hours: {data.quietHours}
          </div>
        )}

        {/* Availability */}
        {data.roomsAvailable && (
          <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-sm font-bold text-emerald-800">Rooms Left</span>
            <span className="text-lg font-black text-emerald-600">{data.roomsAvailable}</span>
          </div>
        )}

        {/* Price & CTA */}
        {data.price && (
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-3xl font-black text-gray-900">${data.price}</div>
              <div className="text-sm font-semibold text-gray-500">per night</div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-emerald-500 transition-all">
                Details
              </button>
              <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-sm hover:shadow-xl transition-all hover:scale-105">
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. NATIONAL PARK CARD
function ParkCard({ data }: { data: any }) {
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-green-300 shadow-lg transition-all duration-500">
      {/* Cover Image */}
      <div className="relative h-72 overflow-hidden bg-green-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        {(data.coverPhoto || data.coverImage) ? (
          <img src={data.coverPhoto || data.coverImage} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-green-300/50">
            <Camera size={48} /><span className="text-sm font-bold mt-2">No Image Uploaded</span>
          </div>
        )}
        {data.parkCategory && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-black shadow-lg">{data.parkCategory}</span>
          </div>
        )}
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <h3 className="text-3xl font-black text-white mb-2 leading-tight">{data.name || "Park Name"}</h3>
          <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
            <MapPin size={16} />
            <span>{data.district ? `${data.district}, ` : ""}{data.province ? `${data.province}, ` : ""}{data.country || "Rwanda"}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        
        {/* Basic Info */}
        {(data.managedBy || data.establishedYear || data.officialWebsite) && (
          <div className="bg-green-50 p-3 rounded-xl border border-green-100 space-y-1">
            {data.managedBy && <p className="text-xs font-semibold text-green-800">🏛 Managed by: <span className="font-black">{data.managedBy}</span></p>}
            {data.establishedYear && <p className="text-xs font-semibold text-green-800">📅 Est: <span className="font-black">{data.establishedYear}</span></p>}
            {data.officialWebsite && <p className="text-xs font-semibold text-green-800">🌐 <span className="font-black">{data.officialWebsite}</span></p>}
          </div>
        )}

        {/* Location */}
        {(data.nearestTown || data.gpsCoordinates) && (
          <div className="text-xs text-gray-600 space-y-1">
            {data.nearestTown && <div className="flex gap-2 font-semibold"><MapPin size={13} className="text-green-600 shrink-0"/> Nearest Town: {data.nearestTown}</div>}
            {data.gpsCoordinates && <div className="flex gap-2 font-semibold"><Globe size={13} className="text-green-600 shrink-0"/> GPS: {data.gpsCoordinates}</div>}
          </div>
        )}

        {/* About */}
        {data.about && <p className="text-sm text-gray-600 font-semibold leading-relaxed">{data.about}</p>}
        {data.history && (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <h4 className="text-[10px] font-black text-amber-700 uppercase mb-1">History</h4>
            <p className="text-xs font-semibold text-amber-900">{data.history}</p>
          </div>
        )}
        {data.conservationStory && (
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-1">Conservation</h4>
            <p className="text-xs font-semibold text-emerald-900">{data.conservationStory}</p>
          </div>
        )}
        {data.landscape && <p className="text-xs text-gray-500 font-semibold italic">{data.landscape}</p>}
        {data.climate && <p className="text-xs text-gray-500 font-semibold">🌤 Climate: {data.climate}</p>}
        {data.visitorExperience && (
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-700 uppercase mb-1">Visitor Experience</h4>
            <p className="text-xs font-semibold text-blue-900">{data.visitorExperience}</p>
          </div>
        )}

        {/* Fees */}
        {(data.adultFee || data.childFee || data.vehicleFee || data.campingFee || data.guideFee) && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-3 flex items-center gap-1">💵 Entry Fees</h4>
            <div className="grid grid-cols-2 gap-2">
              {data.adultFee && <div className="bg-gray-50 p-2 rounded-lg text-xs"><span className="text-gray-400 block">Adult</span><span className="font-black text-green-600">{data.currency || "$"}{data.adultFee}</span></div>}
              {data.childFee && <div className="bg-gray-50 p-2 rounded-lg text-xs"><span className="text-gray-400 block">Child</span><span className="font-black text-green-600">{data.currency || "$"}{data.childFee}</span></div>}
              {data.eastAfricanFee && <div className="bg-gray-50 p-2 rounded-lg text-xs"><span className="text-gray-400 block">E. African</span><span className="font-black text-green-600">{data.currency || "$"}{data.eastAfricanFee}</span></div>}
              {data.vehicleFee && <div className="bg-gray-50 p-2 rounded-lg text-xs"><span className="text-gray-400 block">Vehicle</span><span className="font-black text-green-600">{data.currency || "$"}{data.vehicleFee}</span></div>}
              {data.campingFee && <div className="bg-gray-50 p-2 rounded-lg text-xs"><span className="text-gray-400 block">Camping</span><span className="font-black text-green-600">{data.currency || "$"}{data.campingFee}</span></div>}
              {data.guideFee && <div className="bg-gray-50 p-2 rounded-lg text-xs"><span className="text-gray-400 block">Guide</span><span className="font-black text-green-600">{data.currency || "$"}{data.guideFee}</span></div>}
            </div>
          </div>
        )}

        {/* Capacity */}
        {(data.maxVisitorsPerDay || data.maxGroupSize || data.morningSlots || data.afternoonSlots) && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-3 flex items-center gap-1"><Users size={13}/> Visitor Capacity</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.maxVisitorsPerDay && <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400 block">Max/Day</span><span className="font-black">{data.maxVisitorsPerDay}</span></div>}
              {data.maxGroupSize && <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400 block">Max Group</span><span className="font-black">{data.maxGroupSize}</span></div>}
              {data.morningSlots && <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400 block">Morning Slots</span><span className="font-black">{data.morningSlots}</span></div>}
              {data.afternoonSlots && <div className="bg-gray-50 p-2 rounded-lg"><span className="text-gray-400 block">Afternoon Slots</span><span className="font-black">{data.afternoonSlots}</span></div>}
            </div>
          </div>
        )}

        {/* Opening Hours */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <h4 className="text-[10px] font-black text-gray-800 uppercase flex items-center gap-1 mb-2"><Clock size={12} className="text-green-600"/>Opening Hours</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-semibold text-gray-600">
            {data.mondayOpen && <div className="flex justify-between"><span>Mon</span><span>{data.mondayOpen} – {data.mondayClose}</span></div>}
            {data.tuesdayOpen && <div className="flex justify-between"><span>Tue</span><span>{data.tuesdayOpen} – {data.tuesdayClose}</span></div>}
            {data.wednesdayOpen && <div className="flex justify-between"><span>Wed</span><span>{data.wednesdayOpen} – {data.wednesdayClose}</span></div>}
            {data.thursdayOpen && <div className="flex justify-between"><span>Thu</span><span>{data.thursdayOpen} – {data.thursdayClose}</span></div>}
            {data.fridayOpen && <div className="flex justify-between"><span>Fri</span><span>{data.fridayOpen} – {data.fridayClose}</span></div>}
            {data.saturdayOpen && <div className="flex justify-between"><span>Sat</span><span>{data.saturdayOpen} – {data.saturdayClose}</span></div>}
            {data.sundayOpen && <div className="flex justify-between"><span>Sun</span><span>{data.sundayOpen} – {data.sundayClose}</span></div>}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.openDaily && <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">Open Daily</span>}
            {data.seasonal && <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Seasonal</span>}
          </div>
        </div>

        {/* Wildlife */}
        {data.wildlife && data.wildlife.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">🦁 Wildlife</h4>
            <div className="flex flex-wrap gap-1">
              {data.wildlife.map((w: string) => (
                <span key={w} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold border border-green-100">{w}</span>
              ))}
            </div>
            {data.wildlifeDescription && <p className="text-[10px] text-gray-500 mt-2 font-semibold">{data.wildlifeDescription}</p>}
          </div>
        )}

        {/* Activities */}
        {data.activities && data.activities.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-3">🏃 Activities</h4>
            <div className="space-y-3">
              {data.activities.map((act: any) => (
                <div key={act.id} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black text-sm text-amber-900">{act.name}</span>
                    {act.price && <span className="font-black text-green-600 text-sm">${act.price}</span>}
                  </div>
                  <div className="flex gap-3 text-[10px] font-semibold text-amber-700">
                    {act.duration && <span>⏱ {act.duration}</span>}
                    {act.availableTimes && <span>🕐 {act.availableTimes}</span>}
                    {act.maxGuests && <span>👥 Max {act.maxGuests}</span>}
                    {act.minAge && <span>🔞 Age {act.minAge}+</span>}
                  </div>
                  {act.description && <p className="text-[10px] text-amber-800 mt-1 font-medium">{act.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities */}
        {data.facilities && data.facilities.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">🏨 Facilities</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {data.facilities.map((f: string) => (
                <span key={f} className="text-xs font-semibold text-gray-600 flex items-center gap-1">✓ {f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Best Time */}
        {data.bestMonths && data.bestMonths.length > 0 && (
          <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-2 flex items-center gap-1"><Sun size={12}/> Best Time to Visit</h4>
            <div className="flex flex-wrap gap-1">
              {data.bestMonths.map((m: string) => (
                <span key={m} className="px-2 py-1 bg-sky-100 text-sky-800 rounded-md text-[10px] font-bold">{m}</span>
              ))}
            </div>
            {data.drySeasonDescription && <p className="text-[10px] text-sky-700 mt-2 font-semibold">Dry Season: {data.drySeasonDescription}</p>}
            {data.rainySeasonDescription && <p className="text-[10px] text-sky-700 mt-1 font-semibold">Rainy Season: {data.rainySeasonDescription}</p>}
          </div>
        )}

        {/* What to Bring */}
        {data.whatToBring && data.whatToBring.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">🎒 What to Bring</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {data.whatToBring.map((item: string) => (
                <span key={item} className="text-xs text-gray-600 font-semibold flex items-center gap-1">• {item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Who is it For */}
        {data.suitableFor && data.suitableFor.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">👥 Suitable For</h4>
            <div className="flex flex-wrap gap-1">
              {data.suitableFor.map((s: string) => (
                <span key={s} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold border border-purple-100">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Safety */}
        {(data.emergencyContact || data.rangerAvailable) && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <h4 className="text-[10px] font-black text-red-800 uppercase mb-2">🚨 Safety</h4>
            {data.rangerAvailable && <p className="text-[10px] font-bold text-red-700 mb-1">✓ Ranger Available</p>}
            {data.emergencyContact && <p className="text-[10px] font-semibold text-red-700">Emergency: {data.emergencyContact}</p>}
            {data.medicalCenterInfo && <p className="text-[10px] font-semibold text-red-700">Medical: {data.medicalCenterInfo}</p>}
          </div>
        )}

        {/* Nearby */}
        {(data.hotelsNearby || data.restaurantsNearby || data.transportNearby) && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">📍 Nearby</h4>
            <div className="space-y-1 text-xs font-semibold text-gray-600">
              {data.hotelsNearby && <p>🏨 Hotels: {data.hotelsNearby}</p>}
              {data.restaurantsNearby && <p>🍽 Restaurants: {data.restaurantsNearby}</p>}
              {data.transportNearby && <p>🚌 Transport: {data.transportNearby}</p>}
            </div>
          </div>
        )}

        {/* Reservation */}
        {data.advanceBookingRequired && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h4 className="text-xs font-black text-green-900 mb-2">📋 Booking Info</h4>
            <ul className="text-[10px] font-semibold text-green-800 space-y-1 mb-3">
              {data.bookingWindow && <li>Advance booking: {data.bookingWindow}</li>}
              {data.cancellationPolicy && <li>Cancellation: {data.cancellationPolicy}</li>}
              {(data.minVisitors || data.maxVisitors) && <li>Group size: {data.minVisitors || 1} – {data.maxVisitors || "Unlimited"}</li>}
            </ul>
            <button className="w-full py-3 rounded-xl bg-green-600 text-white font-black hover:bg-green-700 transition-colors shadow-md">
              Reserve Entry
            </button>
          </div>
        )}

        {!data.advanceBookingRequired && (
          <button className="w-full py-3 rounded-xl bg-green-600 text-white font-black hover:bg-green-700 transition-colors">
            View Full Details
          </button>
        )}
      </div>
    </div>
  );
}

// 3. EVENT CARD
function EventCard({ data }: { data: any }) {
  const { formatRwf } = useExchangeRate();
  
  const lowestTicket = (data.ticketCategories || []).reduce((min: any, t: any) => {
    if (!min || t.price < min.price) return t;
    return min;
  }, null);

  const totalTickets = (data.ticketCategories || []).reduce((sum: number, t: any) => sum + (t.quantity || 0), 0);
  const hasVip = (data.ticketCategories || []).some((t: any) => t.name === "VIP" || t.name === "VVIP");
  const isOutdoor = data.indoorOutdoor === "Outdoor";
  const isFamilyFriendly = (data.amenities || []).includes("Child Friendly");

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow-xl overflow-hidden group hover:border-emerald-500 transition-all duration-500">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 overflow-hidden">
        {(data.bannerImage || data.images?.[0]) && (
          <img 
            src={data.bannerImage || data.images?.[0]} 
            alt={data.name || ""} 
            className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-700" 
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        {data.eventCategory && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
            {data.eventCategory}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Gallery Images Preview */}
        {data.galleryImages && data.galleryImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {data.galleryImages.map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-xl shadow-sm border border-gray-100 flex-shrink-0" />
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="font-black text-gray-900 text-xl leading-tight line-clamp-2">
          {data.name || <span className="text-gray-400 italic font-normal">Event Title...</span>}
        </h4>

        {/* Date + Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-emerald-600" />
            <span className="font-semibold">
              {data.startDate || "Date TBD"}
              {data.endDate && data.endDate !== data.startDate && ` – ${data.endDate}`}
            </span>
          </div>
          {data.startTime && (
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <Clock size={16} className="text-emerald-600" />
              <span className="font-bold text-emerald-800">{data.startTime}</span>
            </div>
          )}
        </div>

        {/* Venue */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="font-semibold">
            {data.isOnlineEvent ? (
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">🌐 Online Event</span>
            ) : (
              <div>
                <div className="font-bold text-gray-800 text-base">{data.venueName || "Venue TBD"}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5 leading-relaxed">
                  {[data.streetAddress, data.sector, data.district, data.province, data.country].filter(Boolean).join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Organizer */}
        {data.organizerName && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {data.organizerLogo ? (
              <img src={data.organizerLogo} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users size={14} className="text-emerald-600" />
              </div>
            )}
            <span className="text-sm font-bold text-gray-700">By {data.organizerName}</span>
          </div>
        )}

        {/* Tickets Preview */}
        {data.ticketCategories && data.ticketCategories.length > 0 ? (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Tickets</h5>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{totalTickets.toLocaleString()} Left</span>
            </div>
            <div className="space-y-4">
              {data.ticketCategories.map((t: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 border-2 border-gray-100 hover:border-emerald-300 transition-all space-y-3 shadow-sm">
                  {/* Top row: Name and Price */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-black text-gray-900 flex items-center gap-2 text-lg">
                        <span>{t.icon || "🎟"}</span>
                        {t.name}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 mt-0.5">{formatRwf(t.price)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-700 text-xl">${t.price}</div>
                      {t.quantity > 0 && <div className="text-xs font-bold text-gray-500">{t.quantity} available</div>}
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                    {t.maxPerCustomer && <div>Max {t.maxPerCustomer}/person</div>}
                    {t.seatNumber && <div>Seat: <span className="text-gray-900 font-bold">{t.seatNumber}</span></div>}
                    {t.groupSize ? <div>{t.name === 'Table' ? `${t.groupSize} seats per table` : `${t.groupSize} people`}</div> : null}
                    {(t.salesStart || t.salesEnd) && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Clock size={12} />
                        {t.salesStart || "Now"} - {t.salesEnd || "TBD"}
                      </div>
                    )}
                    {t.refundable && <div className="text-green-600 flex items-center gap-1">✅ Refundable</div>}
                  </div>

                  {/* Benefits */}
                  {t.benefits && t.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.benefits.map((b: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-md">
                          + {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Booking CTA for this specific ticket */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white font-black rounded-lg transition-all text-sm border-2 border-emerald-200 hover:border-emerald-600 flex items-center justify-center gap-2"
                    >
                      <span>🎟</span> Book {t.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400 italic font-semibold">No tickets configured yet</p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-b border-gray-100 pb-4">
          {isOutdoor && <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">🌿 Outdoor</span>}
          {isFamilyFriendly && <span className="px-2.5 py-1 bg-pink-100 text-pink-800 text-xs font-bold rounded-full border border-pink-200">👨‍👩‍👧 Family</span>}
          {(data.tags || []).map((t: string) => (
            <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">{t}</span>
          ))}
          {(data.suitableFor || []).map((s: string) => (
            <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">👥 {s}</span>
          ))}
        </div>

        {/* Full Event Details */}
        <div className="space-y-4 pt-2 text-sm text-gray-600">
          {data.description && (
            <div>
              <h5 className="font-black text-gray-900 mb-1">About the Event</h5>
              <p className="leading-relaxed whitespace-pre-wrap">{data.description}</p>
            </div>
          )}
          
          {data.highlights && (
            <div>
              <h5 className="font-black text-gray-900 mb-1">Highlights</h5>
              <p className="leading-relaxed whitespace-pre-wrap">{data.highlights}</p>
            </div>
          )}

          {data.agenda && (
            <div>
              <h5 className="font-black text-gray-900 mb-1">Agenda</h5>
              <p className="leading-relaxed whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">{data.agenda}</p>
            </div>
          )}

          {/* Practical Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {data.dressCode && (
              <div className="bg-emerald-50 p-3 rounded-xl">
                <span className="block text-xs font-bold text-emerald-800 uppercase mb-0.5">Dress Code</span>
                <span className="font-semibold text-emerald-900">{data.dressCode}</span>
              </div>
            )}
            {data.ageRestriction && (
              <div className="bg-amber-50 p-3 rounded-xl">
                <span className="block text-xs font-bold text-amber-800 uppercase mb-0.5">Age</span>
                <span className="font-semibold text-amber-900">{data.ageRestriction}</span>
              </div>
            )}
          </div>

          {(data.languages && data.languages.length > 0) && (
            <div>
              <h5 className="font-black text-gray-900 mb-1 text-xs uppercase">Languages</h5>
              <div className="flex gap-2">
                {data.languages.map((l: string) => <span key={l} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold">{l}</span>)}
              </div>
            </div>
          )}

          {/* Amenities */}
          {data.amenities && data.amenities.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <h5 className="font-black text-gray-900 mb-2 text-xs uppercase">Amenities</h5>
              <div className="flex flex-wrap gap-2">
                {data.amenities.map((a: string) => (
                  <span key={a} className="flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    ✅ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seating & Capacity */}
          {(data.hasSeats || data.maxAttendance) && (
            <div className="pt-2 border-t border-gray-100">
              <h5 className="font-black text-gray-900 mb-2 text-xs uppercase">Capacity & Seating</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.maxAttendance && <div>Total Capacity: <span className="font-bold text-gray-900">{data.maxAttendance}</span></div>}
                {data.seatedCapacity && <div>Seated: <span className="font-bold text-gray-900">{data.seatedCapacity}</span></div>}
                {data.standingCapacity && <div>Standing: <span className="font-bold text-gray-900">{data.standingCapacity}</span></div>}
                {data.hasSeats && <div>Seating Plan: <span className="font-bold text-emerald-600">Assigned Seats</span></div>}
                {data.seatSections && <div>Sections: <span className="font-bold text-gray-900">{data.seatSections}</span></div>}
              </div>
              {data.seatingMapUrl && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 block mb-1">Seating Map Preview</span>
                  <img src={data.seatingMapUrl} alt="Seating Map" className="h-20 w-full object-cover rounded-xl border border-gray-200" />
                </div>
              )}
            </div>
          )}

          {/* Pricing Rules */}
          {(data.discountCode || data.earlyBirdDiscount || data.studentDiscount || data.bulkDiscount) && (
            <div className="pt-2 border-t border-gray-100">
              <h5 className="font-black text-gray-900 mb-2 text-xs uppercase">Available Discounts</h5>
              <div className="flex flex-wrap gap-2 text-xs">
                {data.discountCode && <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md font-bold">Code: {data.discountCode}</span>}
                {data.earlyBirdDiscount && <span className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-md font-bold">{data.earlyBirdDiscount}% Early Bird</span>}
                {data.studentDiscount && <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold">{data.studentDiscount}% Student</span>}
                {data.bulkDiscount && <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold">{data.bulkDiscount}% Bulk</span>}
              </div>
            </div>
          )}

          {/* Contact & Socials */}
          {(data.contactPerson || data.contactEmail || data.contactPhone || data.facebook || data.instagram || data.twitter) && (
            <div className="pt-2 border-t border-gray-100 bg-gray-50 -mx-5 px-5 py-4 border-b">
              <h5 className="font-black text-gray-900 mb-2 text-xs uppercase">Organizer Contact</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {data.contactPerson && <div>👤 <span className="font-semibold text-gray-800">{data.contactPerson}</span></div>}
                {data.contactPhone && <div>📞 <a href={`tel:${data.contactPhone}`} className="font-semibold text-blue-600 hover:underline">{data.contactPhone}</a></div>}
                {data.contactEmail && <div>✉️ <a href={`mailto:${data.contactEmail}`} className="font-semibold text-blue-600 hover:underline">{data.contactEmail}</a></div>}
                {data.website && <div>🌐 <a href={data.website} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">Website</a></div>}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {data.facebook && <a href={data.facebook} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">🔵 FB</a>}
                {data.instagram && <a href={data.instagram} target="_blank" rel="noreferrer" className="text-pink-600 font-bold text-xs hover:underline flex items-center gap-1">📸 IG</a>}
                {data.tiktok && <a href={data.tiktok} target="_blank" rel="noreferrer" className="text-gray-900 font-bold text-xs hover:underline flex items-center gap-1">🎵 TikTok</a>}
                {data.twitter && <a href={data.twitter} target="_blank" rel="noreferrer" className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1">🐦 X</a>}
                {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 font-bold text-xs hover:underline flex items-center gap-1">💼 LinkedIn</a>}
              </div>
            </div>
          )}

          {/* Event Media Links */}
          {(data.youtubeLink || data.promoVideo) && (
            <div className="pt-2 border-t border-gray-100">
              <h5 className="font-black text-gray-900 mb-2 text-xs uppercase">Media Links</h5>
              <div className="flex flex-col gap-1 text-xs">
                {data.youtubeLink && <a href={data.youtubeLink} target="_blank" rel="noreferrer" className="text-red-600 font-bold hover:underline flex items-center gap-1">▶️ YouTube Video</a>}
                {data.promoVideo && <a href={data.promoVideo} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">🎬 Promo Trailer</a>}
              </div>
            </div>
          )}

          {/* SEO Block (Debug/Preview Only) */}
          {(data.metaTitle || data.metaDescription || data.keywords) && (
            <div className="pt-3 pb-2 border-t border-gray-100">
              <h5 className="font-black text-gray-900 mb-2 text-xs uppercase flex items-center gap-1">🔍 Search Engine Preview</h5>
              <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                <div className="text-[11px] text-gray-500 mb-0.5">https://yourdomain.com/events/...</div>
                <div className="text-sm text-blue-700 font-semibold mb-1 hover:underline cursor-pointer">{data.metaTitle || data.name}</div>
                <div className="text-xs text-gray-600 leading-snug line-clamp-2">{data.metaDescription || data.description || "No description provided."}</div>
                {data.keywords && <div className="mt-2 text-[10px] text-gray-400">Keywords: {data.keywords}</div>}
              </div>
            </div>
          )}

          {/* Policies */}
          {data.policies && data.policies.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <h5 className="font-black text-gray-900 mb-1 text-xs uppercase">Policies</h5>
              <ul className="list-disc list-inside text-xs space-y-1">
                {data.policies.map((p: string) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. MARKETPLACE CARD
function MarketplaceCard({ data }: { data: any }) {
  const rating = data.rating || 4.9;
  const name = data.productName || data.name || "Product Name";
  const cover = data.coverImage || data.images?.[0];
  const price = data.sellingPrice || data.price || 0;
  const currency = data.currency || "$";
  const hasDiscount = data.discountPrice && data.discountPrice < price;

  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-amber-300 hover:border-amber-500 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
      {/* Product Image */}
      {cover && (
        <div className="relative h-64 overflow-hidden bg-amber-50 shrink-0">
          <img 
            src={cover} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {data.madeInRwanda && (
              <span className="px-3 py-1.5 rounded-full bg-green-600 text-white text-[10px] font-black backdrop-blur-sm shadow-lg tracking-wider uppercase flex items-center gap-1">
                <span>🇷🇼</span> Made in Rwanda
              </span>
            )}
            {data.category && (
              <span className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black backdrop-blur-sm shadow-lg uppercase">
                {data.category.replace("-", " ")}
              </span>
            )}
          </div>

          <button className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-red-500 transition-all hover:scale-110 shadow-md">
            <Heart size={18} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
        <div>
          {data.brand && <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{data.brand}</div>}
          <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">{name}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span className="text-xs font-black text-amber-900">{rating}</span>
              <span className="text-[10px] text-amber-700/70 font-bold">({data.reviews || 0})</span>
            </div>
            {data.stockQuantity !== undefined && (
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${data.stockQuantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {data.stockQuantity > 0 ? `${data.stockQuantity} IN STOCK` : 'OUT OF STOCK'}
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-2">
          {hasDiscount ? (
            <>
              <div className="text-2xl font-black text-red-600">{currency}{data.discountPrice}</div>
              <div className="text-sm font-bold text-gray-400 line-through mb-1">{currency}{price}</div>
              <div className="text-[10px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded mb-1.5 ml-2">SALE</div>
            </>
          ) : (
            <div className="text-2xl font-black text-gray-900">{currency}{price}</div>
          )}
          {data.unit && <div className="text-xs font-semibold text-gray-500 mb-1">/ {data.unit}</div>}
        </div>

        {/* Description */}
        {(data.shortDescription || data.description) && (
          <p className="text-xs text-gray-600 font-semibold leading-relaxed border-b border-gray-100 pb-4">
            {data.shortDescription || data.description}
          </p>
        )}

        {/* Dynamic Category Fields */}
        {(data.colors?.length > 0 || data.availableSizes?.length > 0 || data.materialsUsed?.length > 0) && (
          <div className="space-y-3">
            {data.colors?.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase block mb-1.5">Colors</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.colors.map((c: string) => (
                    <span key={c} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {data.availableSizes?.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase block mb-1.5">Sizes</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.availableSizes.map((s: string) => (
                    <span key={s} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border-2 border-gray-200 text-gray-700 text-[10px] font-black">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {data.materialsUsed?.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase block mb-1.5">Materials</span>
                <div className="flex flex-wrap gap-1">
                  {data.materialsUsed.map((m: string) => <span key={m} className="text-xs font-semibold text-gray-600">• {m}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* specific specs */}
        {(data.roastLevel || data.coffeeOrigin || data.fabric || data.jewelryMaterial) && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 mt-2">
            {data.roastLevel && <div className="text-xs"><span className="font-bold text-gray-500">Roast:</span> <span className="font-semibold text-gray-800">{data.roastLevel}</span></div>}
            {data.coffeeOrigin && <div className="text-xs"><span className="font-bold text-gray-500">Origin:</span> <span className="font-semibold text-gray-800">{data.coffeeOrigin}</span></div>}
            {data.fabric && <div className="text-xs"><span className="font-bold text-gray-500">Fabric:</span> <span className="font-semibold text-gray-800">{data.fabric}</span></div>}
            {data.jewelryMaterial && <div className="text-xs"><span className="font-bold text-gray-500">Material:</span> <span className="font-semibold text-gray-800">{data.jewelryMaterial}</span></div>}
            {data.gemstone && <div className="text-xs"><span className="font-bold text-gray-500">Gemstone:</span> <span className="font-semibold text-gray-800">{data.gemstone}</span></div>}
          </div>
        )}

        {/* Features */}
        {data.productFeatures?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {data.productFeatures.map((f: string) => (
              <span key={f} className="px-2 py-1 bg-amber-50 text-amber-800 rounded text-[10px] font-bold flex items-center gap-1">
                <CheckCircle size={10} /> {f}
              </span>
            ))}
          </div>
        )}

        {/* Shipping */}
        {data.deliveryAvailable !== undefined && (
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
            <ShoppingCart size={14} className={data.deliveryAvailable ? "text-green-600" : "text-gray-400"} />
            <div className="text-xs font-bold text-gray-700">
              {data.deliveryAvailable ? (
                data.freeDelivery ? <span className="text-green-600">Free Delivery Available</span> : `Delivery: ${currency}${data.deliveryFee || 0}`
              ) : (
                "Pickup Only"
              )}
            </div>
          </div>
        )}

        {/* Variants Preview */}
        {data.variants?.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-[10px] font-black text-gray-500 uppercase block mb-2">{data.variants.length} Options Available</span>
          </div>
        )}

        {/* Action */}
        <div className="pt-4 mt-auto">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-black hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl">
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. RESTAURANT CARD
function RestaurantCard({ data }: { data: any }) {
  const rating = data.rating || 4.7;
  
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-red-200 shadow-lg transition-all duration-500">
      {/* Header Image */}
      <div className="relative h-56 overflow-hidden bg-red-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        
        {data.coverPhoto ? (
          <img 
            src={data.coverPhoto} 
            alt={data.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-300/50">
            <Camera size={48} />
            <span className="text-sm font-bold mt-2">No Image Uploaded</span>
          </div>
        )}
        
        {data.businessType && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full shadow-lg uppercase tracking-wide">
              {data.businessType}
            </span>
          </div>
        )}

        {data.logo && (
          <div className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white">
            <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-20">
          <h3 className="text-2xl font-black text-white mb-1 leading-tight">{data.name || "Restaurant Name"}</h3>
          {(data.city || data.district) && (
            <div className="flex items-center gap-1 text-white/90 text-xs font-semibold">
              <MapPin size={12} />
              <span>{data.district ? `${data.district}, ` : ""}{data.city || "City"}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        
        {/* Basic Info & Tagline */}
        {(data.tagline || data.ownerName) && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            {data.tagline && <p className="text-sm font-black text-red-700 italic mb-1">"{data.tagline}"</p>}
            {data.ownerName && <p className="text-xs text-red-900/70 font-semibold">Owned by: {data.ownerName}</p>}
          </div>
        )}

        {/* Descriptions */}
        {(data.about || data.history || data.chefStory || data.signatureDishes) && (
          <div className="space-y-3">
            {data.about && <p className="text-sm text-gray-600 font-medium leading-relaxed">{data.about}</p>}
            {data.signatureDishes && (
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                <h4 className="text-[10px] font-black text-orange-800 uppercase mb-1">Signature Dishes</h4>
                <p className="text-xs font-semibold text-orange-900">{data.signatureDishes}</p>
              </div>
            )}
            {data.chefStory && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <h4 className="text-[10px] font-black text-amber-800 uppercase mb-1">Chef's Story</h4>
                <p className="text-xs font-semibold text-amber-900">{data.chefStory}</p>
              </div>
            )}
            {data.history && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <h4 className="text-[10px] font-black text-red-800 uppercase mb-1">History & Awards</h4>
                <p className="text-xs font-semibold text-red-900">{data.history}</p>
              </div>
            )}
            {data.whyVisit && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <h4 className="text-[10px] font-black text-emerald-800 uppercase mb-1">Why Visit</h4>
                <p className="text-xs font-semibold text-emerald-900">{data.whyVisit}</p>
              </div>
            )}
          </div>
        )}

        {/* Location details */}
        {(data.streetAddress || data.nearestLandmark) && (
          <div className="text-xs text-gray-600 font-semibold space-y-1">
            {data.streetAddress && <div className="flex gap-2"><MapPin size={14} className="text-red-500 shrink-0"/> {data.streetAddress}</div>}
            {data.nearestLandmark && <div className="flex gap-2 text-gray-500"><Navigation size={14} className="shrink-0"/> Near: {data.nearestLandmark}</div>}
          </div>
        )}

        {/* Contact Links */}
        {(data.phone || data.whatsapp || data.email || data.website || data.instagram) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {data.phone && <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-md">📞 {data.phone}</span>}
            {data.whatsapp && <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">💬 WhatsApp</span>}
            {data.email && <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">✉️ Email</span>}
            {data.website && <span className="text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-700 rounded-md">🌐 Website</span>}
            {data.instagram && <span className="text-[10px] font-bold px-2 py-1 bg-pink-50 text-pink-700 rounded-md">📸 Insta</span>}
          </div>
        )}

        {/* Categories (Cuisine, Experience, Services) */}
        <div className="space-y-3">
          {data.cuisine && data.cuisine.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Cuisine</h4>
              <div className="flex flex-wrap gap-1">
                {data.cuisine.map((c: string) => (
                  <span key={c} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">{c}</span>
                ))}
              </div>
            </div>
          )}
          {data.diningExperience && data.diningExperience.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Experience</h4>
              <div className="flex flex-wrap gap-1">
                {data.diningExperience.map((e: string) => (
                  <span key={e} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-[10px] font-bold border border-orange-100">{e}</span>
                ))}
              </div>
            </div>
          )}
          {data.services && data.services.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Services</h4>
              <div className="flex flex-wrap gap-1">
                {data.services.map((s: string) => (
                  <span key={s} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specs & Capacity */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          {data.priceRange && <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2"><span className="text-gray-400">Price:</span> <span className="text-green-600 font-black">{data.priceRange}</span></div>}
          {data.averagePricePerPerson && <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2"><span className="text-gray-400">Avg/Pax:</span> <span className="font-black">${data.averagePricePerPerson}</span></div>}
          {data.maxCapacity && <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2"><Users size={12} className="text-gray-400"/> <span className="font-black">{data.maxCapacity} Max</span></div>}
          {(data.indoorSeats || data.outdoorSeats) && <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2"><span className="text-gray-400">Seats:</span> <span className="font-black">{data.indoorSeats || 0} In / {data.outdoorSeats || 0} Out</span></div>}
        </div>

        {/* Operating Hours */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <h4 className="text-[10px] font-black text-gray-800 uppercase flex items-center gap-1 mb-2">
            <Clock size={12} className="text-red-500" /> Operating Hours
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-semibold text-gray-600">
            {data.mondayHours && <div className="flex justify-between"><span>Mon</span> <span>{data.mondayHours}</span></div>}
            {data.tuesdayHours && <div className="flex justify-between"><span>Tue</span> <span>{data.tuesdayHours}</span></div>}
            {data.wednesdayHours && <div className="flex justify-between"><span>Wed</span> <span>{data.wednesdayHours}</span></div>}
            {data.thursdayHours && <div className="flex justify-between"><span>Thu</span> <span>{data.thursdayHours}</span></div>}
            {data.fridayHours && <div className="flex justify-between"><span>Fri</span> <span>{data.fridayHours}</span></div>}
            {data.saturdayHours && <div className="flex justify-between"><span>Sat</span> <span>{data.saturdayHours}</span></div>}
            {data.sundayHours && <div className="flex justify-between"><span>Sun</span> <span>{data.sundayHours}</span></div>}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.isOpen24Hours && <span className="text-[9px] bg-green-100 text-green-800 px-2 rounded-full font-bold">24 Hours</span>}
            {data.isClosedOnSundays && <span className="text-[9px] bg-red-100 text-red-800 px-2 rounded-full font-bold">Closed Sundays</span>}
          </div>
        </div>

        {/* FULL MENU */}
        {data.menuCategories && data.menuCategories.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <Utensils size={16} className="text-red-500" /> Full Menu
            </h4>
            <div className="space-y-4">
              {data.menuCategories.map((cat: any) => (
                <div key={cat.id}>
                  <h5 className="text-xs font-black text-red-700 uppercase mb-2 bg-red-50 px-2 py-1 rounded-md">{cat.name}</h5>
                  <div className="space-y-3">
                    {cat.items.map((item: any) => (
                      <div key={item.id} className="flex gap-3">
                        {item.photo && (
                          <img src={item.photo} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-gray-800 truncate">{item.name}</span>
                            <span className="font-black text-red-600 text-sm ml-2">${item.price}</span>
                          </div>
                          {item.description && <p className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2">{item.description}</p>}
                          <div className="flex gap-1 mt-1">
                            {item.isVegetarian && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 rounded-sm font-bold">VEG</span>}
                            {item.isSpicy && <span className="text-[8px] bg-red-100 text-red-700 px-1.5 rounded-sm font-bold">SPICY</span>}
                            {item.isPopular && <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 rounded-sm font-bold">POPULAR</span>}
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

        {/* Amenities */}
        {data.amenities && data.amenities.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {data.amenities.map((amenity: string) => (
                <span key={amenity} className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                  <CheckCircle size={10} className="text-green-500" /> {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reservation Info */}
        {data.acceptReservations && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <h4 className="text-xs font-black text-red-900 mb-2">Reservation Info</h4>
            <ul className="text-[10px] font-semibold text-red-800 space-y-1 mb-3">
              {data.reservationFee > 0 && <li>Fee: ${data.reservationFee}</li>}
              <li>Guests: {data.minGuests || 1} - {data.maxGuests || "Unlimited"}</li>
              {data.advanceBooking && <li>Advance Notice: {data.advanceBooking}</li>}
              {data.cancellationPolicy && <li>Cancellation: {data.cancellationPolicy}</li>}
            </ul>
            <button className="w-full py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-colors shadow-md">
              Reserve Table Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 6. TOUR CARD
function TourCard({ data }: { data: any }) {
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-cyan-200 shadow-lg transition-all duration-500">
      {/* Cover Image */}
      <div className="relative h-64 overflow-hidden bg-cyan-900">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/90 via-black/20 to-transparent z-10" />
        {data.coverImage ? (
          <img src={data.coverImage} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-cyan-300/50">
            <Camera size={48} /><span className="text-sm font-bold mt-2">No Image Uploaded</span>
          </div>
        )}
        {data.tourCategory && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1.5 rounded-full bg-cyan-500 text-white text-xs font-black backdrop-blur-md shadow-lg">{data.tourCategory}</span>
          </div>
        )}
        {data.isPrivateTour && (
          <div className="absolute top-4 right-4 z-20">
            <span className="px-2 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full">PRIVATE</span>
          </div>
        )}
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <h3 className="text-2xl font-black text-white mb-2 leading-tight">{data.name || "Tour Name"}</h3>
          <div className="flex flex-wrap items-center gap-3 text-white/90 text-xs font-semibold">
            {data.duration && <div className="flex items-center gap-1"><Clock size={12}/> {data.duration}</div>}
            {data.difficulty && <div className="flex items-center gap-1"><Compass size={12}/> {data.difficulty}</div>}
            {data.destination && <div className="flex items-center gap-1"><MapPin size={12}/> {data.destination}</div>}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">

        {/* Key Info Badges */}
        <div className="flex flex-wrap gap-2">
          {data.minAge && <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-bold">Age {data.minAge}+</span>}
          {data.maxParticipants && <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-bold">Max {data.maxParticipants} people</span>}
          {data.languages && data.languages.length > 0 && data.languages.map((l: string) => (
            <span key={l} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold">{l}</span>
          ))}
          {data.isFeatured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">⭐ Featured</span>}
          {data.isPopular && <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">🔥 Popular</span>}
        </div>

        {/* Meeting Point */}
        {data.meetingPoint && (
          <div className="flex gap-2 text-xs font-semibold text-gray-600">
            <MapPin size={14} className="text-cyan-600 shrink-0"/>
            <span>Meet at: {data.meetingPoint}</span>
          </div>
        )}

        {/* Overview */}
        {data.overview && <p className="text-sm text-gray-600 font-medium leading-relaxed">{data.overview}</p>}

        {/* Highlights & Why Choose */}
        {data.highlights && (
          <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-100">
            <h4 className="text-[10px] font-black text-cyan-800 uppercase mb-1">✨ Highlights</h4>
            <p className="text-xs font-semibold text-cyan-900">{data.highlights}</p>
          </div>
        )}
        {data.whyChoose && (
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <h4 className="text-[10px] font-black text-emerald-800 uppercase mb-1">💡 Why Choose This</h4>
            <p className="text-xs font-semibold text-emerald-900">{data.whyChoose}</p>
          </div>
        )}
        {data.whatToExpect && (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <h4 className="text-[10px] font-black text-amber-800 uppercase mb-1">📋 What to Expect</h4>
            <p className="text-xs font-semibold text-amber-900">{data.whatToExpect}</p>
          </div>
        )}

        {/* Pricing */}
        {(data.adultPrice || data.childPrice || data.residentPrice) && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-3 flex items-center gap-1">💵 Pricing</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.adultPrice && <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-100"><span className="text-cyan-500 block text-[10px]">Adult</span><span className="font-black text-cyan-800 text-base">{data.currency || "$"}{data.adultPrice}</span></div>}
              {data.childPrice && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-gray-400 block text-[10px]">Child</span><span className="font-black">{data.currency || "$"}{data.childPrice}</span></div>}
              {data.residentPrice && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-gray-400 block text-[10px]">Resident</span><span className="font-black">{data.currency || "$"}{data.residentPrice}</span></div>}
              {data.eastAfricanPrice && <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-gray-400 block text-[10px]">E. African</span><span className="font-black">{data.currency || "$"}{data.eastAfricanPrice}</span></div>}
            </div>
            {data.groupDiscount > 0 && <p className="text-[10px] text-green-700 font-bold mt-2">✓ Group Discount: {data.groupDiscount}%</p>}
            {data.depositRequired > 0 && <p className="text-[10px] text-gray-500 font-semibold mt-1">Deposit required: {data.currency || "$"}{data.depositRequired}</p>}
          </div>
        )}

        {/* Schedule */}
        {(data.availableDays?.length > 0 || data.startTime || data.seasonalAvailability) && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-800 uppercase mb-2 flex items-center gap-1"><Calendar size={12}/> Schedule</h4>
            {data.availableDays && data.availableDays.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {data.availableDays.map((d: string) => (
                  <span key={d} className="text-[9px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">{d.slice(0,3)}</span>
                ))}
              </div>
            )}
            <div className="text-[10px] font-semibold text-gray-600 space-y-1">
              {data.startTime && <p>Start: {data.startTime}{data.endTime && ` → ${data.endTime}`}</p>}
              {data.repeatSchedule && <p>Schedule: {data.repeatSchedule}</p>}
              {data.seasonalAvailability && <p>Season: {data.seasonalAvailability}</p>}
              {data.bookingCutoff && <p>Book by: {data.bookingCutoff} before</p>}
            </div>
          </div>
        )}

        {/* Category-specific details */}
        {data.tourCategory === "Gorilla Trekking" && (data.gorillaPermitNumber || data.trekkingSector) && (
          <div className="bg-green-50 p-3 rounded-xl border border-green-200">
            <h4 className="text-[10px] font-black text-green-800 uppercase mb-2">🦍 Gorilla Trekking Details</h4>
            <div className="text-[10px] font-semibold text-green-800 space-y-1">
              {data.gorillaPermitNumber && <p>Permit #: {data.gorillaPermitNumber}</p>}
              {data.trekkingSector && <p>Sector: {data.trekkingSector}</p>}
              {data.permitAvailability && <p>Availability: {data.permitAvailability}</p>}
            </div>
          </div>
        )}
        {data.tourCategory === "Safari/Game Drive" && (data.vehicleType || data.gameDriveDuration) && (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
            <h4 className="text-[10px] font-black text-amber-800 uppercase mb-2">🚙 Safari Details</h4>
            <div className="text-[10px] font-semibold text-amber-800 space-y-1">
              {data.vehicleType && <p>Vehicle: {data.vehicleType}</p>}
              {data.gameDriveDuration && <p>Duration: {data.gameDriveDuration}</p>}
              {data.guideIncluded && <p>✓ Guide Included</p>}
              {data.binocularsIncluded && <p>✓ Binoculars Included</p>}
            </div>
          </div>
        )}
        {data.tourCategory === "Hiking" && (data.trailLength || data.mountainName) && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <h4 className="text-[10px] font-black text-gray-800 uppercase mb-2">⛰ Hiking Details</h4>
            <div className="text-[10px] font-semibold text-gray-700 space-y-1">
              {data.mountainName && <p>Mountain: {data.mountainName}</p>}
              {data.trailLength && <p>Trail: {data.trailLength}</p>}
              {data.elevationGain && <p>Elevation gain: {data.elevationGain}</p>}
              {data.estimatedHikingTime && <p>Est. time: {data.estimatedHikingTime}</p>}
            </div>
          </div>
        )}
        {data.tourCategory === "Boat Tour" && (data.waterBody || data.departureDock) && (
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
            <h4 className="text-[10px] font-black text-blue-800 uppercase mb-2">⛵ Boat Tour Details</h4>
            <div className="text-[10px] font-semibold text-blue-800 space-y-1">
              {data.waterBody && <p>Water Body: {data.waterBody}</p>}
              {data.departureDock && <p>Departure: {data.departureDock}</p>}
              {data.boatCapacity && <p>Capacity: {data.boatCapacity} passengers</p>}
              {data.lifeJackets && <p>✓ Life Jackets Provided</p>}
            </div>
          </div>
        )}

        {/* Tour Activities */}
        {data.tourActivities && data.tourActivities.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">🎯 Activities</h4>
            <div className="flex flex-wrap gap-1">
              {data.tourActivities.map((act: string) => (
                <span key={act} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold border border-indigo-100">{act}</span>
              ))}
            </div>
          </div>
        )}

        {/* Full Itinerary */}
        {data.itinerary && data.itinerary.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-3">🗓 Full Itinerary</h4>
            <div className="space-y-4">
              {data.itinerary.map((day: any) => (
                <div key={day.id} className="border-l-2 border-cyan-300 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-cyan-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">Day {day.dayNumber}</span>
                    <span className="font-black text-sm text-gray-800">{day.title}</span>
                  </div>
                  {day.activities && day.activities.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {day.activities.map((act: any) => (
                        <div key={act.id} className="flex gap-2 text-xs">
                          {act.time && <span className="font-black text-cyan-600 shrink-0 w-12">{act.time}</span>}
                          <span className="font-semibold text-gray-600">{act.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Included / Not Included */}
        {(data.included?.length > 0 || data.notIncluded?.length > 0) && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            {data.included && data.included.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-green-700 uppercase mb-2">✅ Included</h4>
                <ul className="space-y-1">
                  {data.included.map((item: string) => (
                    <li key={item} className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                      <CheckCircle size={9} className="text-green-500 shrink-0"/> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.notIncluded && data.notIncluded.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-red-600 uppercase mb-2">❌ Not Included</h4>
                <ul className="space-y-1">
                  {data.notIncluded.map((item: string) => (
                    <li key={item} className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                      <span className="text-red-400">✕</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Requirements & Accessibility */}
        {data.requirements && data.requirements.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">📌 Requirements</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {data.requirements.map((r: string) => (
                <span key={r} className="text-[10px] font-semibold text-gray-600">• {r}</span>
              ))}
            </div>
          </div>
        )}
        {data.accessibility && data.accessibility.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-800 uppercase mb-2">♿ Accessibility</h4>
            <div className="flex flex-wrap gap-1">
              {data.accessibility.map((a: string) => (
                <span key={a} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Pickup */}
        {data.pickupIncluded && (
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-800 uppercase mb-1">🚐 Pickup Included</h4>
            {data.pickupLocations && data.pickupLocations.length > 0 && (
              <p className="text-[10px] font-semibold text-blue-700">{data.pickupLocations.join(", ")}</p>
            )}
            {data.additionalPickupFee > 0 && (
              <p className="text-[10px] text-blue-600 font-semibold">Fee: ${data.additionalPickupFee}</p>
            )}
          </div>
        )}

        {/* Safety */}
        {(data.healthAdvice || data.emergencyContact || data.safetyInstructions) && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <h4 className="text-[10px] font-black text-red-800 uppercase mb-2">🚨 Safety</h4>
            <div className="text-[10px] font-semibold text-red-700 space-y-1">
              {data.healthAdvice && <p>Health: {data.healthAdvice}</p>}
              {data.emergencyContact && <p>Emergency: {data.emergencyContact}</p>}
              {data.safetyInstructions && <p>Instructions: {data.safetyInstructions}</p>}
            </div>
          </div>
        )}

        {/* Cancellation */}
        {data.cancellationPolicy && (
          <div className="text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
            📋 Cancellation: {data.cancellationPolicy}
          </div>
        )}

        {/* Gallery Strip */}
        {data.galleryImages && data.galleryImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.galleryImages.map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
            ))}
          </div>
        )}

        {/* Book Button */}
        <div className="pt-2 border-t border-gray-100">
          {data.adultPrice ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-cyan-800">{data.currency || "$"}{data.adultPrice}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Per Adult</div>
              </div>
              <button className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-700 transition-colors shadow-md">
                Book Tour
              </button>
            </div>
          ) : (
            <button className="w-full py-3 rounded-xl bg-cyan-600 text-white font-black hover:bg-cyan-700 transition-colors">
              View Tour Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 8. MUSEUM CARD
function MuseumCard({ data }: { data: any }) {
  const name = data.museumName || data.name || "Museum Name";
  const cover = data.coverImage || data.images?.[0];
  
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-rose-300 hover:border-rose-500 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
      {/* Image */}
      {cover && (
        <div className="relative h-64 overflow-hidden bg-gray-100 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/90 via-transparent to-transparent z-10" />
          <img src={cover} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <span className="px-4 py-2 rounded-full bg-rose-500 text-white text-sm font-black backdrop-blur-sm shadow-lg flex items-center gap-2">
              🏛️ {data.category || "Museum"}
            </span>
            {data.yearEstablished && (
              <span className="px-3 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm self-start">
                Est. {data.yearEstablished}
              </span>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-20">
            <h3 className="text-3xl font-black text-white mb-2">{name}</h3>
            {data.location && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin size={16} />
                <span className="font-bold">{data.location} {data.city} {data.province}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4 max-h-[600px] flex-1 overflow-y-auto custom-scrollbar">
        {data.description && <p className="text-sm text-gray-600 font-semibold leading-relaxed border-b border-gray-100 pb-3">{data.description}</p>}
        {data.historicalSignificance && (
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
            <div className="text-[10px] font-black text-rose-800 uppercase mb-1">Historical Significance</div>
            <p className="text-xs text-rose-900 font-semibold">{data.historicalSignificance}</p>
          </div>
        )}
        
        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-700">
          {data.website && <div className="flex items-center gap-1"><Globe size={14} className="text-rose-500"/> {data.website}</div>}
          {data.phone && <div className="flex items-center gap-1"><UserRound size={14} className="text-rose-500"/> {data.phone}</div>}
          {data.email && <div className="flex items-center gap-1"><UserRound size={14} className="text-rose-500"/> {data.email}</div>}
          {data.openingHours && <div className="flex items-center gap-1"><Clock size={14} className="text-rose-500"/> {data.openingHours}</div>}
          {data.averageVisitTime && <div className="flex items-center gap-1"><Clock size={14} className="text-rose-500"/> {data.averageVisitTime} visit</div>}
        </div>

        {/* Days & Rules */}
        <div className="flex flex-wrap gap-2 text-xs font-bold pt-2">
          {data.openDays?.map((d: string) => <span key={d} className="px-2 py-1 bg-gray-100 rounded-lg">{d.substring(0,3)}</span>)}
        </div>
        
        {/* Policies */}
        <div className="bg-gray-50 p-3 rounded-xl space-y-2 mt-2">
          <div className="text-[10px] font-black text-gray-500 uppercase">Policies & Guidelines</div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {data.petsAllowed ? <span className="text-green-600">✓ Pets Allowed</span> : <span className="text-red-500">✕ No Pets</span>}
            {data.ticketRequired && <span className="text-blue-600">🎟 Ticket Required</span>}
            {data.photographyPolicy && <span className="text-gray-700">📷 Photo: {data.photographyPolicy}</span>}
            {data.dressCode && <span className="text-gray-700">👗 Dress Code: {data.dressCode}</span>}
            {data.bagPolicy && <span className="text-gray-700">🎒 Bags: {data.bagPolicy}</span>}
          </div>
        </div>

        {data.bestTimeToVisit && <div className="text-xs font-bold text-gray-600">Best time to visit: {data.bestTimeToVisit}</div>}
        {data.accessibility?.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs font-bold">
            {data.accessibility.map((a: string) => <span key={a} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md">♿ {a}</span>)}
          </div>
        )}

        {/* Tags */}
        {(data.collections || data.facilities) && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            {data.collections?.length > 0 && (
              <div>
                <span className="text-xs font-black text-rose-800 uppercase">Collections</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.collections.map((c: string) => <span key={c} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded">{c}</span>)}
                </div>
              </div>
            )}
            {data.facilities?.length > 0 && (
              <div>
                <span className="text-xs font-black text-gray-500 uppercase">Facilities</span>
                <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-bold text-gray-600">
                  {data.facilities.map((f: string) => <span key={f} className="bg-gray-100 px-1.5 py-0.5 rounded">✓ {f}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exhibitions */}
        {data.exhibitions?.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-black text-rose-800 uppercase mb-2 block">Exhibitions</span>
            {data.exhibitions.map((e: any, i: number) => (
              <div key={i} className="mb-2 p-2 bg-rose-50/50 rounded-lg border border-rose-100">
                <div className="font-bold text-gray-900 text-sm flex justify-between">
                  {e.name} 
                  <span className="text-rose-600 text-[10px] uppercase font-black bg-rose-100 px-1.5 py-0.5 rounded">{e.isPermanent ? 'Permanent' : 'Temporary'}</span>
                </div>
                {e.description && <div className="text-xs text-gray-600 mt-1 font-semibold">{e.description}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Guided Tours */}
        {data.guidedTours?.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-black text-blue-800 uppercase mb-2 block">Available Tours</span>
            {data.guidedTours.map((t: any, i: number) => (
              <div key={i} className="mb-2 p-2 bg-blue-50/50 rounded-lg flex justify-between items-center text-sm border border-blue-100">
                <div>
                  <div className="font-bold text-gray-900">{t.guideName}</div>
                  <div className="text-xs text-gray-500 font-semibold">{t.language} • {t.time}</div>
                </div>
                <div className="font-black text-blue-700">${t.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tickets */}
        {data.tickets?.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-[10px] uppercase">
              <CheckCircle size={14} /> Admission Tickets
            </div>
            {data.tickets.map((t: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm mb-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-700">{t.type}</span>
                <span className="font-black text-rose-600">${t.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Media Additions */}
        {data.video && (
          <div className="mt-2 text-xs text-blue-600 font-bold flex items-center gap-1">
             🎥 Video Tour Available
          </div>
        )}
        {data.galleryImages?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
            {data.galleryImages.map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
            ))}
          </div>
        )}

        <div className="pt-4 mt-auto">
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black hover:shadow-xl transition-all">
            Book Museum
          </button>
        </div>
      </div>
    </div>
  );
}

// 9. MEMORIAL SITE CARD
function MemorialSiteCard({ data }: { data: any }) {
  const name = data.siteName || data.name || "Memorial Site";
  const cover = data.coverImage || data.images?.[0];

  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-indigo-300 hover:border-indigo-500 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
      {/* Image */}
      {cover && (
        <div className="relative h-64 overflow-hidden shrink-0 bg-indigo-50">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-transparent to-transparent z-10" />
          <img src={cover} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <span className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-black backdrop-blur-sm shadow-lg flex items-center gap-2">
              🕊️ {data.category || "Memorial Site"}
            </span>
            {data.significanceLevel && (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black backdrop-blur-sm shadow-lg uppercase self-start">
                {data.significanceLevel} Significance
              </span>
            )}
          </div>
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <h3 className="text-3xl font-black text-white mb-2">{name}</h3>
            {(data.location || data.city || data.province) && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin size={16} />
                <span className="font-bold">{data.location} {data.city} {data.province}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
        {data.historicalBackground && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Historical Background</span>
            </div>
            <p className="text-xs text-indigo-900 font-semibold leading-relaxed">{data.historicalBackground}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-700">
          {data.yearEstablished && <div><span className="text-indigo-500">Est:</span> {data.yearEstablished}</div>}
          {data.averageVisitDuration && <div className="flex items-center gap-1"><Clock size={14} className="text-indigo-500"/> {data.averageVisitDuration}</div>}
          {data.openingHours && <div className="flex items-center gap-1"><Clock size={14} className="text-indigo-500"/> {data.openingHours}</div>}
          {data.isFree ? <div className="text-green-600 bg-green-50 px-2 py-1 rounded w-fit">Free Entry</div> : (data.entryFee && <div className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">Entry: ${data.entryFee}</div>)}
        </div>

        {/* Contact info */}
        {(data.website || data.phone || data.email) && (
           <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-600 bg-gray-50 p-2 rounded-lg">
             {data.website && <div>🌐 {data.website}</div>}
             {data.phone && <div>📞 {data.phone}</div>}
             {data.email && <div>✉️ {data.email}</div>}
           </div>
        )}

        {/* Days & Access */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold mt-2">
          {data.openingDays?.map((d: string) => <span key={d} className="px-2 py-1 bg-gray-100 rounded border border-gray-200">{d.substring(0,3)}</span>)}
          {data.parkingAvailable && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">Parking</span>}
          {data.wheelchairAccessible && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">Wheelchair</span>}
          {data.childrenAllowed ? <span className="px-2 py-1 bg-green-50 text-green-700 rounded">Children Allowed</span> : <span className="px-2 py-1 bg-red-50 text-red-700 rounded">No Children</span>}
          {data.audioGuideAvailable && <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">🎧 Audio Guide</span>}
        </div>

        {/* People & Events */}
        {(data.importantEvents || data.famousPeople) && (
          <div className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
            {data.importantEvents && <div><span className="font-black text-gray-500 uppercase text-[10px] block">Important Events</span> <span className="font-semibold text-gray-800">{data.importantEvents}</span></div>}
            {data.famousPeople && <div><span className="font-black text-gray-500 uppercase text-[10px] block">Key Figures</span> <span className="font-semibold text-gray-800">{data.famousPeople}</span></div>}
          </div>
        )}

        {/* Activities & Facilities */}
        {(data.visitorActivities || data.facilities) && (
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {data.visitorActivities?.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase mb-1 block">Activities</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-700">
                  {data.visitorActivities.map((a: string) => <span key={a} className="bg-gray-100 px-2 py-1 rounded">✓ {a}</span>)}
                </div>
              </div>
            )}
            {data.facilities?.length > 0 && (
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase mb-1 block">Facilities</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-700">
                  {data.facilities.map((f: string) => <span key={f} className="bg-gray-100 px-2 py-1 rounded">✓ {f}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guidelines */}
        {(data.dressCode || data.photographyRules || data.respectGuidelines) && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-900 space-y-2 mt-2">
            <div className="font-black uppercase text-[10px] tracking-widest mb-1 flex items-center gap-1">
              🚨 Site Guidelines
            </div>
            {data.dressCode && <div>👗 <span className="font-bold">Dress:</span> {data.dressCode}</div>}
            {data.photographyRules && <div>📷 <span className="font-bold">Photo:</span> {data.photographyRules}</div>}
            {data.respectGuidelines && <div>🙏 <span className="font-bold">Respect:</span> {data.respectGuidelines}</div>}
          </div>
        )}

        {/* Guided Tours */}
        {data.guidedTours?.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-[10px] uppercase">
              <CheckCircle size={14} /> Available Tours
            </div>
            {data.guidedTours.map((t: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm mb-1.5 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                <div>
                  <span className="font-bold text-indigo-900">{t.name}</span>
                  <div className="text-xs text-indigo-600/70 font-bold">{t.duration} • {t.language}</div>
                </div>
                <span className="font-black text-indigo-700">${t.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Media */}
        {data.video && (
          <div className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1 uppercase bg-blue-50 w-fit px-2 py-1 rounded">
             🎥 Video Tour Available
          </div>
        )}
        {data.galleryImages?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
            {data.galleryImages.map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
            ))}
          </div>
        )}

        <div className="pt-4 mt-auto">
          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black hover:shadow-xl transition-all hover:scale-[1.02]">
            Plan Your Visit
          </button>
        </div>
      </div>
    </div>
  );
}

// 10. GUIDE CARD
function GuideCard({ data }: { data: any }) {
  const name = data.displayName || data.fullName || "Guide Name";
  const photo = data.profilePhoto || data.images?.[0];
  const specialties = data.specializations || data.specialties || [];
  const languages = data.languages || [];
  
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-cyan-300 hover:border-cyan-500 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
      {/* Profile Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 p-8 shrink-0">
        {data.promoVideo && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1 uppercase">
            🎥 Video Intro
          </div>
        )}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0">
            {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-cyan-200 flex items-center justify-center"><UserRound size={36} className="text-cyan-600" /></div>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-sm">Tour Guide</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">{name}</h3>
            {data.location && (
              <div className="flex items-center gap-2 mt-1 text-white/80">
                <MapPin size={14} />
                <span className="font-semibold text-xs">{data.location} {data.nationality ? `• ${data.nationality}` : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
        
        {(data.shortIntroduction || data.description) && (
          <div className="border-b border-gray-100 pb-3">
            {data.shortIntroduction && <p className="text-sm text-gray-600 font-semibold leading-relaxed italic mb-1">"{data.shortIntroduction}"</p>}
            {data.description && <p className="text-xs text-gray-500 font-medium leading-relaxed">{data.description}</p>}
          </div>
        )}

        {/* Professional Details */}
        <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
          {data.yearsOfExperience && <div className="flex items-center gap-1"><Award size={14} className="text-cyan-600"/> {data.yearsOfExperience}+ Yrs Exp</div>}
          {data.gender && <div><span className="text-gray-400">Gender:</span> {data.gender}</div>}
          {data.age && <div><span className="text-gray-400">Age:</span> {data.age}</div>}
          {data.tourGuideAssociation && <div><span className="text-gray-400">Assoc:</span> {data.tourGuideAssociation}</div>}
          {data.licenseNumber && <div><span className="text-gray-400">License:</span> {data.licenseNumber}</div>}
        </div>

        {/* Contact Info */}
        {(data.contactPhone || data.email) && (
           <div className="flex items-center gap-4 text-[10px] font-bold text-cyan-800 bg-cyan-50 px-3 py-2 rounded-lg border border-cyan-100">
             {data.contactPhone && <div className="flex items-center gap-1">📞 {data.contactPhone}</div>}
             {data.email && <div className="flex items-center gap-1">✉️ {data.email}</div>}
           </div>
        )}

        <div className="flex flex-wrap gap-2 text-[10px] font-bold mt-2">
          {data.firstAidCertified && <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-100">First Aid</span>}
          {data.driversLicense && <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">Driver</span>}
          {data.insurance && <span className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100">Insured</span>}
          {data.certificates?.length > 0 && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-100">{data.certificates.length} Certificates</span>}
        </div>

        {languages.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-1.5"><Languages size={14} className="text-cyan-600" /><span className="text-[10px] font-black text-gray-500 uppercase">Languages</span></div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string) => <span key={lang} className="px-2 py-1 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">{lang}</span>)}
            </div>
          </div>
        )}

        {specialties.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1.5"><Compass size={14} className="text-cyan-600" /><span className="text-[10px] font-black text-gray-500 uppercase">Specialties</span></div>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec: string) => <span key={spec} className="px-2 py-1 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-100">{spec}</span>)}
            </div>
          </div>
        )}

        {/* Schedule & Availability */}
        <div className="pt-3 border-t border-gray-100">
          <span className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Availability & Booking</span>
          
          {data.weeklySchedule?.length > 0 && (
            <div className="grid grid-cols-2 gap-1 mb-2">
              {data.weeklySchedule.filter((d:any)=>d.isAvailable).map((d:any) => (
                <div key={d.day} className="text-[10px] font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded">
                  <span className="font-bold text-gray-900">{d.day.substring(0,3)}:</span> {d.startTime}-{d.endTime}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-600">
             {data.maximumToursPerDay && <span className="bg-gray-100 px-2 py-1 rounded">Max {data.maximumToursPerDay} tours/day</span>}
             {data.advanceBookingNotice && <span className="bg-gray-100 px-2 py-1 rounded">Notice: {data.advanceBookingNotice} hours</span>}
             {data.vacationDates && <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded">On Vacation: {data.vacationDates}</span>}
             {data.unavailableDates && <span className="bg-gray-100 px-2 py-1 rounded">Busy: {data.unavailableDates}</span>}
          </div>
        </div>

        {/* Pricing Config */}
        {(data.pricePerDay || data.pricePerHalfDay || data.customQuoteBase || data.pricingModel) && (
          <div className="p-4 bg-cyan-50 rounded-xl mt-4 border border-cyan-100">
            <div className="flex justify-between items-center mb-2 border-b border-cyan-100 pb-2">
              <div>
                <div className="text-xs font-bold text-cyan-800 uppercase">{data.pricingModel || "Per Day"}</div>
                {data.additionalHourPrice ? <div className="text-[10px] font-bold text-cyan-600">+${data.additionalHourPrice}/hr extra</div> : null}
              </div>
              <div className="text-3xl font-black text-cyan-900">${data.pricePerDay || data.customQuoteBase || data.pricePerHalfDay || 0}</div>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] font-bold text-cyan-800">
              {data.pricePerHalfDay > 0 && <div>Half Day: ${data.pricePerHalfDay}</div>}
              {data.customQuoteBase > 0 && <div>Custom Base: ${data.customQuoteBase}</div>}
            </div>
          </div>
        )}

        <div className="pt-2 mt-auto">
          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black hover:shadow-xl transition-all hover:scale-[1.02]">
            Book Guide
          </button>
        </div>
      </div>
    </div>
  );
}

// 7. TRANSPORT CARD
function TransportCard({ data }: { data: any }) {
  const name = data.vehicleName || data.name || "Vehicle Name";
  const cover = data.coverImage || data.images?.[0];
  const price = data.basePrice || data.pricePerDay || 0;
  const pricingModel = data.pricingModel || "Per Day";

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "car-rental": return "🚗";
      case "airport-transfer": return "✈️";
      case "taxi": return "🚕";
      case "chauffeur": return "🎩";
      case "motorcycle-rental": return "🏍️";
      case "bicycle-rental": return "🚲";
      case "tour-bus": return "🚌";
      case "boat": return "⛵";
      default: return "🚙";
    }
  };

  const categoryLabel = data.category ? data.category.replace("-", " ").toUpperCase() : "TRANSPORT";

  return (
    <div className="group rounded-3xl overflow-hidden bg-white border-2 border-slate-200 hover:border-slate-400 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
      {/* Vehicle Image */}
      {cover && (
        <div className="relative h-56 overflow-hidden bg-slate-50 shrink-0">
          <img 
            src={cover} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-white text-[10px] font-black backdrop-blur-sm shadow-lg tracking-wider flex items-center gap-1.5">
              <span>{getCategoryIcon(data.category)}</span> {categoryLabel}
            </span>
          </div>

          <button className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-slate-500 transition-all hover:scale-110 shadow-md">
            <Heart size={18} />
          </button>

          {data.instantBooking && (
            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-3 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-black backdrop-blur-sm shadow-lg uppercase flex items-center gap-1">
                <CheckCircle size={10} /> Instant Book
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
        <div>
          {data.brand && <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{data.brand} {data.model} {data.year}</div>}
          <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">{name}</h3>
          
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2">
            <MapPin size={12} className="text-slate-400" />
            <span>{data.pickupAddress || data.district || data.province || "Location"}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-3">
          <div className="flex items-end gap-1">
            <div className="text-2xl font-black text-slate-800">${price}</div>
            <div className="text-xs font-semibold text-gray-500 mb-1">/ {pricingModel}</div>
          </div>
          {data.airportPickupFee > 0 && (
            <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
              +${data.airportPickupFee} Airport
            </div>
          )}
        </div>

        {/* Dynamic Category Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          {data.seats && (
            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <Users size={12} className="text-slate-400"/> 
              <span className="font-black text-slate-700">{data.seats} Seats</span>
            </div>
          )}
          {data.transmission && (
            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <Settings size={12} className="text-slate-400"/> 
              <span className="font-black text-slate-700">{data.transmission}</span>
            </div>
          )}
          {data.fuelType && (
            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">Fuel:</span> 
              <span className="font-black text-slate-700">{data.fuelType}</span>
            </div>
          )}
          {data.passengerCapacity && (
            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <Users size={12} className="text-slate-400"/> 
              <span className="font-black text-slate-700">{data.passengerCapacity} Pax</span>
            </div>
          )}
          {data.busCapacity && (
            <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
              <Users size={12} className="text-slate-400"/> 
              <span className="font-black text-slate-700">{data.busCapacity} Pax</span>
            </div>
          )}
        </div>

        {/* Policies & Inclusion */}
        <div className="space-y-1 pt-1">
          {data.mileageIncluded && <div className="text-xs text-gray-600 font-semibold">• Mileage: {data.mileageIncluded}</div>}
          {data.fuelIncluded !== undefined && <div className="text-xs text-gray-600 font-semibold">• Fuel: {data.fuelIncluded ? "Included" : "Not included"}</div>}
          {data.chauffeurIncluded !== undefined && <div className="text-xs text-gray-600 font-semibold">• Driver: {data.chauffeurIncluded ? "Included" : "Self-drive"}</div>}
          {data.securityDepositRequired && <div className="text-xs text-gray-600 font-semibold">• Deposit: ${data.depositAmount || 0}</div>}
        </div>

        {/* Description */}
        {(data.shortSummary || data.description) && (
          <p className="text-xs text-gray-600 font-semibold leading-relaxed border-t border-gray-100 pt-3">
            {data.shortSummary || data.description}
          </p>
        )}

        {/* Features Tabs */}
        {(data.comfortFeatures?.length > 0 || data.safetyFeatures?.length > 0) && (
          <div className="pt-2">
            <span className="text-[10px] font-black text-gray-500 uppercase block mb-2">Included Features</span>
            <div className="flex flex-wrap gap-1">
              {[...(data.comfortFeatures || []), ...(data.safetyFeatures || []), ...(data.convenienceFeatures || [])].slice(0, 6).map((f: string) => (
                <span key={f} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-[10px] font-bold">
                  {f}
                </span>
              ))}
              {((data.comfortFeatures?.length || 0) + (data.safetyFeatures?.length || 0) + (data.convenienceFeatures?.length || 0)) > 6 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-[10px] font-bold">
                  + {((data.comfortFeatures?.length || 0) + (data.safetyFeatures?.length || 0) + (data.convenienceFeatures?.length || 0)) - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="pt-4 mt-auto">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 text-white font-black hover:bg-slate-900 transition-all shadow-xl hover:shadow-2xl">
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}
