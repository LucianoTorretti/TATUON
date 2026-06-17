import { useRef, useState } from 'react'
import { UploadCloud, FileText, ImageIcon, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/cn'

// Carga de archivos (PDF sanitario RF-01 / imágenes de portafolio RF-03)
export const FileUpload = ({
  accept = 'application/pdf',
  label = 'Arrastra o selecciona un archivo',
  hint,
  onFile,
  type = 'pdf',
  className,
}) => {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState(null)

  const handle = (f) => {
    if (!f) return
    setError(null)
    // Validación de formato (CU-01 6.a / CU-03 6.a)
    const okType = accept.split(',').some((a) => f.type === a.trim() || (a.includes('image') && f.type.startsWith('image')))
    if (!okType) {
      setError(`Formato no válido. Se requiere ${type === 'pdf' ? 'un PDF' : 'una imagen'}.`)
      return
    }
    if (f.size > 4 * 1024 * 1024) {
      setError('El archivo supera el máximo de 4 MB.')
      return
    }
    setFile(f)
    onFile?.(f)
  }

  const Icon = type === 'pdf' ? FileText : ImageIcon

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          handle(e.dataTransfer.files[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition',
          drag ? 'border-forest-500 bg-forest-50' : 'border-sand-300 bg-sand-50/60 hover:border-forest-300 hover:bg-forest-50/40',
          file && 'border-forest-400 bg-forest-50',
        )}
      >
        {file ? (
          <div className="flex w-full items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-100 text-forest-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink-muted">{(file.size / 1024).toFixed(0)} KB · listo</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-forest-500" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                onFile?.(null)
              }}
              className="rounded-lg p-1 text-ink-muted hover:bg-sand-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-500">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-ink">{label}</p>
            {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handle(e.target.files[0])}
        />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-clay-500">{error}</p>}
    </div>
  )
}
