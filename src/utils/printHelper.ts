import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface ExportPrintOptions {
  element: HTMLElement | null;
  filename?: string;
  title?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Converts a base64 Data URL to a File synchronously
 */
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Creates or updates an on-screen toast feedback
 */
function showStatusToast(message: string, isError = false) {
  let toast = document.getElementById('print-status-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'print-status-toast';
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2';
    document.body.appendChild(toast);
  }
  toast.style.display = 'flex';
  toast.style.backgroundColor = isError ? '#f87171' : '#fde047';
  toast.style.color = '#000000';
  toast.innerText = message;

  setTimeout(() => {
    if (toast) toast.style.display = 'none';
  }, 4000);
}

/**
 * Invokes native AirPrint / Share or Web Share
 */
async function performAirPrint({
  dataUrl,
  title,
  safeFilename,
}: {
  dataUrl: string;
  title: string;
  safeFilename: string;
}) {
  showStatusToast('🖨️ Opening AirPrint & Share Sheet...');

  // 1. If running inside Capacitor Native iOS / iPadOS App
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      const savedFile = await Filesystem.writeFile({
        path: safeFilename,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title,
        text: `${title} - Storybook Education`,
        url: savedFile.uri,
        dialogTitle: `AirPrint or Save ${title}`,
      });
      showStatusToast('✅ AirPrint sheet opened!');
      return;
    } catch (capErr) {
      console.warn('Native Capacitor Share error, trying Web Share:', capErr);
    }
  }

  // 2. Web Share API (Safari iPadOS/iOS)
  try {
    const file = dataURLtoFile(dataUrl, safeFilename);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text: `${title} - Storybook Education`,
      });
      showStatusToast('✅ Share sheet opened!');
      return;
    }
  } catch (shareErr) {
    console.warn('Web Share API error:', shareErr);
  }

  // 3. Fallback: Download and trigger window print
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {}

  try {
    window.print();
  } catch {}
}

/**
 * Creates or updates an on-screen modal dialog showing the rendered worksheet
 * with direct AirPrint and Download action buttons.
 */
function showPrintModal({
  dataUrl,
  title,
  safeFilename,
  onClose,
}: {
  dataUrl: string;
  title: string;
  safeFilename: string;
  onClose: () => void;
}) {
  const existingModal = document.getElementById('storybook-print-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'storybook-print-modal';
  modal.className = 'fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none';
  
  modal.innerHTML = `
    <div class="bg-white border-4 border-black rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4 text-center text-black">
      <div class="w-12 h-12 bg-purple-100 border-3 border-black rounded-2xl flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        🖨️
      </div>

      <div class="flex flex-col gap-0.5">
        <h3 class="text-lg sm:text-xl font-black uppercase tracking-tight text-purple-950">${title}</h3>
        <p class="text-xs font-bold text-gray-600">High-resolution worksheet is ready!</p>
      </div>

      <div class="w-full flex flex-col items-center gap-2">
        <div class="w-full max-h-56 overflow-hidden rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-gray-50 flex items-center justify-center p-2">
          <img 
            id="modal-worksheet-img"
            src="${dataUrl}" 
            alt="Worksheet Preview" 
            class="max-h-52 object-contain rounded-lg shadow-sm" 
            style="-webkit-touch-callout: default !important; -webkit-user-select: auto !important; user-select: auto !important;"
          />
        </div>
        <span class="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          💡 iPad Tip: Tap & hold image to Save to Photos or Print directly
        </span>
      </div>

      <div class="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
        <button id="modal-share-airprint-btn" class="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-black text-xs sm:text-sm uppercase px-4 py-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] hover:translate-y-[-1px] transition-all cursor-pointer">
          <span>🖨️ SEND TO AIRPRINT</span>
        </button>
        <button id="modal-download-btn" class="flex-1 flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs sm:text-sm uppercase px-4 py-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] hover:translate-y-[-1px] transition-all cursor-pointer">
          <span>💾 SAVE / DOWNLOAD</span>
        </button>
      </div>

      <button id="modal-close-btn" class="text-xs font-black text-gray-500 uppercase hover:text-black tracking-wider pt-1 cursor-pointer">
        ✕ CLOSE WINDOW
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handler
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.remove();
      onClose();
    };
  }

  // AirPrint / Share button handler
  const shareBtn = document.getElementById('modal-share-airprint-btn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      performAirPrint({ dataUrl, title, safeFilename });
    };
  }

  // Save / Download handler
  const dlBtn = document.getElementById('modal-download-btn');
  if (dlBtn) {
    dlBtn.onclick = () => {
      try {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatusToast('💾 Saving worksheet to device...');
      } catch {
        const w = window.open();
        if (w) {
          w.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;"/>`);
        }
      }
    };
  }
}

/**
 * Universal print, download, and native iPad / Apple App AirPrint helper.
 */
export async function exportOrPrintElement({
  element,
  filename = 'storybook_worksheet',
  title = 'Printable Worksheet',
  onStart,
  onSuccess,
  onError,
}: ExportPrintOptions): Promise<boolean> {
  showStatusToast('⏳ Rendering high-resolution worksheet...');

  const targetEl = element || document.querySelector('[id$="-worksheet-paper"]') as HTMLElement || document.body;

  try {
    if (onStart) onStart();
    const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.png`;

    // Render high-res canvas (with resilient fallbacks for SVG, CSS and emojis)
    const canvas = await html2canvas(targetEl, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => el.classList.contains('print:hidden'),
    });

    const dataUrl = canvas.toDataURL('image/png');

    // Automatically trigger AirPrint immediately if running in native app
    if (Capacitor.isNativePlatform()) {
      performAirPrint({ dataUrl, title, safeFilename });
    }

    // Display the interactive print modal with preview and buttons
    showPrintModal({
      dataUrl,
      title,
      safeFilename,
      onClose: () => {
        if (onSuccess) onSuccess();
      },
    });

    if (onSuccess) onSuccess();
    return true;
  } catch (err) {
    console.error('Error generating document image:', err);
    showStatusToast('⚠️ Print fallback initiated...', true);
    if (onError) onError(err);
    try {
      window.print();
    } catch {}
    return false;
  }
}


