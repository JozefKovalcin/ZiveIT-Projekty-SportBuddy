"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ShareActivityButtonProps {
  activity: {
    id: string;
    title: string;
    description: string | null;
    location: string;
    locationName: string | null;
    date: string;
    sportType: string;
  };
}

const sportTypeLabels: Record<string, string> = {
  FOOTBALL: "⚽ Futbal",
  BASKETBALL: "🏀 Basketbal",
  TENNIS: "🎾 Tenis",
  VOLLEYBALL: "🏐 Volejbal",
  BADMINTON: "🏸 Bedminton",
  TABLE_TENNIS: "🏓 Stolný tenis",
  RUNNING: "🏃 Beh",
  CYCLING: "🚴 Cyklistika",
  SWIMMING: "🏊 Plávanie",
  GYM: "💪 Posilňovňa",
  OTHER: "🎯 Iné",
};

export default function ShareActivityButton({
  activity,
}: ShareActivityButtonProps) {
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Only use native share on mobile devices
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setHasNativeShare(!!navigator.share && isMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getShareUrl = () => window.location.href;

  const generateShareText = () => {
    const date = new Date(activity.date);
    const formattedDate = date.toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("sk-SK", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const sportLabel =
      sportTypeLabels[activity.sportType] || activity.sportType;
    const location = activity.locationName
      ? `${activity.locationName}, ${activity.location}`
      : activity.location;

    return (
      `Ahoj! Pridaj sa ku mne na ${sportLabel} cez SportBuddy! 🏅\n\n` +
      `📍 Kde: ${location}\n` +
      `📅 Kedy: ${formattedDate} o ${formattedTime}\n` +
      `📝 ${activity.title}\n\n` +
      `Klikni sem pre viac info a prihlásenie:`
    );
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: activity.title,
      text: generateShareText(),
      url: getShareUrl(),
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${generateShareText()} ${getShareUrl()}`
      );
      showToast("Text a odkaz boli skopírované do schránky", "success");
      setIsOpen(false);
    } catch (err) {
      console.error("Error copying:", err);
      showToast("Nepodarilo sa skopírovať odkaz", "error");
    }
  };

  const shareToSocial = async (
    platform: "facebook" | "twitter" | "whatsapp" | "email"
  ) => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(generateShareText());

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        // Facebook only allows URL sharing via sharer.php, text is ignored usually
        // Copy text to clipboard for better UX so user can paste it
        try {
          await navigator.clipboard.writeText(
            `${decodeURIComponent(text)} ${decodeURIComponent(url)}`
          );
          showToast(
            "Text bol skopírovaný. Vložte ho do príspevku (Ctrl+V).",
            "success"
          );
        } catch (e) {
          console.error("Failed to copy text", e);
        }

        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(
          `Pozvánka na ${activity.title}`
        )}&body=${text}%0A%0A${url}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  if (hasNativeShare) {
    return (
      <Button
        variant="secondary"
        onClick={handleNativeShare}
        className="w-full justify-center flex items-center gap-2"
      >
        <ShareIcon />
        Zdieľať
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-center flex items-center gap-2"
      >
        <ShareIcon />
        Zdieľať
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="p-2 space-y-1">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 transition-colors text-left"
            >
              <CopyIcon />
              <span className="font-medium">Kopírovať odkaz</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button
              onClick={() => shareToSocial("whatsapp")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 transition-colors text-left"
            >
              <WhatsAppIcon />
              <span className="font-medium">WhatsApp</span>
            </button>
            <button
              onClick={() => shareToSocial("facebook")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 transition-colors text-left"
            >
              <FacebookIcon />
              <span className="font-medium">Facebook</span>
            </button>
            <button
              onClick={() => shareToSocial("twitter")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 transition-colors text-left"
            >
              <TwitterIcon />
              <span className="font-medium">X (Twitter)</span>
            </button>
            <button
              onClick={() => shareToSocial("email")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-gray-200 transition-colors text-left"
            >
              <EmailIcon />
              <span className="font-medium">Email</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-green-500"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-blue-500"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-white"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}
