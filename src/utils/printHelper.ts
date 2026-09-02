import { Capacitor } from '@capacitor/core';
import { Printer } from '@capgo/capacitor-printer';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPrintOptions {
  element?: HTMLElement | null;
  filename?: string;
  title?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Toast notification for clear visual feedback
 */
function showStatusToast(message: string, isError = false) {
  let toast = document.getElementById('print-status-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'print-status-toast';
    toast.className =
      'fixed bottom-8 left-1/2 -translate-x-1/2 z-[999999] px-6 py-3.5 rounded-2xl border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 pointer-events-none text-center';
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
 * Extracts element HTML and wraps it in a standalone print document with full styling and print settings
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
        size: letter portrait;
        margin: 10mm 8mm;
      }
      *, *:before, *:after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 12px;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .print\\:hidden, button, [role="button"], #generate-sheet-btn, #print-sheet-btn {
        display: none !important;
      }
      /* Prevent worksheet cards and problem boxes from breaking across pages */
      .grid > div, .flex > div, [class*="rounded-"] {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    </style>
  </head>
  <body>
    <div style="max-width: 800px; margin: 0 auto; width: 100%;">
      ${element.outerHTML}
    </div>
  </body>
</html>`;
}

/**
 * Generates a high-resolution, perfectly aligned Letter-sized PDF from any HTML element
 */
export async function generatePdfDocument(element: HTMLElement, title: string): Promise<jsPDF> {
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution (crisp vectors & sharp text)
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    ignoreElements: (el) =>
      el.classList.contains('print:hidden') ||
      el.tagName === 'BUTTON' ||
      el.id === 'generate-sheet-btn' ||
      el.id === 'print-sheet-btn',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  // Standard US Letter Portrait (215.9 mm x 279.4 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 215.9 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 279.4 mm
  const marginSide = 8; // 8mm side margins
  const marginTop = 8; // 8mm top margin
  const printableWidth = pageWidth - marginSide * 2;
  const printableHeight = pageHeight - marginTop * 2;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  let renderWidth = printableWidth;
  let renderHeight = (imgHeight * renderWidth) / imgWidth;

  if (renderHeight > printableHeight) {
    renderHeight = printableHeight;
    renderWidth = (imgWidth * renderHeight) / imgHeight;
  }

  // Perfectly center horizontally
  const xOffset = marginSide + (printableWidth - renderWidth) / 2;
  const yOffset = marginTop;

  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
  pdf.setProperties({
    title,
    subject: 'Storybook Education Printable Worksheet',
    author: 'Storybook Education',
    creator: 'Storybook Education App',
  });

  return pdf;
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

  // 2. On native platforms, window.print()/iframe printing is a silent no-op inside WKWebView
  if (Capacitor.isNativePlatform()) {
    showStatusToast('⚠️ AirPrint unavailable — try Print PDF instead', true);
    return false;
  }

  // 3. Web fallback: Hidden iframe print
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
          showStatusToast('🖨️ Sent to printer!');
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

  // 4. Last-resort web fallback: Window Print
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
 * Generates a perfectly aligned PDF and immediately triggers the native print dialog for the PDF
 */
export async function executePrintPdf(
  element: HTMLElement,
  title: string,
  filename: string
): Promise<boolean> {
  showStatusToast('📄 Preparing aligned PDF...');
  const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.pdf`;

  try {
    const pdf = await generatePdfDocument(element, title);

    // 1. Native iOS / iPadOS App: Print PDF directly using Capacitor Native Printer
    if (Capacitor.isNativePlatform()) {
      try {
        const dataUri = pdf.output('datauristring');
        const rawBase64 = dataUri.split(',')[1] || dataUri;

        // Print base64 PDF directly to Apple AirPrint
        await Printer.printBase64({
          name: title,
          data: rawBase64,
          mimeType: 'application/pdf',
        });
        showStatusToast('✅ PDF sent to AirPrint!');
        return true;
      } catch (printErr) {
        console.warn('Printer.printBase64 error, trying file save and share:', printErr);

        // Fallback: Save file to cache and open native share sheet for printing/saving
        const dataUri = pdf.output('datauristring');
        const rawBase64 = dataUri.split(',')[1] || dataUri;

        const savedFile = await Filesystem.writeFile({
          path: safeFilename,
          data: rawBase64,
          directory: Directory.Cache,
        });

        await Share.share({
          title: `${title}.pdf`,
          text: `${title} - Storybook Education Worksheet (PDF)`,
          url: savedFile.uri,
          dialogTitle: `Print or Save ${title} (PDF)`,
        });

        showStatusToast('✅ PDF ready to print or save!');
        return true;
      }
    }

    // 2. Web browser preview: Open PDF in iframe to trigger print dialog
    try {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      const iframe = document.createElement('iframe');
      iframe.id = 'pdf-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            showStatusToast('🖨️ PDF sent to printer!');
          } catch {
            pdf.save(safeFilename);
            showStatusToast('💾 PDF downloaded!');
          } finally {
            setTimeout(() => {
              iframe.remove();
              URL.revokeObjectURL(blobUrl);
            }, 3000);
          }
        }, 300);
      };
      return true;
    } catch {
      pdf.save(safeFilename);
      showStatusToast('💾 PDF downloaded!');
      return true;
    }
  } catch (err: any) {
    const message = String(err?.message || err || '');
    if (!/cancel/i.test(message)) {
      console.error('PDF print error:', err);
      showStatusToast('⚠️ Unable to print PDF', true);
    }
    return false;
  }
}

