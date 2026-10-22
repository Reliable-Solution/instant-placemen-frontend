"use client";

import React, { useState, useEffect } from "react";
import { Download, RefreshCw, WifiOff, Wifi, X, Share, Smartphone, HelpCircle } from "lucide-react";

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  // 1. Service Worker Registration & Update Flow
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowUpdateToast(true);
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdateToast(true);
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn("PWA ServiceWorker registration notice:", err.message);
      });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  // 2. Install Prompt (Android/Chrome/Desktop) & iOS Detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone mode (already installed as PWA)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(standaloneMode);
    if (standaloneMode) {
      return;
    }

    // Check dismiss cooldown (7 days)
    const lastDismissed = localStorage.getItem("ip_pwa_install_dismissed");
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const isDismissedRecently =
      lastDismissed && Date.now() - parseInt(lastDismissed, 10) < SEVEN_DAYS_MS;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (!isDismissedRecently) {
      setShowInstallBanner(true);
    }

    // Android & Chrome beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissedRecently) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.removeItem("ip_pwa_install_dismissed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 3. Online / Offline Network Status Listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineToast(false);
    };

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Action: User clicks "Install App" button
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // If browser hasn't fired beforeinstallprompt or on iOS, open the guide
      setShowGuideModal(true);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    setShowGuideModal(false);
    localStorage.setItem("ip_pwa_install_dismissed", Date.now().toString());
  };

  const handleUpdateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* ── Network Offline Banner ── */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-rose-600 text-white text-xs font-bold py-2 px-4 shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>You are currently offline. Viewing cached content.</span>
        </div>
      )}

      {/* ── Back Online Toast ── */}
      {showOnlineToast && (
        <div className="fixed top-3 right-3 z-[9999] bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Back online! Connection restored.</span>
        </div>
      )}

      {/* ── New Version Available Toast ── */}
      {showUpdateToast && (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm bg-slate-900 border border-slate-700 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold text-white">App Update Available</h4>
            <p className="text-xs text-slate-400">A new version of Instant Placement is ready.</p>
          </div>
          <button
            onClick={handleUpdateApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* ── Always-Visible Mobile & Desktop Install Floating Banner ── */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-[9998] sm:max-w-md bg-white border border-blue-200 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ring-1 ring-black/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
              <img
                src="/icons/icon-192x192.png"
                alt="Instant Placement"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5">
                <span>Instant Placement App</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-md">Free</span>
              </h4>
              <p className="text-[11px] text-slate-500 truncate">Install to your home screen for quick access.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismissInstall}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Guided Installation Modal (for iOS or browsers without native prompt) ── */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-2.5 shadow-xs">
              <img src="/icons/icon-192x192.png" alt="Instant Placement" className="w-full h-full object-contain" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Install Instant Placement</h3>
              <p className="text-xs text-slate-500 mt-1">
                Install as a standalone app on your phone or desktop.
              </p>
            </div>

            {isIos ? (
              <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-700 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Tap the <strong className="text-blue-700">Share button <Share className="w-3.5 h-3.5 inline-block mx-0.5 text-blue-600" /></strong> at the bottom of Safari.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Scroll down and select <strong className="text-slate-900">Add to Home Screen ⊞</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Tap <strong className="text-blue-700">Add</strong> in the top right corner.</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-700 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Tap the browser menu <strong className="text-slate-900">three dots (⋮)</strong> at the top right.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Select <strong className="text-blue-700">Install app</strong> or <strong className="text-slate-900">Add to Home screen</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Confirm to install on your device.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
