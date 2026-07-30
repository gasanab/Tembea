"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

const conversations = [
  { id: 1, guest: "Nora K.", lastMessage: "Hi, is breakfast included in the room rate?", time: "2h ago", unread: true },
  { id: 2, guest: "Daniel R.", lastMessage: "Thank you for the early check-in!", time: "Yesterday", unread: false },
  { id: 3, guest: "Sarah M.", lastMessage: "Can you arrange airport pickup for 6am?", time: "3 days ago", unread: false },
];

export default function PartnerMessagesPage() {
  const [active, setActive] = useState(conversations[0]);
  const [reply, setReply] = useState("");

  return (
    <div className="p-4 lg:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden" style={{ minHeight: "600px" }}>
        <div className="grid lg:grid-cols-[300px_1fr] h-full">
          {/* Sidebar */}
          <div className="border-r border-[#D5F5E3]">
            <div className="p-4 border-b border-[#D5F5E3]">
              <h1 className="text-lg font-black text-[#111827]">Messages</h1>
            </div>
            <div>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`w-full text-left p-4 border-b border-[#D5F5E3] transition-all ${active.id === c.id ? "bg-[#D5F5E3]" : "hover:bg-[#f8faf9]"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#145A32] text-white font-bold flex items-center justify-center shrink-0">
                      {c.guest[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-[#111827]">{c.guest}</p>
                        <p className="text-xs text-[#6B7280]">{c.time}</p>
                      </div>
                      <p className="text-xs text-[#6B7280] truncate">{c.lastMessage}</p>
                    </div>
                    {c.unread && <span className="w-2 h-2 rounded-full bg-[#2ECC71] shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-col">
            <div className="p-4 border-b border-[#D5F5E3] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#145A32] text-white font-bold flex items-center justify-center">
                {active.guest[0]}
              </div>
              <p className="font-black text-[#111827]">{active.guest}</p>
            </div>

            <div className="flex-1 p-5 space-y-4 bg-[#f8faf9]">
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 max-w-xs shadow-sm">
                  <p className="text-sm">{active.lastMessage}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{active.time}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#D5F5E3]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a message…"
                  className="field-control flex-1"
                  aria-label="Message input"
                />
                <button
                  className="btn-base btn-dark px-4"
                  onClick={() => setReply("")}
                  aria-label="Send message"
                >
                  <Send size={16} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
