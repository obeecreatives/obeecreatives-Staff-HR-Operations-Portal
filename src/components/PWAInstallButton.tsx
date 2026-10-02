import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Monitor, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // If already running in standalone mode (installed app on desktop or mobile)
  if (isInstalled) {
    if (variant === 'header') {
      return (
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/70 border border-emerald-800 text-emerald-400 rounded-md text-[11px] font-medium font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Terpasang</span>
        </div>
      );
    }
    return null;
  }

  // Handle click based on platform capability
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowInfoModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs ${
          variant === 'header'
            ? 'bg-gradient-to-r from-red-600 to-[#E30000] hover:from-red-500 hover:to-red-600 text-white border border-red-500/40 animate-pulse hover:animate-none'
            : 'w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
        }`}
        title="Pasang aplikasi obeecreatives di PC atau Handphone"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-5 shadow-2xl text-slate-100 relative">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#E30000] mb-3">
              <Smartphone className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Pasang di iPhone / iPad</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Safari di iOS memerlukan 2 langkah mudah untuk memasang aplikasi ke Layar Utama:
            </p>

            <div className="space-y-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-sky-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">1. Ketuk Tombol Share</span>
                  <span className="text-slate-400 text-[11px]">
                    Ketuk ikon Bagikan (kotak dengan panah ke atas) di bilah bawah Safari.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-emerald-400">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">2. Pilih &ldquo;Tambah ke Layar Utama&rdquo;</span>
                  <span className="text-slate-400 text-[11px]">
                    Scroll ke bawah dan ketuk <em>Add to Home Screen</em>.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {/* Info Modal for PC Desktop / Android browsers where prompt not auto-triggered */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl text-slate-100 relative">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#E30000] mb-2">
              <Monitor className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Cara Pasang Aplikasi PWA</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Aplikasi web ini mendukung Progressive Web App (PWA) dan dapat dipasang langsung:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <Monitor className="w-3.5 h-3.5 text-sky-400" />
                  <span>Di Laptop / PC (Chrome, Edge, Brave):</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Klik ikon <strong>Install / Pasang Aplikasi</strong> di bilah alamat URL browser (di samping ikon bintang bookmark) atau pilih menu titik tiga browser &rarr; <em>&ldquo;Instal obeecreatives Staff Portal&rdquo;</em>.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Di HP Android (Chrome):</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Buka menu titik tiga di kanan atas Chrome &rarr; pilih <strong>&ldquo;Instal Aplikasi&rdquo;</strong> atau <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
