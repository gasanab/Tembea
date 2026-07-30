"use client";

import { useState, useEffect, useRef } from "react";
import { messagesApi } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, MessageSquare, Send, Search, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(date).toLocaleDateString();
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchConversations();
    else setIsLoadingConvs(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (selected) fetchMessages(selected.id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConvs(true);
      const data: any = await messagesApi.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (_) {
      setConversations([]);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      setIsLoadingMsgs(true);
      const data: any = await messagesApi.getMessages(convId);
      setMessages(Array.isArray(data) ? data : data?.messages || []);
    } catch (_) {
      setMessages([]);
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selected) return;
    setIsSending(true);
    try {
      const sent = await messagesApi.sendMessage(selected.id, newMsg.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMsg("");
      fetchConversations();
    } catch (_) {
    } finally {
      setIsSending(false);
    }
  };

  const filtered = conversations.filter((c) => {
    const other = c.partner?.name || c.user?.name || "";
    return other.toLowerCase().includes(search.toLowerCase());
  });

  if (!isAuthenticated) {
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-white rounded-2xl p-16 text-center border border-[#D5F5E3] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-[#145A32]" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Sign in to view messages</h2>
          <p className="text-gray-500 text-sm mb-6">Chat with partners and hosts about your bookings.</p>
          <Link href="/sign-in" className="btn-base btn-dark inline-flex">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D5F5E3]">
        <h1 className="text-2xl font-black text-[#111827]">Messages</h1>
        <p className="text-[#6B7280] mt-1">Chat with partners, hosts, and guides about your bookings.</p>
      </div>

      {/* Main layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D5F5E3] overflow-hidden" style={{ height: "65vh" }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div
            className={`flex flex-col border-r border-[#D5F5E3] ${
              selected ? "hidden md:flex w-80" : "flex w-full md:w-80"
            }`}
          >
            {/* Search */}
            <div className="p-3 border-b border-[#D5F5E3]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border-2 border-gray-200 focus:border-[#145A32] outline-none font-semibold"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingConvs && (
                <div className="flex justify-center py-10">
                  <Loader2 size={32} className="animate-spin text-[#145A32]" />
                </div>
              )}
              {!isLoadingConvs && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                  <MessageSquare size={40} className="text-gray-300 mb-3" />
                  <p className="font-black text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Contact a partner from any listing page to start chatting.
                  </p>
                </div>
              )}
              {filtered.map((conv) => {
                const other = conv.partner || conv.user || {};
                const lastMsg = conv.lastMessage;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`w-full flex items-start gap-3 p-4 text-left border-b border-gray-50 hover:bg-[#f5fbf7] transition-colors ${
                      selected?.id === conv.id ? "bg-[#D5F5E3]" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#D5F5E3] flex items-center justify-center text-[#145A32] font-black text-sm shrink-0">
                      {other.name?.[0] || <User size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-sm text-gray-900 truncate">{other.name || "Partner"}</p>
                        <span className="text-xs text-gray-400 shrink-0">
                          {lastMsg ? timeAgo(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      {conv.listing && (
                        <p className="text-xs text-[#145A32] font-bold truncate">{conv.listing.name}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {lastMsg?.body || "No messages yet"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#145A32] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message thread */}
          {selected ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Thread header */}
              <div className="flex items-center gap-3 p-4 border-b border-[#D5F5E3] bg-white">
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden p-2 rounded-xl hover:bg-[#D5F5E3]"
                >
                  <ArrowLeft size={18} className="text-[#145A32]" />
                </button>
                <div className="w-9 h-9 rounded-full bg-[#D5F5E3] flex items-center justify-center text-[#145A32] font-black text-sm">
                  {(selected.partner || selected.user)?.name?.[0] || <User size={14} />}
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">
                    {(selected.partner || selected.user)?.name || "Partner"}
                  </p>
                  {selected.listing && (
                    <p className="text-xs text-[#145A32] font-bold">{selected.listing.name}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMsgs && (
                  <div className="flex justify-center py-8">
                    <Loader2 size={28} className="animate-spin text-[#145A32]" />
                  </div>
                )}
                {!isLoadingMsgs && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={36} className="text-gray-300 mb-2" />
                    <p className="font-black text-gray-400">Start the conversation</p>
                    <p className="text-sm text-gray-400">Send a message to connect with this partner.</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-semibold ${
                          isMine
                            ? "bg-[#145A32] text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <p>{msg.body}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? "text-white/60" : "text-gray-400"
                          }`}
                        >
                          {timeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#D5F5E3] bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#145A32] focus:ring-2 focus:ring-[#D5F5E3] outline-none text-sm font-semibold"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isSending || !newMsg.trim()}
                    className="w-12 h-12 rounded-xl bg-[#145A32] text-white flex items-center justify-center hover:bg-[#0e4426] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="font-black text-gray-400">Select a conversation</p>
                <p className="text-sm text-gray-300">Choose from the list to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