/**
 * Display interactive dialog with direct AirPrint and Print PDF options
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
        <span class="text-sm font-black text-amber-950 uppercase">✨ APPLE AIRPRINT READY</span>
        <span class="text-xs font-bold text-amber-800">Tap below to select your printer or print a PDF copy.</span>
      </div>

      <div class="flex flex-col gap-3 w-full justify-center mt-1">
        <button id="modal-direct-airprint-btn" class="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-black text-sm uppercase px-5 py-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all cursor-pointer">
          <span class="text-base">🖨️</span>
          <span>CONNECT TO AIRPRINT</span>
        </button>
        <button id="modal-print-pdf-btn" class="w-full flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500 text-black font-black text-sm uppercase px-5 py-3.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all cursor-pointer">
          <span class="text-base">📄</span>
          <span>PRINT PDF</span>
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
  const airprintBtn = document.getElementById('modal-direct-airprint-btn') as HTMLButtonElement | null;
  if (airprintBtn) {
    airprintBtn.onclick = async () => {
      if (airprintBtn.disabled) return;
      airprintBtn.disabled = true;
      const originalHtml = airprintBtn.innerHTML;
      airprintBtn.innerHTML = '<span>Connecting…</span>';
      const ok = await executeDirectPrint(element, title);
      airprintBtn.disabled = false;
      airprintBtn.innerHTML = originalHtml;
      if (ok) {
        modal.remove();
        onClose();
      }
    };
  }

  // Print PDF button handler
  const printPdfBtn = document.getElementById('modal-print-pdf-btn') as HTMLButtonElement | null;
  if (printPdfBtn) {
    printPdfBtn.onclick = async () => {
      if (printPdfBtn.disabled) return;
      printPdfBtn.disabled = true;
      const originalHtml = printPdfBtn.innerHTML;
      printPdfBtn.innerHTML = '<span>Rendering PDF…</span>';
      const ok = await executePrintPdf(element, title, safeFilename);
      printPdfBtn.disabled = false;
      printPdfBtn.innerHTML = originalHtml;
      if (ok) {
        modal.remove();
        onClose();
      }
    };
  }
}

/**
 * Universal print, PDF export, and native iPad AirPrint entry point.
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
    if (onError) onError(err);
    return false;
  }
}
