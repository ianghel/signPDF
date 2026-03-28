/// <reference types="vite/client" />

interface ElectronAPI {
  openFile: () => Promise<{ data: ArrayBuffer; name: string } | null>
  saveFile: (pdfBytes: ArrayBuffer) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

declare module 'react-signature-canvas' {
  import { Component } from 'react'
  interface SignatureCanvasProps {
    penColor?: string
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>
    minWidth?: number
    maxWidth?: number
    velocityFilterWeight?: number
    onBegin?: () => void
    onEnd?: () => void
    clearOnResize?: boolean
  }
  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void
    isEmpty(): boolean
    toDataURL(type?: string, encoderOptions?: number): string
    fromDataURL(dataURL: string, options?: object): void
    getTrimmedCanvas(): HTMLCanvasElement
    getCanvas(): HTMLCanvasElement
  }
}
