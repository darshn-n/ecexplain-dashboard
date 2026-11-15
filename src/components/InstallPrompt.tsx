"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if already in standalone / PWA mode
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || !showBanner) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-blue-700/50 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2 flex-1 mr-2">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
          EC
        </div>
        <div className="truncate">
          <span className="font-semibold">Install ECExplain</span>
          <span className="text-blue-200 block truncate">
            {isIOS ? "Tap Share → Add to Home Screen" : "Add to home screen for full mobile app experience"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-2.5 py-1 rounded flex items-center gap-1 text-[11px] transition shadow"
          >
            <Download className="w-3 h-3" />
            Install
          </button>
        ) : isIOS ? (
          <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[10px] text-blue-200">
            <Share className="w-3 h-3" /> + <PlusSquare className="w-3 h-3" />
          </span>
        ) : null}
        <button
          onClick={() => setShowBanner(false)}
          className="text-blue-300 hover:text-white p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
