"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ActivityChatProps {
  activityId: string;
  currentUserId?: string;
  isLoggedIn: boolean;
}

export default function ActivityChat({
  activityId,
  currentUserId,
  isLoggedIn,
}: ActivityChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}/messages`
      );
      if (!response.ok) throw new Error("Chyba pri načítaní správ");
      const data = await response.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activityId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !isLoggedIn) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri odosielaní správy");
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Naozaj chcete vymazať túto správu?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chyba pri mazaní správy");
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "práve teraz";
    if (minutes < 60) return `pred ${minutes} min`;
    if (hours < 24) return `pred ${hours} h`;
    if (days < 7) return `pred ${days} d`;

    return date.toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "short",
    });
  };

  const charCount = newMessage.length;
  const maxChars = 500;

  return (
    <div className="mt-8">
      {/* Toggle button */}
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Diskusia ({messages.length})
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <Card className="mt-4">
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[color:var(--fluent-border)]">
              <h3 className="text-lg font-semibold text-[color:var(--fluent-text)]">
                Diskusia
              </h3>
              {!isLoggedIn && (
                <span className="text-sm text-[color:var(--fluent-text-secondary)]">
                  Prihláste sa pre písanie správ
                </span>
              )}
            </div>

            {/* Messages list */}
            <div
              ref={messageListRef}
              className="flex-1 overflow-y-auto py-4 space-y-4"
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-[color:var(--fluent-accent)] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">💬</p>
                  <p className="text-[color:var(--fluent-text-secondary)]">
                    Zatiaľ žiadne správy
                  </p>
                  <p className="text-sm text-[color:var(--fluent-text-secondary)] mt-2">
                    Buďte prvý, kto začne konverzáciu
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.user.id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isOwn ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.user.image ? (
                          <img
                            src={message.user.image}
                            alt={message.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[color:var(--fluent-accent)]/20 flex items-center justify-center">
                            <span className="text-lg font-semibold text-[color:var(--fluent-accent)]">
                              {message.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
                        <div
                          className={`inline-block max-w-[80%] ${
                            isOwn ? "text-right" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {!isOwn && (
                              <span className="text-sm font-medium text-[color:var(--fluent-text)]">
                                {message.user.name}
                              </span>
                            )}
                            <span className="text-xs text-[color:var(--fluent-text-secondary)]">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                                title="Vymazať správu"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div
                            className={`inline-block px-4 py-2 rounded-2xl ${
                              isOwn
                                ? "bg-[color:var(--fluent-accent)] text-white"
                                : "bg-[color:var(--fluent-bg-secondary)] text-[color:var(--fluent-text)]"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error message */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Message input */}
            {isLoggedIn ? (
              <form onSubmit={handleSendMessage} className="pt-4 border-t border-[color:var(--fluent-border)]">
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Napíšte správu..."
                      rows={2}
                      maxLength={maxChars}
                      disabled={sending}
                      className="w-full px-4 py-3 bg-[color:var(--fluent-bg)] border border-[color:var(--fluent-border)] rounded-xl text-[color:var(--fluent-text)] placeholder-[color:var(--fluent-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--fluent-accent)] resize-none transition-all"
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                      <span
                        className={`text-xs font-medium ${
                          charCount > maxChars * 0.9
                            ? "text-orange-500"
                            : "text-[color:var(--fluent-text-secondary)]"
                        }`}
                      >
                        {charCount}/{maxChars}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!newMessage.trim() || sending}
                    className="h-[56px] px-6 flex items-center justify-center min-w-[56px] self-start"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t border-[color:var(--fluent-border)] text-center">
                <p className="text-sm text-[color:var(--fluent-text-secondary)] mb-3">
                  Pre odosielanie správ sa musíte prihlásiť
                </p>
                <a href="/auth/signin">
                  <Button variant="primary">Prihlásiť sa</Button>
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
