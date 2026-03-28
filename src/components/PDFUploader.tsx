import { useState, useCallback, useRef } from 'react'

interface Props {
  onFileLoad: (data: ArrayBuffer, name: string) => void
}

export default function PDFUploader({ onFileLoad }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onFileLoad(reader.result, file.name)
        }
      }
      reader.readAsArrayBuffer(file)
    },
    [onFileLoad]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleElectronOpen = useCallback(async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile()
      if (result) {
        onFileLoad(result.data, result.name)
      }
    }
  }, [onFileLoad])

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div
        className={`flex flex-col items-center justify-center w-[500px] h-[350px] border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
          dragging
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (window.electronAPI) {
            handleElectronOpen()
          } else {
            inputRef.current?.click()
          }
        }}
      >
        <svg
          className="w-16 h-16 text-blue-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium text-slate-700 mb-1">
          Drop your PDF here
        </p>
        <p className="text-sm text-slate-400">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
    </div>
  )
}
