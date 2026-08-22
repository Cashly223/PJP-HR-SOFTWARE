/**
 * Universal Printing & Document Export Utility for Pope John Paul II Medical Centre HRMS
 * Supports high-fidelity printing in all browser contexts including sandboxed iframes.
 */

interface PrintOptions {
  title?: string;
  landscape?: boolean;
  styles?: string;
  onComplete?: () => void;
}

/**
 * Generates an isolated, self-contained, official hospital printable HTML document
 */
export function buildHospitalPrintDocument(contentHtml: string, title = 'Official Document', landscape = false, customStyles = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Pope John Paul II Medical Centre</title>
  <style>
    @page {
      size: ${landscape ? 'A4 landscape' : 'A4 portrait'};
      margin: 10mm 14mm 10mm 14mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Times New Roman', Times, Georgia, Cambria, serif;
      font-size: 10.5pt;
      line-height: 1.42;
    }
    .print-container {
      width: 100%;
      max-width: ${landscape ? '1060px' : '760px'};
      margin: 0 auto;
      padding: 12px;
      background: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #000000;
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      border: 1px solid #000000;
      padding: 5px 8px;
      font-size: 9.5pt;
      text-align: left;
      color: #000000;
    }
    th {
      background-color: #f1f5f9 !important;
      font-weight: 700;
    }
    .no-print, .print-hidden, .print\\:hidden {
      display: none !important;
    }
    .avoid-break, .page-break-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .grid {
      display: grid;
    }
    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .gap-3 { gap: 12px; }
    .gap-6 { gap: 24px; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .uppercase { text-transform: uppercase; }
    .italic { font-style: italic; }
    .underline { text-decoration: underline; }
    .border-b { border-bottom: 1px solid #000000; }
    .border-b-2 { border-bottom: 2px solid #000000; }
    .border-t-2 { border-top: 2px solid #000000; }
    .border-dashed { border-style: dashed; }
    .border-l-4 { border-left: 4px solid #000000; }
    .p-3 { padding: 12px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .pt-2 { padding-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .mb-1 { margin-bottom: 4px; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-2\\.5 > * + * { margin-top: 10px; }
    .space-y-4 > * + * { margin-top: 16px; }
    .bg-slate-50 { background-color: #f8fafc !important; }
    .text-rose-700 { color: #000000 !important; font-weight: bold; }
    .text-slate-900, .text-slate-950, .text-slate-800, .text-slate-700, .text-slate-600 { color: #000000 !important; }
    .action-bar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 16px;
      background: #0f172a;
      color: #ffffff;
      margin-bottom: 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .action-btn {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    }
    .action-btn.secondary {
      background: #334155;
    }
    .action-btn:hover {
      opacity: 0.9;
    }
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .action-bar {
        display: none !important;
      }
      .print-container {
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
    }
    ${customStyles}
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn" onclick="window.print()">🖨️ Print Document / Save as PDF</button>
    <button class="action-btn secondary" onclick="window.close()">✖ Close Window</button>
  </div>
  <div class="print-container">
    ${contentHtml}
  </div>
  <script>
    window.onload = function() {
      // Auto-trigger print if launched in dedicated window
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.warn('Auto print trigger prevented', e);
        }
      }, 350);
    };
  </script>
</body>
</html>`;
}

/**
 * Universal print handler that triggers printing with reliable fallbacks
 */
export function printHtmlContent(htmlContent: string, title = 'Official Document', options: PrintOptions = {}): boolean {
  const fullHtml = buildHospitalPrintDocument(htmlContent, title, options.landscape || false, options.styles || '');

  // Method 1: Pop-up print window
  try {
    const printWindow = window.open('', '_blank', 'width=950,height=800,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();
      if (options.onComplete) options.onComplete();
      return true;
    }
  } catch (err) {
    console.warn('Popup print was blocked, attempting hidden iframe method...', err);
  }

  // Method 2: Hidden iframe printer
  try {
    const printIframe = document.createElement('iframe');
    printIframe.setAttribute('title', 'Print Preview Frame');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.visibility = 'hidden';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      setTimeout(() => {
        try {
          if (printIframe.contentWindow) {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
          } else {
            window.print();
          }
        } catch (e) {
          console.warn('Iframe print error, falling back to window.print()', e);
          window.print();
        }

        setTimeout(() => {
          try {
            document.body.removeChild(printIframe);
          } catch (e) {
            // Ignore removal errors
          }
          if (options.onComplete) options.onComplete();
        }, 1500);
      }, 400);

      return true;
    }
  } catch (iframeErr) {
    console.warn('Iframe printing failed, defaulting to native window.print()', iframeErr);
  }

  // Method 3: Native window print fallback
  window.print();
  if (options.onComplete) options.onComplete();
  return true;
}

/**
 * Prints any DOM element by its ID
 */
export function printElementById(elementId: string, title = 'Official Document', options: PrintOptions = {}): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for printing`);
    window.print();
    return false;
  }

  const clonedElement = element.cloneNode(true) as HTMLElement;
  // Remove buttons with no-print or print:hidden classes
  const noPrintEls = clonedElement.querySelectorAll('.print\\:hidden, .no-print');
  noPrintEls.forEach((el) => el.remove());

  return printHtmlContent(clonedElement.outerHTML, title, options);
}

/**
 * Downloads a standalone printable HTML file as offline backup
 */
export function downloadPrintableHtml(htmlContent: string, filename: string, title = 'Official Document', landscape = false) {
  const fullHtml = buildHospitalPrintDocument(htmlContent, title, landscape);
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
