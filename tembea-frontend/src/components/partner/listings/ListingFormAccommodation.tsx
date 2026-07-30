"use client";

import { useState, useEffect } from "react";
import { Upload, X, Calendar, MapPin, Trash2, Plus, Building, Star, Settings, Shield, ImageIcon } from "lucide-react";
import { uploadsApi } from "@/lib/api-client";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import type { AnyListing } from "@/types/listing.types";

type Props = {
  data: Partial<AnyListing>;
  onChange: (data: Partial<AnyListing>) => void;
};

type RoomType = {
  id: string;
  name: string;
  price: number;
  remainingRooms: number;
  guests: number;
  beds: string;
  bathrooms: string;
  features: string[];
};

export function AccommodationForm({ data, onChange }: Props) {
  const { formatRwf } = useExchangeRate();
  const [activeTab, setActiveTab] = useState(1);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>(() => {
    const existing = (data as any).roomTypes;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [apartmentUnits, setApartmentUnits] = useState<any[]>(() => {
    const existing = (data as any).apartmentUnits;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [villaUnits, setVillaUnits] = useState<any[]>(() => {
    const existing = (data as any).villaUnits;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [lodgeRooms, setLodgeRooms] = useState<any[]>(() => {
    const existing = (data as any).lodgeRooms;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [guestHouseRooms, setGuestHouseRooms] = useState<any[]>(() => {
    const existing = (data as any).guestHouseRooms;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [hostelBedTypes, setHostelBedTypes] = useState<any[]>(() => {
    const existing = (data as any).hostelBedTypes;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [resortRoomTypes, setResortRoomTypes] = useState<any[]>(() => {
    const existing = (data as any).resortRoomTypes;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [homestayRooms, setHomestayRooms] = useState<any[]>(() => {
    const existing = (data as any).homestayRooms;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [campsiteUnits, setCampsiteUnits] = useState<any[]>(() => {
    const existing = (data as any).campsiteUnits;
    return existing && Array.isArray(existing) ? existing : [];
  });

  const [documents, setDocuments] = useState<string[]>(() => {
    const existing = (data as any).documents;
    return existing && Array.isArray(existing) ? existing : [];
  });
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    setRoomTypes(Array.isArray((data as any).roomTypes) ? (data as any).roomTypes : []);
    setApartmentUnits(Array.isArray((data as any).apartmentUnits) ? (data as any).apartmentUnits : []);
    setVillaUnits(Array.isArray((data as any).villaUnits) ? (data as any).villaUnits : []);
    setLodgeRooms(Array.isArray((data as any).lodgeRooms) ? (data as any).lodgeRooms : []);
    setGuestHouseRooms(Array.isArray((data as any).guestHouseRooms) ? (data as any).guestHouseRooms : []);
    setHostelBedTypes(Array.isArray((data as any).hostelBedTypes) ? (data as any).hostelBedTypes : []);
    setResortRoomTypes(Array.isArray((data as any).resortRoomTypes) ? (data as any).resortRoomTypes : []);
    setHomestayRooms(Array.isArray((data as any).homestayRooms) ? (data as any).homestayRooms : []);
    setCampsiteUnits(Array.isArray((data as any).campsiteUnits) ? (data as any).campsiteUnits : []);
    setDocuments(Array.isArray((data as any).documents) ? (data as any).documents : []);
  }, [data]);

  // Update room type names based on property type
  const propertyType = (data as any).propertyType;
  
  useEffect(() => {
    if (!propertyType || roomTypes.length === 0) return;
    
    const defaultNames = getDefaultRoomNames(propertyType);
    const updated = roomTypes.map((room, index) => {
      // Only update if the current name is a generic default
      const genericNames = ["Standard Room", "Deluxe Room", "Executive Suite", "Family Suite"];
      if (genericNames.includes(room.name) && index < defaultNames.length) {
        return { ...room, name: defaultNames[index] };
      }
      return room;
    });
    
    // Only update if something changed
    if (JSON.stringify(updated) !== JSON.stringify(roomTypes)) {
      setRoomTypes(updated);
      updateField("roomTypes", updated);
    }
  }, [propertyType]);

  useEffect(() => {
    if (!propertyType) return;
    const currentCategory = (data as any).accommodationCategory;
    if (currentCategory !== propertyType) {
      updateField("accommodationCategory", propertyType);
    }
  }, [propertyType]);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateApartmentUnit = (index: number, field: string, value: any) => {
    const updated = [...apartmentUnits];
    updated[index] = { ...updated[index], [field]: value };
    setApartmentUnits(updated);
    updateField("apartmentUnits", updated);
  };

  const updateVillaUnit = (index: number, field: string, value: any) => {
    const updated = [...villaUnits];
    updated[index] = { ...updated[index], [field]: value };
    setVillaUnits(updated);
    updateField("villaUnits", updated);
  };

  const updateLodgeRoom = (index: number, field: string, value: any) => {
    const updated = [...lodgeRooms];
    updated[index] = { ...updated[index], [field]: value };
    setLodgeRooms(updated);
    updateField("lodgeRooms", updated);
  };

  const updateGuestHouseRoom = (index: number, field: string, value: any) => {
    const updated = [...guestHouseRooms];
    updated[index] = { ...updated[index], [field]: value };
    setGuestHouseRooms(updated);
    updateField("guestHouseRooms", updated);
  };

  const updateHostelBedType = (index: number, field: string, value: any) => {
    const updated = [...hostelBedTypes];
    updated[index] = { ...updated[index], [field]: value };
    setHostelBedTypes(updated);
    updateField("hostelBedTypes", updated);
  };

  const updateResortRoomType = (index: number, field: string, value: any) => {
    const updated = [...resortRoomTypes];
    updated[index] = { ...updated[index], [field]: value };
    setResortRoomTypes(updated);
    updateField("resortRoomTypes", updated);
  };

  const updateHomestayRoom = (index: number, field: string, value: any) => {
    const updated = [...homestayRooms];
    updated[index] = { ...updated[index], [field]: value };
    setHomestayRooms(updated);
    updateField("homestayRooms", updated);
  };

  const updateCampsiteUnit = (index: number, field: string, value: any) => {
    const updated = [...campsiteUnits];
    updated[index] = { ...updated[index], [field]: value };
    setCampsiteUnits(updated);
    updateField("campsiteUnits", updated);
  };

  const removeApartmentUnit = (index: number) => {
    const updated = apartmentUnits.filter((_, i) => i !== index);
    setApartmentUnits(updated);
    updateField("apartmentUnits", updated);
  };

  const removeVillaUnit = (index: number) => {
    const updated = villaUnits.filter((_, i) => i !== index);
    setVillaUnits(updated);
    updateField("villaUnits", updated);
  };

  const removeLodgeRoom = (index: number) => {
    const updated = lodgeRooms.filter((_, i) => i !== index);
    setLodgeRooms(updated);
    updateField("lodgeRooms", updated);
  };

  const removeGuestHouseRoom = (index: number) => {
    const updated = guestHouseRooms.filter((_, i) => i !== index);
    setGuestHouseRooms(updated);
    updateField("guestHouseRooms", updated);
  };

  const removeHostelBedType = (index: number) => {
    const updated = hostelBedTypes.filter((_, i) => i !== index);
    setHostelBedTypes(updated);
    updateField("hostelBedTypes", updated);
  };

  const removeResortRoomType = (index: number) => {
    const updated = resortRoomTypes.filter((_, i) => i !== index);
    setResortRoomTypes(updated);
    updateField("resortRoomTypes", updated);
  };

  const removeHomestayRoom = (index: number) => {
    const updated = homestayRooms.filter((_, i) => i !== index);
    setHomestayRooms(updated);
    updateField("homestayRooms", updated);
  };

  const removeCampsiteUnit = (index: number) => {
    const updated = campsiteUnits.filter((_, i) => i !== index);
    setCampsiteUnits(updated);
    updateField("campsiteUnits", updated);
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: any) => {
    const updated = [...roomTypes];
    updated[index] = { ...updated[index], [field]: value };
    setRoomTypes(updated);
    updateField("roomTypes", updated);
  };

  const addRoomType = () => {
    const newRoom: RoomType = {
      id: Date.now().toString(),
      name: "Standard Room",
      price: 0,
      remainingRooms: 1,
      guests: 2,
      beds: "Double",
      bathrooms: "Private",
      features: [],
    };
    const updated = [...roomTypes, newRoom];
    setRoomTypes(updated);
    updateField("roomTypes", updated);
  };

  const removeRoomType = (index: number) => {
    const updated = roomTypes.filter((_, i) => i !== index);
    setRoomTypes(updated);
    updateField("roomTypes", updated);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const response = await uploadsApi.uploadDocument(file);
        if (response?.url) {
          uploadedUrls.push(response.url);
        } else if (typeof response === 'string') {
          uploadedUrls.push(response);
        }
      }
      
      if (uploadedUrls.length > 0) {
        const updated = [...documents, ...uploadedUrls];
        setDocuments(updated);
        updateField("documents", updated);
      }
    } catch (error) {
      console.error("Document upload failed:", error);
      alert("Failed to upload some documents. Please try again.");
    }
  };

  const handlePropertyImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setImageUploadError(null);
    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const response = await uploadsApi.uploadImage(file);
        if (response?.url) {
          uploadedUrls.push(response.url);
        }
      }

      const currentImages = (data as any).images || [];
      updateField("images", [...currentImages, ...uploadedUrls]);
    } catch (error) {
      console.error("Image upload failed:", error);
      setImageUploadError("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeDocument = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    setDocuments(updated);
    updateField("documents", updated);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
        {[
          { id: 1, label: "Property Info", icon: Building },
          { id: 2, label: "Amenities", icon: Star },
          { id: 3, label: "Policies & Booking", icon: Shield },
          { id: 4, label: "Media & Files", icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold text-sm border-b-4 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in">
      {/* Property Information */}
      <FormSection title="Property Information">
        <Input
          label="Property Name"
          value={(data as any).name || ""}
          onChange={(v: string) => updateField("name", v)}
          placeholder="e.g., Kigali Serena Hotel"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            value={(data as any).city || ""}
            onChange={(v: string) => updateField("city", v)}
            placeholder="e.g., Kigali"
          />
          <Input
            label="Property Type"
            value={(data as any).propertyType || ""}
            onChange={(v: string) => updateField("propertyType", v)}
            options={["Hotel", "Resort", "Lodge", "Guest House", "Apartment", "Villa", "Hostel", "Homestay", "Campsite"]}
            type="select"
          />
        </div>

        {/* Location with Map Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Location</label>
          <input
            type="text"
            value={(data as any).location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="e.g., Kiyovu, Kigali"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
          />
        </div>

        {/* GPS Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude (optional)"
            type="number"
            step="any"
            value={(data as any).coordinates?.lat || ""}
            onChange={(v: string) => {
              const parsed = v === "" ? undefined : parseFloat(v);
              updateField("coordinates", { ...(data as any).coordinates, lat: isNaN(parsed!) ? undefined : parsed });
            }}
            placeholder="-1.9441"
          />
          <Input
            label="Longitude (optional)"
            type="number"
            step="any"
            value={(data as any).coordinates?.lng || ""}
            onChange={(v: string) => {
              const parsed = v === "" ? undefined : parseFloat(v);
              updateField("coordinates", { ...(data as any).coordinates, lng: isNaN(parsed!) ? undefined : parsed });
            }}
            placeholder="30.0619"
          />
        </div>

        {/* Property Description */}
        <Textarea
          label="Property Description"
          value={(data as any).description || ""}
          onChange={(v: string) => updateField("description", v)}
          rows={5}
          placeholder="Describe your property in detail. Include what makes it special, the atmosphere, and any unique features..."
        />
      </FormSection>

        {/* Dynamic Accommodation Configuration */}
      <DynamicAccommodationConfig 
        data={data} 
        updateField={updateField}
        roomTypes={roomTypes}
        updateRoomType={updateRoomType}
        addRoomType={addRoomType}
        removeRoomType={removeRoomType}
        apartmentUnits={apartmentUnits}
        setApartmentUnits={setApartmentUnits}
        updateApartmentUnit={updateApartmentUnit}
        removeApartmentUnit={removeApartmentUnit}
        villaUnits={villaUnits}
        setVillaUnits={setVillaUnits}
        updateVillaUnit={updateVillaUnit}
        removeVillaUnit={removeVillaUnit}
        lodgeRooms={lodgeRooms}
        setLodgeRooms={setLodgeRooms}
        updateLodgeRoom={updateLodgeRoom}
        removeLodgeRoom={removeLodgeRoom}
        guestHouseRooms={guestHouseRooms}
        setGuestHouseRooms={setGuestHouseRooms}
        updateGuestHouseRoom={updateGuestHouseRoom}
        removeGuestHouseRoom={removeGuestHouseRoom}
        hostelBedTypes={hostelBedTypes}
        setHostelBedTypes={setHostelBedTypes}
        updateHostelBedType={updateHostelBedType}
        removeHostelBedType={removeHostelBedType}
        resortRoomTypes={resortRoomTypes}
        setResortRoomTypes={setResortRoomTypes}
        updateResortRoomType={updateResortRoomType}
        removeResortRoomType={removeResortRoomType}
        homestayRooms={homestayRooms}
        setHomestayRooms={setHomestayRooms}
        updateHomestayRoom={updateHomestayRoom}
        removeHomestayRoom={removeHomestayRoom}
        campsiteUnits={campsiteUnits}
        setCampsiteUnits={setCampsiteUnits}
        updateCampsiteUnit={updateCampsiteUnit}
        removeCampsiteUnit={removeCampsiteUnit}
        formatRwf={formatRwf}
      />
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-6 animate-fade-in">
      {/* Amenities */}
      <FormSection title="Amenities">
        <div className="space-y-6">
          {/* Internet & Technology */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Internet & Technology</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Free Wi-Fi", "Smart TV", "Workspace", "Printer"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bedroom */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Bedroom</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["King Bed", "Wardrobe", "Baby Crib", "Extra Bedding"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bathroom */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Bathroom</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Hot Shower", "Towels", "Hair Dryer", "Bathtub"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kitchen */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Kitchen</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Refrigerator", "Microwave", "Coffee Machine", "Kitchenette", "Dining Area"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Wellness */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Wellness</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Swimming Pool", "Gym", "Spa", "Sauna", "Massage"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transportation */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Transportation</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Free Parking", "Airport Pickup", "Car Rental", "Bicycle Rental"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Safety */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Safety</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["24-hour Security", "CCTV", "Fire Safety", "First Aid"].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(data as any).amenities?.includes(amenity) || false}
                    onChange={(e) => {
                      const current = (data as any).amenities || [];
                      if (e.target.checked) {
                        updateField("amenities", [...current, amenity]);
                      } else {
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }
                    }}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Amenity */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Add Custom Amenity</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter custom amenity..."
                className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const customAmenity = input.value.trim();
                    if (customAmenity) {
                      const current = (data as any).amenities || [];
                      if (!current.includes(customAmenity)) {
                        updateField("amenities", [...current, customAmenity]);
                      }
                      input.value = "";
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  const customAmenity = input.value.trim();
                  if (customAmenity) {
                    const current = (data as any).amenities || [];
                    if (!current.includes(customAmenity)) {
                      updateField("amenities", [...current, customAmenity]);
                    }
                    input.value = "";
                  }
                }}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
              >
                Add
              </button>
            </div>
            
            {/* Show selected custom amenities */}
            {(data as any).amenities && (data as any).amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(data as any).amenities.map((amenity: string) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => {
                        const current = (data as any).amenities || [];
                        updateField("amenities", current.filter((a: string) => a !== amenity));
                      }}
                      className="hover:text-emerald-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormSection>
          </div>
        )}

        

        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in">
      {/* Languages Spoken */}
      <FormSection title="Languages Spoken">
        <MultiSelect
          options={["English", "French", "Kinyarwanda", "Swahili", "Spanish", "German", "Italian", "Portuguese", "Mandarin", "Arabic"]}
          selected={(data as any).languages || []}
          onChange={(v: string[]) => updateField("languages", v)}
        />
      </FormSection>

      {/* Nearby Attractions */}
      <FormSection title="Nearby Attractions">
        <Textarea
          label="Nearby Attractions & Points of Interest"
          value={(data as any).nearbyAttractions?.join("\n") || ""}
          onChange={(v: string) => updateField("nearbyAttractions", v.split("\n").filter(Boolean))}
          rows={4}
          placeholder="Enter each attraction on a new line:&#10;Kigali Convention Centre (2 km)&#10;Kigali International Airport (15 km)&#10;Kigali Genocide Memorial (5 km)&#10;Akagera National Park (120 km)"
        />
        <p className="text-xs text-gray-500">Enter each attraction on a new line. You can include distance if relevant.</p>
      </FormSection>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6 animate-fade-in">
      {/* Policies */}
      <FormSection title="Policies">
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50">
            <input
              type="checkbox"
              checked={(data as any).cancellationPolicy || false}
              onChange={(e) => updateField("cancellationPolicy", e.target.checked)}
              className="accent-emerald-600"
            />
            <label className="text-sm font-bold text-gray-700">Free Cancellation Available</label>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50">
            <input
              type="checkbox"
              checked={(data as any).smokingAllowed || false}
              onChange={(e) => updateField("smokingAllowed", e.target.checked)}
              className="accent-emerald-600"
            />
            <label className="text-sm font-bold text-gray-700">Smoking Allowed</label>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50">
            <input
              type="checkbox"
              checked={(data as any).petsAllowed || false}
              onChange={(e) => updateField("petsAllowed", e.target.checked)}
              className="accent-emerald-600"
            />
            <label className="text-sm font-bold text-gray-700">Pets Allowed</label>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50">
            <input
              type="checkbox"
              checked={(data as any).childrenAllowed || false}
              onChange={(e) => updateField("childrenAllowed", e.target.checked)}
              className="accent-emerald-600"
            />
            <label className="text-sm font-bold text-gray-700">Children Allowed</label>
          </div>

          <Input
            label="Quiet Hours (optional)"
            value={(data as any).quietHours || ""}
            onChange={(v: string) => updateField("quietHours", v)}
            placeholder="e.g., 10:00 PM - 6:00 AM"
          />
        </div>
      </FormSection>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in">
      {/* Contact Information */}
      <FormSection title="Contact Information">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Reception Phone"
            value={(data as any).contactPhone || ""}
            onChange={(v: string) => updateField("contactPhone", v)}
            placeholder="+250 788 123 456"
          />
          <Input
            label="Email"
            type="email"
            value={(data as any).contactEmail || ""}
            onChange={(v: string) => updateField("contactEmail", v)}
            placeholder="info@hotel.com"
          />
        </div>

        <Input
          label="Website"
          value={(data as any).website || ""}
          onChange={(v: string) => updateField("website", v)}
          placeholder="https://www.yourhotel.com"
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Instagram"
            value={(data as any).socialMedia?.instagram || ""}
            onChange={(v: string) => updateField("socialMedia", { ...(data as any).socialMedia, instagram: v })}
            placeholder="@username"
          />
          <Input
            label="Facebook"
            value={(data as any).socialMedia?.facebook || ""}
            onChange={(v: string) => updateField("socialMedia", { ...(data as any).socialMedia, facebook: v })}
            placeholder="Page name"
          />
          <Input
            label="TikTok"
            value={(data as any).socialMedia?.tiktok || ""}
            onChange={(v: string) => updateField("socialMedia", { ...(data as any).socialMedia, tiktok: v })}
            placeholder="@username"
          />
        </div>
      </FormSection>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6 animate-fade-in">
      {/* Availability Calendar */}
      <FormSection title="Availability Calendar">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select dates when the property is NOT available for booking.</p>
          
          <div className="flex gap-2">
            <input
              type="date"
              id="unavailable-date"
              className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
            />
            <button
              type="button"
              onClick={() => {
                const dateInput = document.getElementById("unavailable-date") as HTMLInputElement;
                if (dateInput.value) {
                  const currentUnavailable = (data as any).unavailableDates || [];
                  updateField("unavailableDates", [...currentUnavailable, dateInput.value]);
                  dateInput.value = "";
                }
              }}
              className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
            >
              Block Date
            </button>
          </div>

          {/* List of blocked dates */}
          {(data as any).unavailableDates && (data as any).unavailableDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(data as any).unavailableDates.map((date: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
                >
                  <Calendar size={14} className="text-red-600" />
                  <span className="text-sm font-semibold text-red-900">{date}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (data as any).unavailableDates.filter((_: string, i: number) => i !== index);
                      updateField("unavailableDates", updated);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-6 animate-fade-in">
      {/* Property Images */}
      <FormSection title="Property Images">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Upload high-quality photos of your property. The first image will be the cover photo.</p>
          
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isUploadingImages}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;

              handlePropertyImageUpload(files);
            }}
            className="hidden"
            id="property-images"
          />
          
          <label
            htmlFor="property-images"
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl text-gray-600 font-bold transition-all cursor-pointer ${isUploadingImages ? "border-gray-300 bg-gray-100 cursor-not-allowed" : "border-gray-300 hover:border-emerald-500 hover:text-emerald-600"}`}
            aria-disabled={isUploadingImages}
          >
            <Upload size={18} />
            {isUploadingImages ? "Uploading images..." : "Upload Property Photos"}
          </label>

          {imageUploadError && (
            <p className="text-sm text-red-600 mt-2">{imageUploadError}</p>
          )}

          {/* Image preview grid */}
          {(data as any).images && (data as any).images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {(data as any).images.map((img: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentImages = (data as any).images || [];
                      updateField("images", currentImages.filter((_: string, i: number) => i !== index));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Upload at least 5-10 high-quality photos. The first image will be the cover photo.
          </p>
        </div>
      </FormSection>

      {/* Document Upload */}
      <FormSection title="Upload Documents (Optional)">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Upload your business license, hotel license, or other relevant documents.</p>
          
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
            onChange={handleDocumentUpload}
            className="hidden"
            id="document-upload"
          />
          
          <label
            htmlFor="document-upload"
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all cursor-pointer"
          >
            <Upload size={18} />
            Upload Documents
          </label>

          {documents.length > 0 && (
            <div className="space-y-2 mt-3">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <span className="text-sm font-semibold text-blue-900">{doc}</span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic Accommodation Configuration Component
function DynamicAccommodationConfig({
  data,
  updateField,
  roomTypes,
  updateRoomType,
  addRoomType,
  removeRoomType,
  apartmentUnits,
  setApartmentUnits,
  updateApartmentUnit,
  removeApartmentUnit,
  villaUnits,
  setVillaUnits,
  updateVillaUnit,
  removeVillaUnit,
  lodgeRooms,
  setLodgeRooms,
  updateLodgeRoom,
  removeLodgeRoom,
  guestHouseRooms,
  setGuestHouseRooms,
  updateGuestHouseRoom,
  removeGuestHouseRoom,
  hostelBedTypes,
  setHostelBedTypes,
  updateHostelBedType,
  removeHostelBedType,
  resortRoomTypes,
  setResortRoomTypes,
  updateResortRoomType,
  removeResortRoomType,
  homestayRooms,
  setHomestayRooms,
  updateHomestayRoom,
  removeHomestayRoom,
  campsiteUnits,
  setCampsiteUnits,
  updateCampsiteUnit,
  removeCampsiteUnit,
  formatRwf
}: any) {
  const propertyType = (data as any).propertyType;
  const unitDetails = (data as any).unitDetails || {};


  const addApartmentUnit = () => {
    const newApartment = { apartmentType: "", bedrooms: 0, bathrooms: 0, price: 0, features: [] };
    const updated = [...apartmentUnits, newApartment];
    setApartmentUnits(updated);
    updateField("apartmentUnits", updated);
  };
  const addVillaUnit = () => {
    const newVilla = { bedrooms: 0, bathrooms: 0, price: 0, pool: false, features: [] };
    const updated = [...villaUnits, newVilla];
    setVillaUnits(updated);
    updateField("villaUnits", updated);
  };
  const addLodgeRoom = () => {
    const newLodge = { name: "", price: 0, remainingRooms: 0, guests: 0, view: "", features: [] };
    const updated = [...lodgeRooms, newLodge];
    setLodgeRooms(updated);
    updateField("lodgeRooms", updated);
  };
  const addGuestHouseRoom = () => {
    const newGuestHouse = { name: "", price: 0, remainingRooms: 0, guests: 0, bathroom: "", features: [] };
    const updated = [...guestHouseRooms, newGuestHouse];
    setGuestHouseRooms(updated);
    updateField("guestHouseRooms", updated);
  };
  const addHostelBedType = () => {
    const newHostel = { bedType: "", roomType: "", price: 0, remainingBeds: 0, privacy: "", features: [] };
    const updated = [...hostelBedTypes, newHostel];
    setHostelBedTypes(updated);
    updateField("hostelBedTypes", updated);
  };
  const addResortRoomType = () => {
    const newResort = { name: "", price: 0, remainingRooms: 0, guests: 0, view: "", features: [] };
    const updated = [...resortRoomTypes, newResort];
    setResortRoomTypes(updated);
    updateField("resortRoomTypes", updated);
  };
  const addHomestayRoom = () => {
    const newHomestay = { name: "", price: 0, remainingRooms: 0, features: [] };
    const updated = [...homestayRooms, newHomestay];
    setHomestayRooms(updated);
    updateField("homestayRooms", updated);
  };
  const addCampsiteUnit = () => {
    const newCampsite = { name: "", price: 0, remainingRooms: 0, features: [] };
    const updated = [...campsiteUnits, newCampsite];
    setCampsiteUnits(updated);
    updateField("campsiteUnits", updated);
  };
  const updateUnitDetail = (field: string, value: any) => {
    updateField("unitDetails", { ...unitDetails, [field]: value });
  };

  if (!propertyType) {
    return (
      <div className="mt-8 pt-8 border-t-2 border-gray-100">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <Settings size={48} className="text-gray-300 mb-4" />
          <h4 className="text-lg font-black text-gray-800 mb-1">Accommodation Configuration</h4>
          <p className="text-gray-500 font-semibold">Please select a property type first to see the configuration options.</p>
        </div>
      </div>
    );
  }

  const renderHotelFields = () => {
    const hotelRoomTypes = [
      "Standard Room", "Deluxe Room", "Executive Room", "Superior Room",
      "Junior Suite", "Executive Suite", "Presidential Suite",
      "Family Room", "Twin Room", "Double Room", "Single Room", "Connecting Room"
    ];
    const bedTypes = [
      "Single Bed", "Double Bed", "Queen Bed", "King Bed",
      "Twin Beds", "Sofa Bed", "Bunk Bed"
    ];
    const roomConfigItems = [
      "Bedrooms", "Bathrooms", "Living Room", "Kitchen",
      "Dining Room", "Balcony", "Private Compound", "Parking", "Laundry Room"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Room Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available room types for this hotel.</p>
          </div>
          <button 
            type="button"
            onClick={addRoomType}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>

        {(!roomTypes || roomTypes.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Rooms Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific rooms that visitors can book.</p>
            <button type="button" onClick={addRoomType} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {roomTypes.map((room: RoomType, index: number) => (
                <div key={room.id} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">{room.name || `Room Type ${index + 1}`}</h6>
                    <button
                      type="button"
                      onClick={() => removeRoomType(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Room Name */}
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Room Name</label>
                    <input
                      type="text"
                      value={room.name || ""}
                      onChange={(e) => updateRoomType(index, "name", e.target.value)}
                      placeholder="e.g., Deluxe King Room"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                  </div>

                  {/* Price + Quantity */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                      <input
                        type="number"
                        value={room.price || ""}
                        onChange={(e) => updateRoomType(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                      <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(room.price)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Rooms Available</label>
                      <input
                        type="number"
                        value={room.remainingRooms || ""}
                        onChange={(e) => updateRoomType(index, "remainingRooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                    </div>
                  </div>

                  {/* Room Type + Bed Type */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Room Type</label>
                      <select
                        value={(room as any).roomType || ""}
                        onChange={(e) => updateRoomType(index, "roomType", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      >
                        <option value="">Select Room Type...</option>
                        {hotelRoomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bed Type</label>
                      <select
                        value={room.beds || ""}
                        onChange={(e) => updateRoomType(index, "beds", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      >
                        <option value="">Select Bed Type...</option>
                        {bedTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Max Guests + View */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Max Guests</label>
                      <input
                        type="number"
                        value={room.guests || ""}
                        onChange={(e) => updateRoomType(index, "guests", e.target.value === "" ? 0 : parseInt(e.target.value))}
                        placeholder="2"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">View</label>
                      <select
                        value={(room as any).view || ""}
                        onChange={(e) => updateRoomType(index, "view", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      >
                        <option value="">Select View...</option>
                        <option value="City View">City View</option>
                        <option value="Garden View">Garden View</option>
                        <option value="Pool View">Pool View</option>
                        <option value="Ocean View">Ocean View</option>
                        <option value="Mountain View">Mountain View</option>
                        <option value="No View">No View</option>
                      </select>
                    </div>
                  </div>

                  {/* Room Configuration Checkboxes */}
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Configuration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {roomConfigItems.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-400 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={((room as any).configuration || []).includes(item)}
                            onChange={(e) => {
                              const current = (room as any).configuration || [];
                              const updated = e.target.checked
                                ? [...current, item]
                                : current.filter((c: string) => c !== item);
                              updateRoomType(index, "configuration", updated);
                            }}
                            className="accent-emerald-600 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-gray-700 leading-tight">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          

          {/* General Hotel Settings */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">General Settings</h5>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Number of Rooms"
                type="number"
                value={unitDetails.numberOfRooms || ""}
                onChange={(v: string) => updateUnitDetail("numberOfRooms", v === "" ? 0 : parseInt(v))}
                placeholder="e.g., 50"
              />
              <Input
                label="Maximum Guests per Room"
                type="number"
                value={unitDetails.maxGuests || ""}
                onChange={(v: string) => updateUnitDetail("maxGuests", v === "" ? 0 : parseInt(v))}
                placeholder="e.g., 2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input
                label="Standard Bed Type"
                value={unitDetails.bedType || ""}
                onChange={(v: string) => updateUnitDetail("bedType", v)}
                options={bedTypes}
                type="select"
              />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Default Room Type</label>
                <select
                  value={unitDetails.roomType || ""}
                  onChange={(e) => updateUnitDetail("roomType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
                >
                  <option value="">Select Room Type...</option>
                  {hotelRoomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50">
                <input
                  type="checkbox"
                  checked={unitDetails.breakfastIncluded || false}
                  onChange={(e) => updateUnitDetail("breakfastIncluded", e.target.checked)}
                  className="accent-emerald-600"
                />
                <label className="text-sm font-bold text-gray-700">Breakfast Included</label>
              </div>
              <Input
                label="Typical Room View"
                value={unitDetails.roomView || ""}
                onChange={(v: string) => updateUnitDetail("roomView", v)}
                options={["City View", "Garden View", "Pool View", "Ocean View", "Mountain View", "No View"]}
                type="select"
              />
            </div>
          </div>
        </div>
      </>
    );
  };


  const renderApartmentFields = () => {
    const apartmentFeatures = [
      "Living Room", "Dining Room", "Kitchen", "Balcony", 
      "Private Compound", "Garden", "Parking", "Laundry Room", 
      "Store Room", "Elevator"
    ];

    const getFeatureKey = (feature: string) => {
      return feature.toLowerCase().replace(/ /g, '');
    };

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Apartment Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available apartment units.</p>
          </div>
          <button 
            type="button"
            onClick={addApartmentUnit}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Apartment
          </button>
        </div>

        {(!apartmentUnits || apartmentUnits.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Apartments Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific apartments that visitors can book.</p>
            <button type="button" onClick={addApartmentUnit} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Apartment
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {apartmentUnits.map((apt: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">Apartment {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeApartmentUnit(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Apartment Type</label>
                      <select
                        value={apt.apartmentType || ""}
                        onChange={(e) => updateApartmentUnit(index, "apartmentType", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      >
                        <option value="">Select Type...</option>
                        <option value="Studio Apartment">Studio Apartment</option>
                        <option value="1 Bedroom Apartment">1 Bedroom Apartment</option>
                        <option value="2 Bedroom Apartment">2 Bedroom Apartment</option>
                        <option value="3 Bedroom Apartment">3 Bedroom Apartment</option>
                        <option value="4 Bedroom Apartment">4 Bedroom Apartment</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Duplex Apartment">Duplex Apartment</option>
                        <option value="Serviced Apartment">Serviced Apartment</option>
                        <option value="Family Apartment">Family Apartment</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                        <input
                          type="number"
                          value={apt.price || ""}
                          onChange={(e) => updateApartmentUnit(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                        />
                        <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(apt.price)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bedrooms</label>
                        <input
                          type="number"
                          value={apt.bedrooms || ""}
                          onChange={(e) => updateApartmentUnit(index, "bedrooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bathrooms</label>
                        <input
                          type="number"
                          value={apt.bathrooms || ""}
                          onChange={(e) => updateApartmentUnit(index, "bathrooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                      <div className="grid grid-cols-2 gap-2">
                        {apartmentFeatures.map((feature) => (
                          <label key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-all">
                            <input
                              type="checkbox"
                              checked={(apt.features || []).includes(feature)}
                              onChange={(e) => {
                                const currentFeatures = apt.features || [];
                                const newFeatures = e.target.checked
                                  ? [...currentFeatures, feature]
                                  : currentFeatures.filter((f: string) => f !== feature);
                                updateApartmentUnit(index, "features", newFeatures);
                              }}
                              className="accent-emerald-600 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-gray-700">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          <button
            type="button"
            onClick={() => {
              const newApartment = {
                apartmentType: "",
                bedrooms: 0,
                bathrooms: 0,
                price: 0,
                features: []
              };
              const updated = [...apartmentUnits, newApartment];
              setApartmentUnits(updated);
              updateField("apartmentUnits", updated);
            }}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Another Apartment Unit
          </button>
        </div>
      </>
    );
  };

  const renderVillaFields = () => {
    const villaFeatures = [
      "Private Pool", "Garden", "Terrace", "BBQ Area",
      "Private Chef", "Butler Service", "Home Theater", "Gym",
      "Wine Cellar", "Smart Home"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Villa Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available villa units.</p>
          </div>
          <button 
            type="button"
            onClick={addVillaUnit}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Villa
          </button>
        </div>

        {(!villaUnits || villaUnits.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Villas Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific villas that visitors can book.</p>
            <button type="button" onClick={addVillaUnit} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Villa
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {villaUnits.map((villa: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">Villa {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeVillaUnit(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                      <input
                        type="number"
                        value={villa.price || ""}
                        onChange={(e) => updateVillaUnit(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                      <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(villa.price)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bedrooms</label>
                        <input
                          type="number"
                          value={villa.bedrooms || ""}
                          onChange={(e) => updateVillaUnit(index, "bedrooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bathrooms</label>
                        <input
                          type="number"
                          value={villa.bathrooms || ""}
                          onChange={(e) => updateVillaUnit(index, "bathrooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                      <div className="grid grid-cols-2 gap-2">
                        {villaFeatures.map((feature) => (
                          <label key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-all">
                            <input
                              type="checkbox"
                              checked={(villa.features || []).includes(feature)}
                              onChange={(e) => {
                                const currentFeatures = villa.features || [];
                                const newFeatures = e.target.checked
                                  ? [...currentFeatures, feature]
                                  : currentFeatures.filter((f: string) => f !== feature);
                                updateVillaUnit(index, "features", newFeatures);
                              }}
                              className="accent-emerald-600 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-gray-700">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        
        <button
          type="button"
          onClick={() => {
            const newVilla = {
              bedrooms: 0,
              bathrooms: 0,
              price: 0,
              features: []
            };
            const updated = [...villaUnits, newVilla];
            setVillaUnits(updated);
            updateField("villaUnits", updated);
          }}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Another Villa
        </button>
        </div>
      </>
    );
  };

  const renderLodgeFields = () => {
    const lodgeFeatures = [
      "Fireplace", "Mountain View", "Lake View", "Forest View",
      "Private Deck", "Hot Tub", "Sauna", "Restaurant",
      "Bar", "Hiking Trails"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Lodge Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available lodge rooms.</p>
          </div>
          <button 
            type="button"
            onClick={addLodgeRoom}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>

        {(!lodgeRooms || lodgeRooms.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Rooms Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific rooms that visitors can book.</p>
            <button type="button" onClick={addLodgeRoom} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {lodgeRooms.map((room: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">Room {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeLodgeRoom(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                    <input
                      type="number"
                      value={room.price || ""}
                      onChange={(e) => updateLodgeRoom(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                    <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(room.price)}</p>
                  </div>
                  
                  {/* Features */}
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {lodgeFeatures.map((feature) => (
                        <label key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-all">
                          <input
                            type="checkbox"
                            checked={(room.features || []).includes(feature)}
                            onChange={(e) => {
                              const currentFeatures = room.features || [];
                              const newFeatures = e.target.checked
                                ? [...currentFeatures, feature]
                                : currentFeatures.filter((f: string) => f !== feature);
                              updateLodgeRoom(index, "features", newFeatures);
                            }}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span className="text-xs font-semibold text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        
        <button
          type="button"
          onClick={() => {
            const newLodgeRoom = {
              price: 0,
              features: []
            };
            const updated = [...lodgeRooms, newLodgeRoom];
            setLodgeRooms(updated);
            updateField("lodgeRooms", updated);
          }}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Another Lodge Room
        </button>
        </div>
      </>
    );
  };

  const renderGuestHouseFields = () => {
    const guestHouseFeatures = [
      "Shared Kitchen", "Living Room", "Garden", "Patio",
      "Laundry", "Parking", "WiFi", "Breakfast Available",
      "Housekeeping", "Security"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Guest House Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available guest house rooms.</p>
          </div>
          <button 
            type="button"
            onClick={addGuestHouseRoom}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>

        {(!guestHouseRooms || guestHouseRooms.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Rooms Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific rooms that visitors can book.</p>
            <button type="button" onClick={addGuestHouseRoom} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {guestHouseRooms.map((room: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">Room {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeGuestHouseRoom(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                    <input
                      type="number"
                      value={room.price || ""}
                      onChange={(e) => updateGuestHouseRoom(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                    <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(room.price)}</p>
                  </div>
                  
                  {/* Features */}
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {guestHouseFeatures.map((feature) => (
                        <label key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-all">
                          <input
                            type="checkbox"
                            checked={(room.features || []).includes(feature)}
                            onChange={(e) => {
                              const currentFeatures = room.features || [];
                              const newFeatures = e.target.checked
                                ? [...currentFeatures, feature]
                                : currentFeatures.filter((f: string) => f !== feature);
                              updateGuestHouseRoom(index, "features", newFeatures);
                            }}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span className="text-xs font-semibold text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        
        <button
          type="button"
          onClick={() => {
            const newRoom = {
              price: 0,
              features: []
            };
            const updated = [...guestHouseRooms, newRoom];
            setGuestHouseRooms(updated);
            updateField("guestHouseRooms", updated);
          }}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Another Room
        </button>
        </div>
      </>
    );
  };

  const renderHostelFields = () => {
    const hostelFeatures = [
      "Shared Bathroom", "Lockers", "Common Room", "Kitchen Access",
      "Laundry", "WiFi", "Reception 24/7", "Security",
      "Luggage Storage", "Tour Desk"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Hostel Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available bed types.</p>
          </div>
          <button 
            type="button"
            onClick={addHostelBedType}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Bed Type
          </button>
        </div>

        {(!hostelBedTypes || hostelBedTypes.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Bed Types Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific bed types that visitors can book.</p>
            <button type="button" onClick={addHostelBedType} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Bed Type
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {hostelBedTypes.map((bed: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">Bed Type {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeHostelBedType(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                    <input
                      type="number"
                      value={bed.price || ""}
                      onChange={(e) => updateHostelBedType(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                    <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(bed.price)}</p>
                  </div>
                  
                  {/* Features */}
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {hostelFeatures.map((feature) => (
                        <label key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-all">
                          <input
                            type="checkbox"
                            checked={(bed.features || []).includes(feature)}
                            onChange={(e) => {
                              const currentFeatures = bed.features || [];
                              const newFeatures = e.target.checked
                                ? [...currentFeatures, feature]
                                : currentFeatures.filter((f: string) => f !== feature);
                              updateHostelBedType(index, "features", newFeatures);
                            }}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span className="text-xs font-semibold text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        
        <button
          type="button"
          onClick={() => {
            const newBedType = {
              price: 0,
              features: []
            };
            const updated = [...hostelBedTypes, newBedType];
            setHostelBedTypes(updated);
            updateField("hostelBedTypes", updated);
          }}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Another Bed Type
        </button>
        </div>
      </>
    );
  };

  const renderResortFields = () => {
    const resortFeatures = [
      "Spa", "Swimming Pool", "Beach Access", "Restaurant",
      "Bar", "Fitness Center", "Water Sports", "Tennis Court",
      "Kids Club", "Room Service"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Resort Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available resort rooms.</p>
          </div>
          <button 
            type="button"
            onClick={addResortRoomType}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>

        {(!resortRoomTypes || resortRoomTypes.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Rooms Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific rooms that visitors can book.</p>
            <button type="button" onClick={addResortRoomType} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {resortRoomTypes.map((room: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">Room Type {index + 1}</h6>
                    <button
                      type="button"
                      onClick={() => removeResortRoomType(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                    <input
                      type="number"
                      value={room.price || ""}
                      onChange={(e) => updateResortRoomType(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                    <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(room.price)}</p>
                  </div>
                  
                  {/* Features */}
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                    <div className="grid grid-cols-2 gap-2">
                      {resortFeatures.map((feature) => (
                        <label key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-all">
                          <input
                            type="checkbox"
                            checked={(room.features || []).includes(feature)}
                            onChange={(e) => {
                              const currentFeatures = room.features || [];
                              const newFeatures = e.target.checked
                                ? [...currentFeatures, feature]
                                : currentFeatures.filter((f: string) => f !== feature);
                              updateResortRoomType(index, "features", newFeatures);
                            }}
                            className="accent-emerald-600 w-4 h-4"
                          />
                          <span className="text-xs font-semibold text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        
        <button
          type="button"
          onClick={() => {
            const newRoomType = {
              price: 0,
              features: []
            };
            const updated = [...resortRoomTypes, newRoomType];
            setResortRoomTypes(updated);
            updateField("resortRoomTypes", updated);
          }}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-500 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Another Room Type
        </button>
        </div>
      </>
    );
  };


  const renderHomestayFields = () => {
    const homestayFeatures = [
      "Home Cooked Meals", "Cultural Experience", "Garden", "Terrace",
      "WiFi", "Parking", "Laundry", "Kitchen Access",
      "Living Room", "Local Tours"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Homestay Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available homestay rooms.</p>
          </div>
          <button 
            type="button"
            onClick={addHomestayRoom}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Room
          </button>
        </div>

        {(!homestayRooms || homestayRooms.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Rooms Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific rooms that visitors can book.</p>
            <button type="button" onClick={addHomestayRoom} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {homestayRooms.map((room: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">{room.name || `Room ${index + 1}`}</h6>
                    <button
                      type="button"
                      onClick={() => removeHomestayRoom(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Room Name</label>
                    <input
                      type="text"
                      value={room.name || ""}
                      onChange={(e) => updateHomestayRoom(index, "name", e.target.value)}
                      placeholder="e.g., Guest Room 1"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                      <input
                        type="number"
                        value={room.price || ""}
                        onChange={(e) => updateHomestayRoom(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                      <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(room.price)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Rooms Available</label>
                      <input
                        type="number"
                        value={room.remainingRooms || ""}
                        onChange={(e) => updateHomestayRoom(index, "remainingRooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                    <div className="grid grid-cols-3 gap-2">
                      {homestayFeatures.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-400 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={((room as any).features || []).includes(item)}
                            onChange={(e) => {
                              const current = (room as any).features || [];
                              const updated = e.target.checked
                                ? [...current, item]
                                : current.filter((c: string) => c !== item);
                              updateHomestayRoom(index, "features", updated);
                            }}
                            className="accent-emerald-600 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-gray-700 leading-tight">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
        </div>
      </>
    );
  };

  const renderCampsiteFields = () => {
    const campsiteFeatures = [
      "Tent Included", "Sleeping Bag", "BBQ Grill", "Fire Pit",
      "Shared Bathroom", "Electricity", "Water Supply", "Picnic Table"
    ];

    return (
      <>
        
      <div className="space-y-8 animate-fade-in mt-8">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building className="text-emerald-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">Campsite Configuration</h3>
            <p className="text-sm text-gray-500 font-semibold">Add available campsite units.</p>
          </div>
          <button 
            type="button"
            onClick={addCampsiteUnit}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Unit
          </button>
        </div>

        {(!campsiteUnits || campsiteUnits.length === 0) ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <Building size={48} className="text-gray-300 mb-4" />
            <h4 className="text-lg font-black text-gray-800 mb-1">No Units Added</h4>
            <p className="text-gray-500 font-semibold mb-4">You can add specific campsite units that visitors can book.</p>
            <button type="button" onClick={addCampsiteUnit} className="px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 font-bold rounded-xl transition-all">
              Add First Unit
            </button>
          </div>
        ) : (
          <div className="space-y-4">

              {campsiteUnits.map((room: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-bold text-gray-900">{room.name || `Unit ${index + 1}`}</h6>
                    <button
                      type="button"
                      onClick={() => removeCampsiteUnit(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Unit Name</label>
                    <input
                      type="text"
                      value={room.name || ""}
                      onChange={(e) => updateCampsiteUnit(index, "name", e.target.value)}
                      placeholder="e.g., Pitch 1"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price per Night ($)</label>
                      <input
                        type="number"
                        value={room.price || ""}
                        onChange={(e) => updateCampsiteUnit(index, "price", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                      <p className="text-xs font-semibold text-emerald-600 mt-1">{formatRwf(room.price)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Units Available</label>
                      <input
                        type="number"
                        value={room.remainingRooms || ""}
                        onChange={(e) => updateCampsiteUnit(index, "remainingRooms", e.target.value === "" ? 0 : parseInt(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none font-semibold text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
                    <div className="grid grid-cols-3 gap-2">
                      {campsiteFeatures.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border-2 border-gray-200 cursor-pointer hover:border-emerald-400 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={((room as any).features || []).includes(item)}
                            onChange={(e) => {
                              const current = (room as any).features || [];
                              const updated = e.target.checked
                                ? [...current, item]
                                : current.filter((c: string) => c !== item);
                              updateCampsiteUnit(index, "features", updated);
                            }}
                            className="accent-emerald-600 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-gray-700 leading-tight">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
        </div>
      </>
    );
  };

  const renderGenericAccommodationFields = () => {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="font-semibold">Configuration options are not available for this property type yet.</p>
      </div>
    );
  };

  const renderConfiguration = () => {
    switch (propertyType) {
      case "Hotel": return renderHotelFields();
      case "Apartment": return renderApartmentFields();
      case "Villa": return renderVillaFields();
      case "Lodge": return renderLodgeFields();
      case "Guest House": return renderGuestHouseFields();
      case "Hostel": return renderHostelFields();
      case "Resort": return renderResortFields();
      case "Homestay": return renderHomestayFields();
      case "Campsite": return renderCampsiteFields();
      default: return renderGenericAccommodationFields();
    }
  };

  return (
    <div className="mt-8 pt-8 border-t-2 border-gray-100">
      {renderConfiguration()}
    </div>
  );
}

// Helper function to get default room names based on property type
function getDefaultRoomNames(propertyType: string): string[] {
  const roomNames: Record<string, string[]> = {
    "Hotel": ["Standard Room", "Deluxe Room", "Executive Suite", "Family Suite"],
    "Resort": ["Garden View Room", "Pool View Room", "Beach Villa", "Royal Suite"],
    "Lodge": ["Cozy Room", "Comfort Room", "Premium Room", "Family Chalet"],
    "Guest House": ["Basic Room", "Standard Room", "Deluxe Room", "Family Room"],
    "Apartment": ["Studio Apartment", "1 Bedroom Apartment", "2 Bedroom Apartment", "Penthouse"],
    "Villa": ["Garden Villa", "Pool Villa", "Beachfront Villa", "Luxury Villa"],
  };
  
  return roomNames[propertyType] || roomNames["Hotel"];
}
// Helper Components
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-2">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", options, helperText }: any) {
  // Ensure value is never NaN for number inputs
  const safeValue = type === "number" ? (value === undefined || value === null || isNaN(value) ? "" : value) : value;

  if (type === "select") {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <select
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
        >
          <option value="">Select...</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {helperText && <p className="text-xs font-semibold text-emerald-600 mt-1">{helperText}</p>}
      </label>
    );
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <input
        type={type}
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
      />
      {helperText && <p className="text-xs font-semibold text-emerald-600 mt-1">{helperText}</p>}
    </label>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder = "" }: any) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold resize-none"
      />
    </label>
  );
}

function MultiSelect({ options, selected, onChange }: any) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s: string) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option: string) => (
        <button
          key={option}
          type="button"
          onClick={() => toggleOption(option)}
          className={`
            px-4 py-2 rounded-full font-bold text-sm transition-all
            ${selected.includes(option)
              ? "bg-emerald-600 text-white shadow-lg scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {selected.includes(option) && "✓ "}
          {option}
        </button>
      ))}
    </div>
  );
}