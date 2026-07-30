"use client";

import { useState, useEffect } from "react";
import { UserCheck, Search, Filter, MoreHorizontal } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const roleColor: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  PARTNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      const usersList = Array.isArray(response) ? response : response?.data || response?.users || [];
      setUsers(usersList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145A32]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Users</h1>
            <p className="text-[#6B7280] mt-1">Manage all registered users on the platform.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden />
              <input type="search" placeholder="Search users…" className="field-control pl-9 py-2 text-sm w-48" aria-label="Search users" />
            </div>
            <button className="btn-base btn-ghost btn-sm">
              <Filter size={14} aria-hidden /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8faf9] text-xs text-[#6B7280] uppercase font-bold">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4 hidden md:table-cell">Joined</th>
              <th className="p-4 hidden lg:table-cell">Bookings</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#D5F5E3] hover:bg-[#f8faf9] transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#145A32] text-white text-sm font-bold flex items-center justify-center">{user.name?.[0] || "U"}</div>
                    <div>
                      <p className="font-bold text-sm text-[#111827]">{user.name}</p>
                      <p className="text-xs text-[#6B7280]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleColor[user.role?.toUpperCase()] || "bg-gray-100 text-gray-700"}`}>{user.role}</span>
                </td>
                <td className="p-4 text-sm hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-sm hidden lg:table-cell">{user._count?.bookings || 0}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : user.status === "SUSPENDED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#D5F5E3] transition" aria-label={`Options for ${user.name}`}>
                    <MoreHorizontal size={16} className="text-[#6B7280]" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
