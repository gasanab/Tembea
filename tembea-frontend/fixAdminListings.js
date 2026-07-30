const fs = require('fs');

const content = `"use client";

import { useState, useEffect } from "react";
import { Search, Filter, CheckCircle2, XCircle, Sparkles, X, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { adminApi, aiApi } from "@/lib/api-client";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllListings();
      setListings(res.data || res || []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const pendingListings = listings.filter((l) => !l.published && !l.isPublished);
  const activeListings = listings.filter((l) => l.published || l.isPublished);
  const displayedListings = activeTab === "pending" ? pendingListings : activeListings;

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing(true);
      await adminApi.approveListing(id);
      await fetchListings();
      setSelectedListing(null);
    } catch (error) {
      alert("Failed to approve listing");
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
    } catch (error) {
      alert("Failed to reject listing");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiVerify = async () => {
    if (!selectedListing) return;
    try {
      setIsAiReviewing(true);
      setAiReview(null);
      const prompt = \`As a strict quality assurance AI for a premium travel platform, review the following listing submitted by a partner:
Title: \${selectedListing.name || selectedListing.title}
Category: \${selectedListing.type}
Location: \${selectedListing.location}
Price: $\${selectedListing.price}
Description: \${selectedListing.description}

Please provide:
1. A brief assessment of completeness and quality.
2. A check for any suspicious or inappropriate content.
3. A recommendation (Approve/Reject) with a brief justification.\`;
      
      const res = await aiApi.chat(prompt);
      setAiReview(res.reply || res.message || res.data?.reply || "AI reviewed the listing but returned an empty response.");
    } catch (error) {
      setAiReview("AI Verification failed. Please check your AI service connection.");
    } finally {
      setIsAiReviewing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Listings Moderation</h1>
            <p className="text-gray-500 font-medium mt-1">Review and approve partner listings before they go live.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("pending")}
              className={\`px-6 py-2.5 text-sm font-bold rounded-lg transition-all \${
                activeTab === "pending" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }\`}
            >
              Pending Approval ({pendingListings.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={\`px-6 py-2.5 text-sm font-bold rounded-lg transition-all \${
                activeTab === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }\`}
            >
              Live Listings ({activeListings.length})
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-emerald-600 flex flex-col items-center">
            <Loader2 className="animate-spin w-10 h-10 mb-4" />
            <p className="font-bold">Fetching listings...</p>
          </div>
        ) : displayedListings.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-500">There are no {activeTab} listings at the moment.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Listing Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedListings.map((l) => (
                <tr key={l.id} className="hover:bg-emerald-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        <img src={l.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{l.name || l.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{l.location?.address || l.location || "No location"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-semibold text-gray-700">{l.type}</td>
                  <td className="p-4 text-sm font-black text-emerald-700">$\${l.price}</td>
                  <td className="p-4">
                    <span className={\`text-xs font-bold px-3 py-1 rounded-full \${activeTab === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}\`}>
                      {activeTab === "pending" ? "PENDING REVIEW" : "PUBLISHED"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { setSelectedListing(l); setAiReview(null); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition"
                    >
                      Review <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Review Listing</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">ID: {selectedListing.id}</p>
              </div>
              <button onClick={() => setSelectedListing(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</h3>
                    <p className="text-lg font-black text-gray-900">{selectedListing.name || selectedListing.title}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">{selectedListing.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price</h3>
                      <p className="text-lg font-black text-emerald-600">$\${selectedListing.price} <span className="text-xs text-gray-500">/ {selectedListing.priceLabel}</span></p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</h3>
                      <p className="text-lg font-black text-gray-900">{selectedListing.type}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images ({selectedListing.images?.length || 0})</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedListing.images?.map((img: string, i: number) => (
                        <img key={i} src={img} className="w-24 h-24 rounded-lg object-cover bg-gray-200 shrink-0" alt="" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles size={100} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-indigo-300" size={24} />
                        <h3 className="text-xl font-black">AI Verification</h3>
                      </div>
                      <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                        Use our AI assistant to instantly scan this listing for quality, completeness, and appropriateness before approving.
                      </p>
                      
                      {!aiReview && !isAiReviewing ? (
                        <button 
                          onClick={handleAiVerify}
                          className="w-full py-3 rounded-xl bg-white text-indigo-900 font-black flex items-center justify-center gap-2 hover:bg-indigo-50 transition"
                        >
                          <Sparkles size={18} />
                          Run AI Verification
                        </button>
                      ) : isAiReviewing ? (
                        <div className="w-full py-8 flex flex-col items-center justify-center text-indigo-200">
                          <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-400" />
                          <p className="font-bold text-sm animate-pulse">Analyzing listing details...</p>
                        </div>
                      ) : (
                        <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-700/50 mt-4 backdrop-blur-sm">
                          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <CheckCircle2 size={12} /> AI Assessment
                          </h4>
                          <p className="text-sm text-indigo-50 whitespace-pre-wrap leading-relaxed">{aiReview}</p>
                          <button 
                            onClick={handleAiVerify}
                            className="mt-4 text-xs font-bold text-indigo-300 hover:text-white underline decoration-indigo-500 underline-offset-4 transition"
                          >
                            Run Again
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                <AlertCircle size={16} /> Ensure all details meet our platform's standards.
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleReject(selectedListing.id)}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 border-red-100 text-red-600 font-black hover:bg-red-50 hover:border-red-200 transition disabled:opacity-50"
                >
                  Reject Listing
                </button>
                <button
                  onClick={() => handleApprove(selectedListing.id)}
                  disabled={isProcessing || (selectedListing.published || selectedListing.isPublished)}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {selectedListing.published || selectedListing.isPublished ? "Already Live" : "Approve & Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/app/admin/listings/page.tsx', content);
