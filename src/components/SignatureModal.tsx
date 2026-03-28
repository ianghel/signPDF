import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface Props {
  onDone: (dataURL: string) => void
  onClose: () => void
}

export default function SignatureModal({ onDone, onClose }: Props) {
  const sigRef = useRef<SignatureCanvas>(null)

  const handleDone = () => {
    if (!sigRef.current) return
    try {
      const canvas = sigRef.current.getCanvas()
      const dataURL = canvas.toDataURL('image/png')
      // Check it's not a blank canvas
      if (dataURL.length > 1000) {
        onDone(dataURL)
      }
    } catch (err) {
      console.error('Signature export error:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[550px]">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Draw your signature
        </h2>
        <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white mb-4">
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            minWidth={1.5}
            maxWidth={3}
            canvasProps={{
              width: 502,
              height: 200,
              style: { display: 'block' },
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => sigRef.current?.clear()}
            className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="px-6 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
