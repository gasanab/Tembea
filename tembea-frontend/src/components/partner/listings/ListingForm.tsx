"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";
import { listingsApi, uploadsApi } from "@/lib/api-client";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { AccommodationForm } from "./ListingFormAccommodation";
import { EventForm } from "./ListingFormEvents";
import { RestaurantForm } from "./ListingFormRestaurants";
import { ParkForm } from "./ListingFormParks";
import { TourForm } from "./ListingFormTours";
import { GuideForm } from "./ListingFormGuides";
import { MemorialSiteForm } from "./ListingFormMemorialSites";
import { MuseumForm } from "./ListingFormMuseums";
import { MarketplaceForm } from "./ListingFormMarketplace";
import { TransportForm } from "./ListingFormTransport";
import type { ListingType, AnyListing } from "@/types/listing.types";

type Props = {
  listingType: ListingType;
  data: Partial<AnyListing>;
  onChange: (data: Partial<AnyListing>) => void;
  onSubmitted?: (listing: any) => void | Promise<void>;
};

const listingTypeToApiType: Record<ListingType, string> = {
  accommodation: "ACCOMMODATION",
  parks: "PARKS",
  events: "EVENTS",
  marketplace: "MARKETPLACE",
  restaurants: "RESTAURANTS",
  tours: "TOURS",
  transport: "TRANSPORT",
  museums: "MUSEUMS",
  "memorial-sites": "MEMORIAL_SITES",
  guides: "GUIDES",
};

const priceFieldByType: Record<ListingType, string> = {
  accommodation: "pricePerNight",
  parks: "entryFee",
  events: "ticketPrice",
  marketplace: "price",
  restaurants: "price",
  tours: "price",
  transport: "pricePerDay",
  museums: "entryFee",
  "memorial-sites": "entryFee",
  guides: "pricePerDay",
};

const priceLabelByType: Record<ListingType, string> = {
  accommodation: "per night",
  parks: "entry fee",
  events: "per ticket",
  marketplace: "per item",
  restaurants: "reservation",
  tours: "per person",
  transport: "per day",
  museums: "entry fee",
  "memorial-sites": "entry fee",
  guides: "per day",
};

