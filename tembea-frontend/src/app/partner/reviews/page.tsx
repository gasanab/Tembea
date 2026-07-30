"use client";

import { Star, MessageSquare } from "lucide-react";

const reviews = [
  { id: 1, guest: "Aline M.", listing: "Volcanoes Eco Lodge", rating: 5, comment: "Absolutely magical stay. The staff were so attentive and the view of the volcanoes was breathtaking.", date: "12 Jun 2025" },
  { id: 2, guest: "Daniel R.", listing: "Lake Kivu Weekend", rating: 4, comment: "Great location and lovely rooms. Breakfast could have more variety but overall a wonderful experience.", date: "3 Jun 2025" },
  { id: 3, guest: "Sarah M.", listing: "Nyungwe Canopy Walk", rating: 5, comment: "Best experience of our Rwanda trip! The guide was incredibly knowledgeable about the ecosystem.", date: "28 May 2025" },
];

export default function PartnerReviewsPage() {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Guest Reviews</h1>
            <p className="text-[#6B7280] mt-1">What your guests are saying.</p>
          </div>
          <div className="ml-auto text-center">
            <p className="text-4xl font-black text-[#145A32]">{avg}</p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={14} className={i <= Math.round(Number(avg)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} aria-hidden />
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-1">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3] space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#145A32] flex items-center justify-center text-white font-bold shrink-0">
                {r.guest[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[#111827]">{r.guest}</p>
                  <p className="text-xs text-[#6B7280]">{r.date}</p>
                </div>
                <p className="text-xs text-[#6B7280]">{r.listing}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={12} className={i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} aria-hidden />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
            <button className="flex items-center gap-1.5 text-xs font-bold text-[#145A32] hover:text-[#2ECC71] transition-colors">
              <MessageSquare size={13} aria-hidden /> Reply to guest
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
