import sys

file_path = 'src/app/partner/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

new_lines = lines[:444]

tail = """            <Link
              href="/partner/listings"
              className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-[#145A32] hover:underline"
            >
              Improve your listings <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* My Listings Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider">My Listings</p>
            <h2 className="text-2xl font-black text-[#111827]">Your active services</h2>
          </div>
          <button
            onClick={() => setShowListingFlow(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#145A32] text-white font-bold text-sm hover:bg-[#0d4a26] transition"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listings.length === 0 && <p className="text-gray-500 col-span-full">No listings found.</p>}
          {listings.slice(0, 4).map((listing: any) => (
            <div key={listing.id} className="group rounded-xl overflow-hidden border border-[#D5F5E3] bg-white hover:shadow-lg transition">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={listing.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-full ${
                      listing.published
                        ? "bg-[#2ECC71] text-white"
                        : "bg-[#F59E0B] text-white"
                    }`}
                  >
                    {listing.published ? "Active" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-[#111827]">{listing.title}</h3>
                <p className="text-xs font-bold text-[#6B7280] mb-3">{listing.type}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280] font-semibold">
                    <CalendarCheck size={13} className="inline mr-1" />
                    {listing._count?.bookings || 0} bookings
                  </span>
                  <span className="font-black text-[#145A32]">$0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"""

new_lines.extend(tail.splitlines())

with open(file_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
    f.write('\n')

print('Successfully rebuilt file tail!')
