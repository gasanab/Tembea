"use client";

import { ShieldCheck, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";

const pendingPartners = [
  { id: "PTR-201", name: "Kivu Eco Lodge", type: "Hotel", owner: "Jean Bosco N.", submitted: "3 days ago", documents: 4, missing: 1, priority: "high" },
  { id: "PTR-202", name: "Rwanda Craft Collective", type: "Marketplace", owner: "Claudine U.", submitted: "6 days ago", documents: 3, missing: 0, priority: "medium" },
  { id: "PTR-203", name: "Kigali Express Transfers", type: "Transport", owner: "Emmanuel K.", submitted: "8 days ago", documents: 5, missing: 0, priority: "low" },
  { id: "PTR-204", name: "Nyungwe Birding Tours", type: "Experience", owner: "Alphonse N.", submitted: "1 week ago", documents: 4, missing: 0, priority: "done" },
];

const priorityStyle: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function AdminVerificationPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-[#145A32]" aria-hidden />
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Partner Verification</h1>
            <p className="text-[#6B7280] mt-0.5">Review and approve new partner applications.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        {[
          { label: "Pending Review", value: "3", color: "text-amber-600" },
          { label: "Approved This Month", value: "18", color: "text-[#145A32]" },
          { label: "Rejected", value: "2", color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm text-[#6B7280] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {pendingPartners.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5F5E3]">
            <div className="flex items-start gap-4">
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${priorityStyle[p.priority]}`}>
                {p.priority === "done" ? <CheckCircle2 size={20} aria-hidden /> : <Clock size={20} aria-hidden />}
              </span>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-[#111827]">{p.name}</p>
                    <p className="text-sm text-[#6B7280]">{p.type} · Owner: {p.owner} · Submitted {p.submitted}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-base btn-ghost btn-sm text-xs">
                      <Eye size={13} aria-hidden /> Review
                    </button>
                    {p.priority !== "done" && (
                      <>
                        <button className="btn-base bg-green-100 text-green-700 btn-sm text-xs hover:bg-green-200">
                          <CheckCircle2 size={13} aria-hidden /> Approve
                        </button>
                        <button className="btn-base bg-red-100 text-red-700 btn-sm text-xs hover:bg-red-200">
                          <XCircle size={13} aria-hidden /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7280]">
                  <span>{p.documents} documents submitted</span>
                  {p.missing > 0 && (
                    <span className="text-red-600 font-bold">{p.missing} missing</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
