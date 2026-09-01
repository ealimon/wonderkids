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
 * Creates or updates an on-screen modal dialog so the user can easily
 * print, share via AirPrint, or save image/PDF directly on iPad, iPhone, and desktop.
 */
function showPrintModal({
  dataUrl,
  title,
  safeFilename,
  onClose,
}: {
  dataUrl?: string;
  title: string;
  safeFilename: string;
  onClose: () => void;
}) {
  // Remove existing modal if any
  const existingModal = document.getElementById('storybook-print-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'storybook-print-modal';
  modal.className = 'fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans';
  
  modal.innerHTML = `
    <div class="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4 text-center text-black">
      <div class="w-14 h-14 bg-purple-100 border-3 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        🖨️
      </div>

      <div class="flex flex-col gap-1">
        <h3 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-purple-950">${title}</h3>
        <p class="text-xs sm:text-sm font-bold text-gray-600">Choose an option below to print or save your worksheet:</p>
      </div>

      ${dataUrl ? `
        <div class="w-full max-h-52 overflow-hidden rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-gray-50 flex items-center justify-center p-2">
          <img src="${dataUrl}" alt="Worksheet Preview" class="max-h-48 object-contain rounded-lg shadow-sm" />
        </div>
      ` : ''}

      <div class="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
        <button id="modal-share-airprint-btn" class="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-black text-sm uppercase px-5 py-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] hover:translate-y-[-1px] transition-all cursor-pointer">
          <span>🖨️ AIRPRINT / SHARE</span>
        </button>
        <button id="modal-download-btn" class="flex-1 flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-sm uppercase px-5 py-3.5 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] hover:translate-y-[-1px] transition-all cursor-pointer">
          <span>📥 SAVE / DOWNLOAD</span>
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

  // Helper to trigger native iOS share sheet or download
  const triggerShareOrAirPrint = async () => {
    if (!dataUrl) return;

    try {
      if (Capacitor.isNativePlatform()) {
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
        return;
      }

      // Convert data URL to Blob File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], safeFilename, { type: 'image/png' });

      // Web Share API on Safari iPadOS/iOS supports sharing files directly to AirPrint & Save Image
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `${title} - Storybook Education`,
        });
        return;
      }

      // Fallback: Open in new tab or trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>${title}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#f5f5f5;">
              <img src="${dataUrl}" style="max-width:100%;height:auto;" onload="window.print();"/>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('Share modal action error:', e);
      try { window.print(); } catch {}
    }
  };

  // AirPrint / Share button handler
  const shareBtn = document.getElementById('modal-share-airprint-btn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      triggerShareOrAirPrint();
    };
  }

  // Save / Download button handler
  const dlBtn = document.getElementById('modal-download-btn');
  if (dlBtn && dataUrl) {
    dlBtn.onclick = () => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }
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
 * Universal print, download, and native iPad / Apple App AirPrint helper.
 */
export async function exportOrPrintElement({
  element,
  filename = 'storybook_document',
  title = 'Storybook Education Document',
  onStart,
  onSuccess,
  onError,
}: ExportPrintOptions): Promise<boolean> {
  showStatusToast('⏳ Rendering high-resolution worksheet...');

  const targetEl = element || document.getElementById('shape-matcher-worksheet-paper') || document.body;

  try {
    if (onStart) onStart();

    const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.png`;

    // Render canvas with safe options (avoids cross-origin / svg crash on iOS)
    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => el.classList.contains('print:hidden'),
    });

    const dataUrl = canvas.toDataURL('image/png');

    // 1. Native Capacitor iOS / iPadOS App path
    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = dataUrl.split(',')[1] || dataUrl;
        
        const savedFile = await Filesystem.writeFile({
          path: safeFilename,
          data: base64Data,
          directory: Directory.Cache,
        });

        showStatusToast('🖨️ Opening AirPrint & Share Sheet...');

        await Share.share({
          title,
          text: `${title} - Storybook Education`,
          url: savedFile.uri,
          dialogTitle: `Print or Save ${title}`,
        });

        showStatusToast('✅ Worksheet ready!');
        if (onSuccess) onSuccess();
        return true;
      } catch (nativeErr) {
        console.warn('Capacitor native share error, opening interactive dialog:', nativeErr);
      }
    }

    // 2. Web Share / Direct fallback with Modal Helper
    showPrintModal({
      dataUrl,
      title,
      safeFilename,
      onClose: () => {
        if (onSuccess) onSuccess();
      },
    });

    // Also attempt native navigator.share if available
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], safeFilename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `${title} - Storybook Education`,
        });
      }
    } catch (shareErr) {
      console.log('Share prompt handled via modal:', shareErr);
    }

    if (onSuccess) onSuccess();
    return true;
  } catch (err) {
    console.error('Error generating document image:', err);
    showStatusToast('⚠️ Showing Print & Download dialog...', false);
    
    // Provide user modal with fallback direct print
    showPrintModal({
      title,
      safeFilename: `${filename}.png`,
      onClose: () => {
        if (onError) onError(err);
      },
    });

    try {
      window.print();
    } catch (e) {
      console.warn('window.print fallback failed:', e);
    }
    return false;
  }
}

