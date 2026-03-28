import { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { Tool, Overlay } from '../App'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface Props {
  pdfData: ArrayBuffer
  currentPage: number
  zoom: number
  activeTool: Tool
  overlays: Overlay[]
  signatureDataURL: string | null
  onTotalPages: (n: number) => void
  onAddOverlay: (overlay: Overlay) => void
  onUpdateOverlay: (id: string, updates: Partial<Overlay>) => void
  onDeleteOverlay: (id: string) => void
}

export default function PDFViewer({
  pdfData,
  currentPage,
  zoom,
  activeTool,
  overlays,
  signatureDataURL,
  onTotalPages,
  onAddOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 })
  const [dragging, setDragging] = useState<string | null>(null)
  const [resizing, setResizing] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const data = new Uint8Array(pdfData).slice()
        const pdf = await pdfjsLib.getDocument({ data }).promise
        onTotalPages(pdf.numPages)
        const page = await pdf.getPage(currentPage)
        const viewport = page.getViewport({ scale: zoom * 1.5 })

        const canvas = canvasRef.current
        if (!canvas || cancelled) return
        canvas.width = viewport.width
        canvas.height = viewport.height
        setPageSize({ width: viewport.width, height: viewport.height })

        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        await page.render({ canvasContext: ctx, viewport }).promise
      } catch (err) {
        console.error('PDF render error:', err)
      }
    }
    render()
    return () => { cancelled = true }
  }, [pdfData, currentPage, zoom, onTotalPages])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === 'select') {
        setSelectedId(null)
        return
      }

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (activeTool === 'signature' && signatureDataURL) {
        const w = 200 * zoom
        const h = 80 * zoom
        onAddOverlay({
          id: crypto.randomUUID(),
          type: 'signature',
          page: currentPage,
          x: x - w / 2,
          y: y - h / 2,
          width: w,
          height: h,
          dataURL: signatureDataURL,
        })
      } else if (activeTool === 'text') {
        onAddOverlay({
          id: crypto.randomUUID(),
          type: 'text',
          page: currentPage,
          x,
          y,
          width: 150 * zoom,
          height: 30 * zoom,
          text: '',
          fontSize: 14,
        })
      }
    },
    [activeTool, signatureDataURL, currentPage, zoom, onAddOverlay]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, overlay: Overlay, isResize = false) => {
      e.stopPropagation()
      setSelectedId(overlay.id)
      if (isResize) {
        setResizing(overlay.id)
      } else {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        setDragging(overlay.id)
        setDragOffset({
          x: e.clientX - rect.left - overlay.x,
          y: e.clientY - rect.top - overlay.y,
        })
      }
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (dragging) {
        onUpdateOverlay(dragging, {
          x: mx - dragOffset.x,
          y: my - dragOffset.y,
        })
      } else if (resizing) {
        const overlay = overlays.find((o) => o.id === resizing)
        if (overlay) {
          onUpdateOverlay(resizing, {
            width: Math.max(50, mx - overlay.x),
            height: Math.max(20, my - overlay.y),
          })
        }
      }
    },
    [dragging, resizing, dragOffset, overlays, onUpdateOverlay]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setResizing(null)
  }, [])

  const pageOverlays = overlays.filter((o) => o.page === currentPage)

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-slate-200 flex justify-center p-8"
    >
      <div
        className="relative inline-block shadow-xl"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`block ${
            activeTool === 'signature'
              ? 'cursor-crosshair'
              : activeTool === 'text'
              ? 'cursor-text'
              : 'cursor-default'
          }`}
        />
        {pageOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className={`absolute group ${
              selectedId === overlay.id ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'
            } ${dragging === overlay.id ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: overlay.x,
              top: overlay.y,
              width: overlay.width,
              height: overlay.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, overlay)}
          >
            {overlay.type === 'signature' && overlay.dataURL && (
              <img
                src={overlay.dataURL}
                alt="Signature"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            )}
            {overlay.type === 'text' && (
              <input
                type="text"
                value={overlay.text || ''}
                onChange={(e) =>
                  onUpdateOverlay(overlay.id, { text: e.target.value })
                }
                placeholder="Type here..."
                className="w-full h-full bg-transparent border-none outline-none px-1 text-black"
                style={{ fontSize: (overlay.fontSize || 14) * zoom }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteOverlay(overlay.id)
                setSelectedId(null)
              }}
            >
              x
            </button>
            <div
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, overlay, true)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