export function ListingForm({ listingType, data = {}, onChange, onSubmitted }: Props) {
  const { formatRwf } = useExchangeRate();
  const [formData, setFormData] = useState<Partial<AnyListing>>(data);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const updateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updateArrayField = (field: string, values: string[]) => {
    updateField(field, values);
  };

  // Type-safe property getters
  const getStringProp = (key: string): string => {
    return (formData as any)[key] || "";
  };

  const getNumberProp = (key: string): number | string => {
    return (formData as any)[key] || "";
  };

  const getArrayProp = (key: string): string[] => {
    return (formData as any)[key] || [];
  };

  const getBooleanProp = (key: string): boolean => {
    return (formData as any)[key] || false;
  };

  const getListingName = () => {
    return (
      getStringProp("name") ||
      getStringProp("vehicleName") ||
      getStringProp("fullName")
    );
  };

  const buildListingPayload = () => {
    const rawData = formData as Record<string, any>;
    const priceField = priceFieldByType[listingType];

    // ── Resolve the primary fields per type ─────────────────────────────────
    let name = "";
    let location = "";
    let description = "";
    let price = 0;
    let images: string[] = [];

    if (listingType === "parks") {
      name = rawData.name || "";
      location = [rawData.nearestTown, rawData.district, rawData.province, rawData.country]
        .filter(Boolean).join(", ") || rawData.location || "";
      description = rawData.about || rawData.description || "";
      price = Number(rawData.adultFee ?? rawData.price ?? 0);
      images = rawData.wildlifePhotos?.length > 0
        ? rawData.wildlifePhotos
        : rawData.landscapePhotos?.length > 0
        ? rawData.landscapePhotos
        : rawData.coverImage ? [rawData.coverImage] : rawData.images || [];
    } else if (listingType === "restaurants") {
      name = rawData.name || "";
      location = [rawData.streetAddress, rawData.sector, rawData.district, rawData.city, rawData.country]
        .filter(Boolean).join(", ") || rawData.location || "";
      description = rawData.tagline || rawData.description || "";
      price = Number(rawData.averagePricePerPerson ?? rawData.price ?? 0);
      images = rawData.galleryImages?.length > 0
        ? rawData.galleryImages
        : rawData.coverPhoto ? [rawData.coverPhoto] : rawData.images || [];
    } else if (listingType === "tours") {
      name = rawData.name || "";
      location = [rawData.destination, rawData.district, rawData.province]
        .filter(Boolean).join(", ") || rawData.location || "";
      description = rawData.overview || rawData.description || "";
      price = Number(rawData.adultPrice ?? rawData.price ?? 0);
      images = rawData.galleryImages?.length > 0
        ? rawData.galleryImages
        : rawData.coverImage ? [rawData.coverImage] : rawData.images || [];
    } else if (listingType === "accommodation") {
      name = rawData.name || rawData.propertyName || "";
      location = rawData.location || rawData.destination || rawData.venue || "";
      description = rawData.description || "";
      // Auto-calculate base price from roomTypes
      if (Array.isArray(rawData.roomTypes) && rawData.roomTypes.length > 0) {
        const validPrices = rawData.roomTypes
          .map((r: any) => Number(r.price))
          .filter((p: number) => !isNaN(p) && p > 0);
        if (validPrices.length > 0) {
          price = Math.min(...validPrices);
        }
      }
      price = price || Number(rawData[priceField] ?? rawData.price ?? 0);
      images = rawData.images?.length > 0
        ? rawData.images
        : [rawData.bannerImage, rawData.profilePhoto].filter(Boolean);
    } else {
      // Generic fallback for marketplace, transport, museums, etc.
      name = getListingName();
      location = rawData.location || rawData.destination || rawData.venue || "";
      description = rawData.description || "";
      price = Number(rawData[priceField] ?? rawData.price ?? 0);
      images = rawData.images?.length > 0
        ? rawData.images
        : [rawData.bannerImage, rawData.profilePhoto].filter(Boolean);
    }

    const city = rawData.city || "";
    const region = rawData.region || city || location.split(",")[0] || "Rwanda";
    const coordinates = rawData.coordinates;
    const documents = rawData.documents;

    // ── Validate ────────────────────────────────────────────────────────────
    if (!name || name.length < 3) {
      throw new Error("Add a listing name with at least 3 characters.");
    }
    if (!location) {
      throw new Error("Add a location for this listing (e.g. city, district, or address).");
    }
    if (!description || description.length < 10) {
      throw new Error("Add a description with at least 10 characters.");
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Add a valid price for this listing.");
    }

    // ── Build extraData (everything except top-level fields) ────────────────
    const excludedTopLevelKeys = [
      "type", "name", "location", "region", "city",
      "description", "images", "price", "priceLabel",
      "featured", "coordinates", "documents", priceField,
    ];

    const extraData = Object.entries(rawData).reduce((acc, [key, value]) => {
      if (!excludedTopLevelKeys.includes(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      type: listingTypeToApiType[listingType],
      name,
      location,
      region,
      city: city || undefined,
      description,
      images: images.filter(Boolean),
      price,
      priceLabel: priceLabelByType[listingType],
      featured: Boolean(rawData.featured),
      coordinates: coordinates || undefined,
      documents: Array.isArray(documents) ? documents : undefined,
      extraData: {
        ...extraData,
        // Preserve original type for the admin to render the correct preview
        listingSubType: listingType,
      },
    };
  };


  const handlePublish = async () => {
    setPublishError(null);
    setPublishSuccess(null);
    setIsPublishing(true);

    try {
      const payload = buildListingPayload();
      console.log("Submitting listing:", payload);
      
      let result;
      const isEditing = Boolean(data?.id);
      
      if (isEditing) {
        result = await listingsApi.update(data.id as string, payload);
        console.log("Listing updated:", result);
        setPublishSuccess("✅ Listing updated successfully!");
      } else {
        result = await listingsApi.create(payload);
        console.log("Listing created:", result);
        setPublishSuccess("✅ Listing submitted for approval! Our admin team will review it shortly. Once approved, it will be visible to all users for booking, wishlisting, and reviews.");
      }
      
      onChange({});
      setFormData({});
      if (onSubmitted) {
        await onSubmitted(result);
      }
    } catch (error: any) {
      console.error("Failed to submit listing:", error);
      const errorMessage = error?.message || "Failed to submit listing. Please try again.";
      
      // Provide more helpful error messages
      if (errorMessage.includes("Partner profile not found")) {
        setPublishError("❌ Partner profile not found. Please complete your partner registration before creating listings. Support if you need help.");
      } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setPublishError("❌ Session expired. Please log out and log in again.");
      } else {
        setPublishError(`❌ ${errorMessage}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const renderAccommodationForm = () => (
    <AccommodationForm 
      data={formData} 
      onChange={(updatedData) => {
        setFormData(updatedData);
        onChange(updatedData);
      }} 
    />
  );

  const renderParksForm = () => (
    <ParkForm
      data={formData as any}
      onChange={(updated) => {
        setFormData(updated as any);
        onChange(updated as any);
      }}
    />
  );

  const renderEventsForm = () => (
    <EventForm
      data={formData as any}
      onChange={(updated) => {
        setFormData(updated as any);
        onChange(updated as any);
      }}
    />
  );

  const renderMarketplaceForm = () => (
    <MarketplaceForm
      data={formData as any}
      updateField={(field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
      }}
    />
  );

  const renderRestaurantForm = () => (
    <RestaurantForm
      data={formData as any}
      onChange={(updated) => {
        setFormData(updated as any);
        onChange(updated as any);
      }}
    />
  );

  const renderToursForm = () => (
    <TourForm
      data={formData as any}
      onChange={(updated) => {
        setFormData(updated as any);
        onChange(updated as any);
      }}
    />
  );

  const renderTransportForm = () => (
    <TransportForm
      data={formData as any}
      updateField={(field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
      }}
    />
  );

  const renderMuseumForm = () => (
    <MuseumForm
      data={formData as any}
      updateField={(field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
      }}
    />
  );

  const renderMemorialSiteForm = () => (
    <MemorialSiteForm
      data={formData as any}
      updateField={(field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
      }}
    />
  );

  const renderGuideForm = () => (
    <GuideForm
      data={formData as any}
      updateField={(field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onChange(updated);
      }}
    />
  );

  return (
    <div className="space-y-6">
      {listingType === "accommodation" && renderAccommodationForm()}
      {listingType === "parks" && renderParksForm()}
      {listingType === "events" && renderEventsForm()}
      {listingType === "marketplace" && renderMarketplaceForm()}
      {listingType === "restaurants" && renderRestaurantForm()}
      {listingType === "tours" && renderToursForm()}
      {listingType === "transport" && renderTransportForm()}
      {listingType === "museums" && renderMuseumForm()}
      {listingType === "memorial-sites" && renderMemorialSiteForm()}
      {listingType === "guides" && renderGuideForm()}

      {publishError && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {publishError}
        </p>
      )}
      {publishSuccess && (
        <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">
          {publishSuccess}
        </p>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
        <p className="text-sm font-bold text-blue-900 flex items-start gap-2">
          <span className="text-lg">ℹ️</span>
          <span>
            After submission, your listing will be reviewed by our admin team. Once approved, it will be published and visible to all users for booking, wishlisting, and reviews.
          </span>
        </p>
           <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => {
              onChange({});
              setFormData({});
            }}
            className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isPublishing ? (data?.id ? "Updating..." : "Submitting...") : (data?.id ? "Update Listing" : "Submit for Review")}
          </button>
        </div>
      </div>
    </div>
  );
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

function Input({ label, value, onChange, type = "text", placeholder = "", helperText }: any) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
      />
      {helperText && <p className="text-xs font-semibold text-emerald-600 mt-1">{helperText}</p>}
    </label>
  );
}

function Textarea({ label, value, onChange, rows = 3 }: any) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold resize-none"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-semibold"
      >
        <option value="">Select...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
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

function ImageUpload({ images, onChange, singleImage = false }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Max dimensions - reduced for faster upload
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.7 // Reduced quality for faster upload
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress([]);
    
    try {
      const fileArray = Array.from(files);
      
      // Compress images in parallel
      setUploadProgress(["Compressing images..."]);
      const compressionPromises = fileArray.map(async (file, index) => {
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[0] = `Compressing ${index + 1}/${fileArray.length}: ${file.name}`;
          return newProgress;
        });
        const compressed = await compressImage(file);
        return compressed;
      });

      const processedFiles = await Promise.all(compressionPromises);

      // Upload images in parallel
      setUploadProgress(["Uploading to server..."]);
      const uploadPromises = processedFiles.map(async (file, index) => {
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[0] = `Uploading ${index + 1}/${processedFiles.length}...`;
          return newProgress;
        });
        const data = await uploadsApi.uploadImage(file);
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => !!url);

      if (singleImage) {
        onChange([validUrls[0]]);
      } else {
        onChange([...images, ...validUrls]);
      }
      
      setUploadProgress([]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
      setUploadProgress([]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {images.map((img: string, idx: number) => (
          <div key={idx} className="relative group">
            <img src={img} alt="" className="w-full h-32 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!singleImage}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 text-gray-600 hover:text-emerald-600 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload size={18} />
        {isUploading ? "Uploading..." : "Add Image"}
      </button>
      {isUploading && uploadProgress.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
          {uploadProgress.map((msg, idx) => (
            <p key={idx} className="text-xs font-semibold text-blue-900 flex items-center gap-2">
              <span className="animate-pulse">●</span> {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
