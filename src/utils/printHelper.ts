import { Capacitor } from '@capacitor/core';
import { Printer } from '@capgo/capacitor-printer';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface ExportPrintOptions {
  element?: HTMLElement | null;
  filename?: string;
  title?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Toast notification for clear feedback
 */
function showStatusToast(message: string, isError = false) {
  let toast = document.getElementById('print-status-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'print-status-toast';
    toast.className =
      'fixed bottom-8 left-1/2 -translate-x-1/2 z-[999999] px-6 py-3.5 rounded-2xl border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 pointer-events-none';
    document.body.appendChild(toast);
  }
  toast.style.display = 'flex';
  toast.style.backgroundColor = isError ? '#f87171' : '#fde047';
  toast.style.color = '#000000';
  toast.innerText = message;

  setTimeout(() => {
    if (toast) toast.style.display = 'none';
  }, 3500);
}

/**
 * Extracts element HTML and wraps it in standalone print document with full styling
 */
function buildPrintableHtml(element: HTMLElement, title: string): string {
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${styles}
    <style>
      @page {
        size: portrait;
        margin: 8mm;
      }
      body {
        margin: 0;
        padding: 16px;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print\\:hidden, button, [role="button"], #generate-sheet-btn, #print-sheet-btn {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div style="max-width: 800px; margin: 0 auto;">
      ${element.outerHTML}
    </div>
  </body>
</html>`;
}

/**
 * Executes direct printing using Capacitor Native AirPrint (UIPrintInteractionController)
 * or browser printing fallback
 */
export async function executeDirectPrint(element: HTMLElement, title: string): Promise<boolean> {
  showStatusToast('🖨️ Opening AirPrint...');

  // 1. Native iOS via @capgo/capacitor-printer plugin (True Apple AirPrint)
  if (Capacitor.isNativePlatform()) {
    try {
      const htmlContent = buildPrintableHtml(element, title);
      await Printer.printHtml({
        name: title,
        html: htmlContent,
      });
      showStatusToast('✅ Sent to AirPrint!');
      return true;
    } catch (pluginErr) {
      console.warn('Capacitor Printer plugin error, falling back:', pluginErr);
    }
  }

  // 2. Fallback: Hidden iframe print
  try {
    const existing = document.getElementById('print-iframe-target');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe-target';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(buildPrintableHtml(element, title));
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          showStatusToast('🖨️ Sent to AirPrint!');
        } catch {
          window.print();
        } finally {
          setTimeout(() => iframe.remove(), 2000);
        }
      }, 350);
      return true;
    }
  } catch (iframeErr) {
    console.warn('Iframe print error:', iframeErr);
  }

  // 3. Fallback: Window Print
  try {
    window.print();
    return true;
  } catch (winErr) {
    console.error('Window print error:', winErr);
    showStatusToast('⚠️ Unable to trigger print', true);
    return false;
  }
}

/**
 * Saves or shares the worksheet as a standalone HTML file
 */
export async function executeSaveOrShare(element: HTMLElement, title: string, filename: string) {
  const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.html`;
  const fullHtml = buildPrintableHtml(element, title);

  if (Capacitor.isNativePlatform()) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: safeFilename,
        data: fullHtml,
        directory: Directory.Cache,
      });

      await Share.share({
        title,
        text: `${title} - Storybook Education`,
        url: savedFile.uri,
        dialogTitle: `Save or Print ${title}`,
      });
      showStatusToast('✅ Share sheet opened!');
      return;
    } catch (shareErr) {
      console.warn('Native share error:', shareErr);
    }
  }

  // Web download fallback
  try {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showStatusToast('💾 Worksheet saved!');
  } catch (dlErr) {
    console.error('Save error:', dlErr);
  }
}

/**
 * Display interactive dialog with direct AirPrint, Save, and Print options
 */
function showPrintDialog({
  element,
  title,
  safeFilename,
  onClose,
}: {
  element: HTMLElement;
  title: string;
  safeFilename: string;
  onClose: () => void;
}) {
  const existingModal = document.getElementById('storybook-print-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'storybook-print-modal';
  modal.className =
    'fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none';

  modal.innerHTML = `
    <div class="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-5 text-center text-black">
      <div class="w-14 h-14 bg-purple-100 border-3 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        🖨️
      </div>

      <div class="flex flex-col gap-1">
        <h3 class="text-xl font-black uppercase tracking-tight text-purple-950">${title}</h3>
        <p class="text-xs font-bold text-gray-600">Worksheet is formatted and ready for your printer!</p>
      </div>

      <div class="w-full bg-amber-50 border-3 border-black rounded-2xl p-4 flex flex-col items-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <span class="text-sm font-black text-amber-950 uppercase">✨ Apple AirPrint Ready</span>
        <span class="text-xs font-bold text-amber-800">Tap below to select your printer or save a copy.</span>
      </div>

      <div class="flex flex-col gap-3 w-full justify-center mt-1">
        <button id="modal-direct-airprint-btn" class="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-black text-sm uppercase px-5 py-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all cursor-pointer">
          <span class="text-base">🖨️</span>
          <span>CONNECT TO AIRPRINT</span>
        </button>
        <button id="modal-save-file-btn" class="w-full flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 text-black font-black text-sm uppercase px-5 py-3.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all cursor-pointer">
          <span class="text-base">💾</span>
          <span>SAVE / SHARE FILE</span>
        </button>
      </div>

      <button id="modal-close-btn" class="text-xs font-black text-gray-500 uppercase hover:text-black tracking-wider pt-2 cursor-pointer">
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

  // AirPrint button handler
  const airprintBtn = document.getElementById('modal-direct-airprint-btn');
  if (airprintBtn) {
    airprintBtn.onclick = async () => {
      await executeDirectPrint(element, title);
    };
  }

  // Save / Share button handler
  const saveBtn = document.getElementById('modal-save-file-btn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      await executeSaveOrShare(element, title, safeFilename);
    };
  }
}

/**
 * Universal print, download, and native iPad AirPrint entry point.
 */
export async function exportOrPrintElement({
  element,
  filename = 'storybook_worksheet',
  title = 'Printable Worksheet',
  onStart,
  onSuccess,
  onError,
}: ExportPrintOptions): Promise<boolean> {
  const targetEl =
    element ||
    (document.querySelector('[id$="-worksheet-paper"]') as HTMLElement) ||
    document.body;

  const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}`;

  try {
    if (onStart) onStart();

    // Directly trigger native print dialog if on native device
    if (Capacitor.isNativePlatform()) {
      await executeDirectPrint(targetEl, title);
    }

    // Always show the dialog with direct buttons as well
    showPrintDialog({
      element: targetEl,
      title,
      safeFilename,
      onClose: () => {
        if (onSuccess) onSuccess();
      },
    });

    if (onSuccess) onSuccess();
    return true;
  } catch (err) {
    console.error('exportOrPrintElement error:', err);
    await executeDirectPrint(targetEl, title);
    if (onError) onError(err);
    return false;
  }
}
