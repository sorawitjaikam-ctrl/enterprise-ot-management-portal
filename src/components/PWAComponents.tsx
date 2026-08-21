/**
 * PWA UI Components
 * - PWAUpdateNotification: Floating toast alerting user when a new Service Worker is ready
 * - PWAInstallBanner: Mobile/Tablet friendly install banner
 * - PWAInstallButton: Compact navbar/sidebar install action
 * - PWAOfflineBadge: Connectivity status pill
 */

import React from 'react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

/**
 * Floating toast notification when a new version of the app is available.
 */
export const PWAUpdateNotification: React.FC<{
  updateAvailable?: boolean;
  onApply?: () => void;
  onDismiss?: () => void;
}> = ({ updateAvailable, onApply, onDismiss }) => {
  const pwa = usePWA();
  const show = updateAvailable !== undefined ? updateAvailable : pwa.updateAvailable;
  const handleApply = onApply || pwa.applyUpdate;
  const handleDismiss = onDismiss || pwa.dismissUpdate;

  if (!show) return null;

  return (
    <aside
      aria-label="การอัปเดตระบบ"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-sky-500/40 text-white p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans pointer-events-auto"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl flex-shrink-0 mt-0.5">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
            <span>มีการอัปเดตเวอร์ชันใหม่</span>
            <span className="px-1.5 py-0.5 bg-sky-500 text-[9px] font-bold rounded uppercase">Update</span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            มีเวอร์ชันใหม่ของ Double A Terminal พร้อมใช้งาน โหลดใหม่เพื่อรับคุณสมบัติล่าสุด
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="min-h-[44px] px-4 py-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>อัปเดตทันที</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[44px] min-w-[44px] p-2 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

/**
 * Compact Install Action Button for Navbar / Sidebar.
 */
export const PWAInstallButton: React.FC<{
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'pill';
}> = ({ className = '', variant = 'navbar' }) => {
  const { isInstallable, promptInstall } = usePWA();

  if (!isInstallable) return null;

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={() => promptInstall()}
        className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 hover:text-white transition-all text-xs font-extrabold cursor-pointer shadow-sm ${className}`}
        title="ติดตั้งแอพพลิเคชันลงในอุปกรณ์"
      >
        <Download className="w-4 h-4 text-sky-400 flex-shrink-0" />
        <span className="truncate">ติดตั้งแอพลงเครื่อง (Install PWA)</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => promptInstall()}
      className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 active:scale-95 text-white border border-sky-400/30 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer ${className}`}
      title="ติดตั้งแอพพลิเคชันลงในอุปกรณ์ (Install App)"
    >
      <Download className="w-3.5 h-3.5 animate-bounce" />
      <span className="hidden sm:inline">ติดตั้งแอพ</span>
    </button>
  );
};

/**
 * Offline Mode Notification Pill.
 */
export const PWAOfflineBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-[11px] font-extrabold animate-pulse ${className}`}
      title="กำลังทำงานในโหมดออฟไลน์ ข้อมูลจากแคชในเครื่อง"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>โหมดออฟไลน์ (Offline Mode)</span>
    </div>
  );
};

/**
 * Install Banner for Mobile & Tablet Devices.
 */
export const PWAInstallBanner: React.FC<{
  className?: string;
  onDismiss?: () => void;
}> = ({ className = '', onDismiss }) => {
  const { isInstallable, isStandalone, promptInstall, dismissInstall } = usePWA();

  if (!isInstallable || isStandalone) return null;

  const handleDismiss = onDismiss || dismissInstall;

  return (
    <div
      className={`bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-sky-500/30 text-white px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            ติดตั้ง Enterprise OT Management Portal
          </p>
          <p className="text-[10px] text-slate-300 truncate">
            เข้าถึงระบบได้รวดเร็ว ทำงานแบบออฟไลน์บนหน้าท่า
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => promptInstall()}
          className="min-h-[44px] px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-black rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ติดตั้ง</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="min-h-[44px] min-w-[44px] p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          aria-label="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
