import html2canvas from 'html2canvas';

export interface ExportPrintOptions {
  element: HTMLElement | null;
  filename?: string;
  title?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Universal print, download, and native iPad share helper.
 * On iPadOS / iOS WKWebView, window.print() and iframe printing are often blocked.
 * This helper renders a high-res image via html2canvas and:
 * 1. Invokes native iPad Action Sheet (navigator.share) with Print (AirPrint), Save Image, Save to Files, AirDrop.
 * 2. Fallbacks to direct PNG download + window.print() for desktop and standard browsers.
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
    // Fallback if element not found: standard window.print
    window.print();
    return true;
  }

  try {
    if (onStart) onStart();

    // Render high-resolution canvas (2x scale for retina / high-DPI print clarity)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          window.print();
          if (onSuccess) onSuccess();
          resolve(false);
          return;
        }

        const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.png`;
        const file = new File([blob], safeFilename, { type: 'image/png' });

        // 1. Check if native iOS / iPadOS Web Share with file is available
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
            // User cancelled share sheet or share error - proceed to fallbacks
            console.log('Share dismissed or handled:', shareErr);
          }
        }

        // 2. Fallback: Direct Download anchor tag
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
    // Final fallback
    try {
      window.print();
    } catch (e) {
      console.warn('window.print fallback failed:', e);
    }
    return false;
  }
}
