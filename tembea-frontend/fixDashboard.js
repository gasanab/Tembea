const fs = require('fs');

const content = fs.readFileSync('src/app/partner/page.tsx', 'utf-8');

let newContent = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport { bookingsApi, listingsApi } from "@/lib/api-client";');

newContent = newContent.replace(
  '  const [showPreview, setShowPreview] = useState(false);',
  `  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bookingsRes, listingsRes] = await Promise.all([
          bookingsApi.getPartnerStats().catch(() => null),
          bookingsApi.getPartner().catch(() => ({ data: [] })),
          listingsApi.getMine().catch(() => [])
        ]);
        
        setStats(statsRes);
        setBookings(bookingsRes?.data || []);
        setListings(Array.isArray(listingsRes) ? listingsRes : listingsRes?.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);`
);

// Replace hardcoded stats
newContent = newContent.replace(
  '<p className="text-4xl font-black text-[#111827]">$18.7k</p>',
  '{loading ? <div className="animate-pulse h-10 w-24 bg-gray-200 rounded mt-1"></div> : <p className="text-4xl font-black text-[#111827]">${stats?.totalRevenue?.toLocaleString() || 0}</p>}'
);

newContent = newContent.replace(
  '<p className="text-4xl font-black text-[#111827]">142</p>',
  '{loading ? <div className="animate-pulse h-10 w-24 bg-gray-200 rounded mt-1"></div> : <p className="text-4xl font-black text-[#111827]">{stats?.totalBookings || 0}</p>}'
);

newContent = newContent.replace(
  '<p className="text-4xl font-black text-[#111827]">8</p>',
  '{loading ? <div className="animate-pulse h-10 w-24 bg-gray-200 rounded mt-1"></div> : <p className="text-4xl font-black text-[#111827]">{listings.length}</p>}'
);

newContent = newContent.replace(
  '<p className="mt-1 text-sm font-semibold text-[#6B7280]">22 pending confirmation</p>',
  '<p className="mt-1 text-sm font-semibold text-[#6B7280]">{stats?.pendingCount || 0} pending confirmation</p>'
);

// Fix recent bookings
const bookingsTableBodyRegex = /<tbody>[\s\S]*?<\/tbody>/;
const newBookingsTableBody = `<tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Loading bookings...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No bookings yet.</td></tr>
                ) : bookings.slice(0, 5).map((booking: any) => (
                  <tr key={booking.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                    <td className="p-4 font-black text-sm">{booking.id.substring(0, 8)}...</td>
                    <td className="p-4 font-bold">{booking.user?.name || "Guest"}</td>
                    <td className="p-4 text-sm">{booking.listing?.title || "Service"}</td>
                    <td className="p-4 text-sm">{booking.bookingData?.checkIn || new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span
                        className={\`text-xs font-bold px-2.5 py-1 rounded-full \${
                          booking.status === "CONFIRMED" || booking.status === "APPROVED"
                            ? "bg-[#D5F5E3] text-[#145A32]"
                            : booking.status === "PENDING"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : "bg-[#E5E7EB] text-[#6B7280]"
                        }\`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 font-black">\${booking.amount}</td>
                  </tr>
                ))}
              </tbody>`;

newContent = newContent.replace(bookingsTableBodyRegex, newBookingsTableBody);

// Fix My Listings Overview
const listingsGridRegex = /<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">[\s\S]*?<\/div>\n      <\/div>\n    <\/div>/;
const newListingsGrid = `<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500">Loading your listings...</div>
          ) : listings.length === 0 ? (
             <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-[#D5F5E3] rounded-2xl">
               <p className="font-bold text-lg mb-2">No listings yet</p>
               <p className="text-sm">Click "Add New" to create your first listing.</p>
             </div>
          ) : listings.slice(0, 8).map((listing: any) => (
            <div key={listing.id} className="group rounded-xl overflow-hidden border border-[#D5F5E3] bg-white hover:shadow-lg transition">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={listing.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={\`text-xs font-black px-2 py-1 rounded-full \${
                      listing.isPublished
                        ? "bg-[#2ECC71] text-white"
                        : "bg-[#F59E0B] text-white"
                    }\`}
                  >
                    {listing.isPublished ? "Active" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-[#111827] truncate">{listing.title}</h3>
                <p className="text-xs font-bold text-[#6B7280] mb-3">{listing.type}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-black text-[#145A32]">\${listing.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>`;

newContent = newContent.replace(listingsGridRegex, newListingsGrid);

fs.writeFileSync('src/app/partner/page.tsx', newContent);
