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
 * Creates or updates an on-screen toast/modal feedback so the user always sees
 * immediate feedback when tapping Print / Download on iPad, iPhone, or Desktop.
 */
function showStatusToast(message: string, isError = false) {
  let toast = document.getElementById('print-status-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'print-status-toast';
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-2xl border-3 border-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2';
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
 * 
 * Works seamlessly across:
 * 1. Native Capacitor iOS / iPadOS App (via Capacitor Share & Filesystem -> AirPrint & Save to Photos)
 * 2. Web Share API (Safari iOS / iPadOS Action Sheet)
 * 3. Fallback Printable Window & direct PNG download for desktop / standard browsers
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

  if (!element) {
    try {
      window.print();
    } catch {
      // ignore
    }
    return true;
  }

  try {
    if (onStart) onStart();

    // Render high-resolution canvas (2x scale for crisp Retina / high-DPI print clarity)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.png`;
    const dataUrl = canvas.toDataURL('image/png');

    // 1. Check if running inside Capacitor Native iOS / iPadOS App
    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = dataUrl.split(',')[1] || dataUrl;
        
        // Write the high-resolution file to native cache
        const savedFile = await Filesystem.writeFile({
          path: safeFilename,
          data: base64Data,
          directory: Directory.Cache,
        });

        showStatusToast('🖨️ Opening AirPrint & Share Sheet...');

        // Open native iOS Action Sheet (AirPrint, Save Image, Files, AirDrop)
        await Share.share({
          title: title,
          text: `${title} - Storybook Education`,
          url: savedFile.uri,
          dialogTitle: `Print or Save ${title}`,
        });

        showStatusToast('✅ Worksheet ready!');
        if (onSuccess) onSuccess();
        return true;
      } catch (nativeErr) {
        console.warn('Capacitor native share error, falling back:', nativeErr);
      }
    }

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          try {
            window.print();
          } catch {}
          if (onSuccess) onSuccess();
          resolve(false);
          return;
        }

        const file = new File([blob], safeFilename, { type: 'image/png' });

        // 2. Check if native iOS / iPadOS Web Share with file is available
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            showStatusToast('🖨️ Opening AirPrint & Share Sheet...');
            await navigator.share({
              files: [file],
              title: title,
              text: `${title} - Storybook Education`,
            });
            showStatusToast('✅ Worksheet ready!');
            if (onSuccess) onSuccess();
            resolve(true);
            return;
          } catch (shareErr) {
            console.log('Share sheet dismissed or handled:', shareErr);
          }
        }

        // 3. Fallback: Direct download anchor tag
        showStatusToast('📥 Downloading high-res printable PNG...');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = safeFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up object URL after a short timeout
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        // Also trigger standard window.print() for desktop browsers
        try {
          window.print();
        } catch (e) {
          console.warn('window.print() not available:', e);
        }

        if (onSuccess) onSuccess();
        resolve(true);
      }, 'image/png');
    });
  } catch (err) {
    console.error('Error generating document image:', err);
    showStatusToast('⚠️ Print fallback initiated...', true);
    if (onError) onError(err);
    try {
      window.print();
    } catch (e) {
      console.warn('window.print fallback failed:', e);
    }
    return false;
  }
}

