import { useState, useCallback } from 'react'
import PDFUploader from './components/PDFUploader'
import PDFViewer from './components/PDFViewer'
import Toolbar from './components/Toolbar'
import SignatureModal from './components/SignatureModal'
import { exportPDF } from './utils/pdfExport'

export type Tool = 'select' | 'signature' | 'text'

export interface Overlay {
  id: string
  type: 'signature' | 'text'
  page: number
  x: number
  y: number
  width: number
  height: number
  dataURL?: string
  text?: string
  fontSize?: number
}

export default function App() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [pdfName, setPdfName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureDataURL, setSignatureDataURL] = useState<string | null>(null)

  const handleFileLoad = useCallback((data: ArrayBuffer, name: string) => {
    setPdfData(data)
    setPdfName(name)
    setCurrentPage(1)
    setOverlays([])
    setActiveTool('select')
  }, [])

  const handleAddOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay])
  }, [])

  const handleUpdateOverlay = useCallback((id: string, updates: Partial<Overlay>) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    )
  }, [])

  const handleDeleteOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id))
  }, [])

  const handleSignatureDone = useCallback((dataURL: string) => {
    setSignatureDataURL(dataURL)
    setShowSignatureModal(false)
    setActiveTool('signature')
  }, [])

  const buildPDF = useCallback(async () => {
    if (!pdfData) return null
    return exportPDF(pdfData, overlays)
  }, [pdfData, overlays])

  const handleSave = useCallback(async () => {
    try {
      const pdfBytes = await buildPDF()
      if (!pdfBytes) return
      if (window.electronAPI) {
        await window.electronAPI.saveFile(pdfBytes)
      } else {
        // In browser, "Save" saves with original name
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = pdfName
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Save failed:', err)
      alert('Save failed. Check console for details.')
    }
  }, [buildPDF, pdfName])

  const handleExport = useCallback(async () => {
    try {
      const pdfBytes = await buildPDF()
      if (!pdfBytes) return
      // Export always downloads with -signed suffix
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pdfName.replace('.pdf', '-signed.pdf')
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed. Check console for details.')
    }
  }, [buildPDF, pdfName])

  if (!pdfData) {
    return <PDFUploader onFileLoad={handleFileLoad} />
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3, z + 0.25))}
        onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.25))}
        onOpenSignature={() => setShowSignatureModal(true)}
        onSave={handleSave}
        onExport={handleExport}
        onNewFile={() => {
          setPdfData(null)
          setPdfName('')
          setOverlays([])
        }}
        hasSignature={!!signatureDataURL}
        pdfName={pdfName}
      />
      <PDFViewer
        pdfData={pdfData}
        currentPage={currentPage}
        zoom={zoom}
        activeTool={activeTool}
        overlays={overlays}
        signatureDataURL={signatureDataURL}
        onTotalPages={setTotalPages}
        onAddOverlay={handleAddOverlay}
        onUpdateOverlay={handleUpdateOverlay}
        onDeleteOverlay={handleDeleteOverlay}
      />
      {showSignatureModal && (
        <SignatureModal
          onDone={handleSignatureDone}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </div>
  )
}
