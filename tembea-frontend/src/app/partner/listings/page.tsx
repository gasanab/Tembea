"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, Eye, CalendarCheck, MapPin } from "lucide-react";
import { ListingTypeSelector } from "@/components/partner/listings/ListingTypeSelector";
import { ListingForm } from "@/components/partner/listings/ListingForm";
import { ListingPreview } from "@/components/partner/listings/ListingPreview";
import type { ListingType, AnyListing } from "@/types/listing.types";
import { listingsApi } from "@/lib/api-client";

const getListingsArray = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.listings)) return response.listings;
  return [];
};

const getListingLocation = (listing: any) => {
  if (typeof listing.location === "string" && listing.location.trim()) {
    return listing.location;
  }

  return (
    listing.location?.address ||
    listing.city ||
    listing.region ||
    "No location set"
  );
};

export default function PartnerListingsPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "create">("grid");
  const [selectedType, setSelectedType] = useState<ListingType | null>(null);
  const [listingData, setListingData] = useState<Partial<AnyListing>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await listingsApi.getMine();
      setListings(getListingsArray(res));
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to fetch listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if mode=create is in URL params
    const mode = searchParams.get("mode");
    if (mode === "create") {
      setView("create");
    }
    fetchListings();
  }, [searchParams]);

  const handleTypeSelect = (type: ListingType) => {
    setSelectedType(type);
    setListingData({ type } as Partial<AnyListing>);
    setShowPreview(false);
  };

  const handleFormChange = (data: Partial<AnyListing>) => {
    setListingData(data);
    setShowPreview(true);
  };

  const handleReset = () => {
    setSelectedType(null);
    setListingData({});
    setShowPreview(false);
  };

  const handleListingSubmitted = async () => {
    setNotice("✅ Listing created successfully! It will be reviewed by our team before being published.");
    await fetchListings();
    handleReset();
    setView("grid");
  };

  const confirmDelete = async (id: string) => {
    try {
      await listingsApi.delete(id);
      setNotice("✅ Listing deleted successfully.");
      setDeleteConfirmId(null);
      fetchListings();
    } catch (err) {
      setLoadError("❌ Failed to delete listing. Please try again.");
      setDeleteConfirmId(null);
    }
  };

  if (view === "grid") {
    return (
      <main className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600 font-semibold">Manage your services, experiences, and accommodations.</p>
          </div>
          <button
            onClick={() => setView("create")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            CREATE NEW
          </button>
        </div>

        {notice && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {notice}
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-emerald-600">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-emerald-100 p-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-emerald-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No listings yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">You haven't created any listings. Start by creating your first service offering.</p>
            <button
              onClick={() => setView("create")}
              className="px-6 py-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl hover:bg-emerald-200 transition-colors"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img
                    src={listing.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"}
                    alt={listing.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 text-xs font-black rounded-full shadow-md ${listing.published || listing.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                      {listing.published || listing.isPublished ? 'PUBLISHED' : 'PENDING'}
                    </span>
                    <span className="px-3 py-1 text-xs font-black rounded-full bg-white/90 text-emerald-800 shadow-md border border-white/50 backdrop-blur-sm">
                      {listing.type?.replace(/_/g, ' ') || 'LISTING'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-lg text-gray-900 line-clamp-1">{listing.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                    <MapPin size={14} />
                    <span className="truncate">{getListingLocation(listing)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="font-black text-emerald-600 text-lg">${listing.price}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        setSelectedType(listing.type as ListingType);
                        setListingData(listing);
                        setView("create");
                      }} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Edit Listing">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirmId(listing.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Delete Listing">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 mb-2">Delete Listing?</h3>
              <p className="text-center text-gray-600 mb-6 text-sm">
                This action cannot be undone. Are you sure you want to permanently delete this listing?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (selectedType) handleReset();
              else setView("grid");
            }}
            className="text-sm font-bold text-gray-500 hover:text-emerald-700 transition flex items-center gap-1 mb-4"
          >
            ← Back
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 mb-4">
            <Plus size={16} className="text-emerald-700" />
            <span className="text-sm font-bold text-emerald-700">Create New Listing</span>
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
            {selectedType ? "Fill Details" : "Choose Category"}
          </h1>
          <p className="text-lg text-gray-600">
            {selectedType ? "Complete your listing details to publish." : "Select the best category for your service."}
          </p>
        </div>

        {/* Step 1: Type Selection */}
        {!selectedType && (
          <ListingTypeSelector onSelectType={handleTypeSelect} />
        )}

        {/* Step 2: Form and Preview */}
        {selectedType && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <ListingForm
                listingType={selectedType}
                data={listingData}
                onChange={handleFormChange}
                onSubmitted={handleListingSubmitted}
              />
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="text-2xl font-black text-gray-800">Live Preview</h2>
                </div>
                <p className="text-sm text-gray-600">
                  See how your listing will appear to users
                </p>
              </div>
              {showPreview && listingData ? (
                <ListingPreview data={listingData as AnyListing} />
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white/50 p-12 text-center">
                  <p className="text-gray-400 font-semibold">
                    Fill in the form to see your listing preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
