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
 * Toast notification for non-intrusive, clear feedback
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
 * (Used for computer/desktop browser print preview)
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
 * Universal Print & PDF entry point:
 * - On Native iPad / iPhone (iOS App):
 *   Uses `Printer.printWebView()` which hooks directly into Apple WKWebView's
 *   `viewPrintFormatter()`. This renders with the real WebKit CSS engine (proper 4-column
 *   grid, exact fonts, background colors, and clean page breaks).
 *   In AirPrint, users can print or pinch-zoom to save/share as a PDF.
 *
 * - On Computer / Desktop Web Browser:
 *   Opens the browser's high-resolution print window via an isolated iframe,
 *   allowing users to print or choose "Save as PDF" directly.
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

  const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.html`;

  try {
    if (onStart) onStart();

    // ==========================================
    // 1. NATIVE iOS APP (iPad & iPhone)
    // ==========================================
    if (Capacitor.isNativePlatform()) {
      showStatusToast('🖨️ Opening AirPrint...');
      try {
        await Printer.printWebView({
          name: title,
        });
        showStatusToast('✅ Sent to AirPrint!');
        if (onSuccess) onSuccess();
        return true;
      } catch (pluginErr: any) {
        const msg = String(pluginErr?.message || pluginErr || '');
        if (/cancel/i.test(msg)) {
          return true;
        }

        console.warn('AirPrint printWebView call failed, offering Share Sheet fallback:', pluginErr);

        try {
          const htmlContent = buildPrintableHtml(targetEl, title);
          const savedFile = await Filesystem.writeFile({
            path: safeFilename,
            data: htmlContent,
            directory: Directory.Cache,
          });

          await Share.share({
            title: `${title}`,
            text: `${title} - Storybook Education Worksheet`,
            url: savedFile.uri,
            dialogTitle: `Print or Save ${title}`,
          });

          if (onSuccess) onSuccess();
          return true;
        } catch (shareErr) {
          console.error('Share fallback error:', shareErr);
          showStatusToast('⚠️ Unable to open AirPrint', true);
          if (onError) onError(shareErr);
          return false;
        }
      }
    }

    // ==========================================
    // 2. COMPUTER / DESKTOP WEB BROWSER
    // ==========================================
    showStatusToast('🖨️ Opening print preview...');

    const htmlContent = buildPrintableHtml(targetEl, title);
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
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          if (onSuccess) onSuccess();
        } catch {
          window.print();
          if (onSuccess) onSuccess();
        } finally {
          setTimeout(() => iframe.remove(), 2500);
        }
      }, 350);
      return true;
    } else {
      window.print();
      if (onSuccess) onSuccess();
      return true;
    }
  } catch (err) {
    console.error('exportOrPrintElement error:', err);
    showStatusToast('⚠️ Print preview failed', true);
    if (onError) onError(err);
    return false;
  }
}
