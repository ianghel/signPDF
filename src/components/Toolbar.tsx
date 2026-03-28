import { Tool } from '../App'

interface Props {
  activeTool: Tool
  setActiveTool: (tool: Tool) => void
  currentPage: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onOpenSignature: () => void
  onSave: () => void
  onExport: () => void
  onNewFile: () => void
  hasSignature: boolean
  pdfName: string
}

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-500 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

export default function Toolbar({
  activeTool,
  setActiveTool,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  zoom,
  onZoomIn,
  onZoomOut,
  onOpenSignature,
  onSave,
  onExport,
  onNewFile,
  hasSignature,
  pdfName,
}: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 shadow-sm select-none"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={onNewFile}
          className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
          title="Open new file"
        >
          New
        </button>
        <span className="text-sm text-slate-400 max-w-[150px] truncate">{pdfName}</span>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <ToolButton
          active={activeTool === 'select'}
          onClick={() => setActiveTool('select')}
          title="Select & move"
        >
          Select
        </ToolButton>
        <ToolButton
          active={activeTool === 'signature'}
          onClick={() => {
            if (!hasSignature) {
              onOpenSignature()
            } else {
              setActiveTool('signature')
            }
          }}
          title="Place signature"
        >
          Signature
        </ToolButton>
        <ToolButton
          active={activeTool === 'text'}
          onClick={() => setActiveTool('text')}
          title="Add text"
        >
          Text
        </ToolButton>
        <button
          onClick={onOpenSignature}
          className="px-3 py-1.5 text-sm text-blue-500 hover:bg-blue-50 rounded-lg"
          title="Draw new signature"
        >
          {hasSignature ? 'Redraw' : 'Draw'} Signature
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button onClick={onZoomOut} className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded">
          -
        </button>
        <span className="text-sm text-slate-600 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={onZoomIn} className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded">
          +
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button onClick={onPrevPage} disabled={currentPage <= 1} className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30">
          &lt;
        </button>
        <span className="text-sm text-slate-600 min-w-[60px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button onClick={onNextPage} disabled={currentPage >= totalPages} className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30">
          &gt;
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          onClick={onSave}
          className="px-4 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
          title="Save signed PDF"
        >
          💾 Save
        </button>
        <button
          onClick={onExport}
          className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          title="Download signed PDF"
        >
          ⬇ Export
        </button>
      </div>
    </div>
  )
}
