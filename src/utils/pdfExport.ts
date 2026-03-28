import { PDFDocument } from 'pdf-lib'
import { Overlay } from '../App'

export async function exportPDF(
  originalPdfData: ArrayBuffer,
  overlays: Overlay[]
): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.load(originalPdfData)
  const pages = pdfDoc.getPages()

  for (const overlay of overlays) {
    const pageIndex = overlay.page - 1
    if (pageIndex < 0 || pageIndex >= pages.length) continue
    const page = pages[pageIndex]
    const { width: pageWidth, height: pageHeight } = page.getSize()

    // Get the canvas to find the scale factor between display and PDF coordinates
    const canvas = document.querySelector('canvas')
    if (!canvas) continue
    const scaleX = pageWidth / canvas.width
    const scaleY = pageHeight / canvas.height

    // Convert from screen coords (top-left origin) to PDF coords (bottom-left origin)
    const pdfX = overlay.x * scaleX
    const pdfY = pageHeight - (overlay.y + overlay.height) * scaleY
    const pdfW = overlay.width * scaleX
    const pdfH = overlay.height * scaleY

    if (overlay.type === 'signature' && overlay.dataURL) {
      const pngBytes = await fetch(overlay.dataURL).then((r) => r.arrayBuffer())
      const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes))
      page.drawImage(pngImage, {
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
      })
    } else if (overlay.type === 'text' && overlay.text) {
      const fontSize = (overlay.fontSize || 14) * scaleX
      page.drawText(overlay.text, {
        x: pdfX,
        y: pdfY + pdfH * 0.3,
        size: fontSize,
      })
    }
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes.buffer as ArrayBuffer
}
