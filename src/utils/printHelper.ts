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

        // Open native iOS Action Sheet (AirPrint, Save Image, Files, AirDrop)
        await Share.share({
          title: title,
          text: `${title} - Storybook Education`,
          url: savedFile.uri,
          dialogTitle: `Print or Save ${title}`,
        });

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
            await navigator.share({
              files: [file],
              title: title,
              text: `${title} - Storybook Education`,
            });
            if (onSuccess) onSuccess();
            resolve(true);
            return;
          } catch (shareErr) {
            console.log('Share sheet dismissed or handled:', shareErr);
          }
        }

        // 3. Fallback: Direct download anchor tag
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
    if (onError) onError(err);
    try {
      window.print();
    } catch (e) {
      console.warn('window.print fallback failed:', e);
    }
    return false;
  }
}

