import { useRef, useState } from 'react'
import { useDocuments } from '../../context/DocumentsContext'
import { api } from '../../lib/api'
import PageHeader from '../../components/dashboard/PageHeader'
import { Upload, FileText, Trash, Check } from '../../components/icons'

export default function Documents() {
  const { docs, addDoc, removeDoc, activeId, setActiveId } = useDocuments()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  async function handleFile(file: File) {
    setError('')
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    setUploading(true)
    try {
      const { name, text, chars } = await api.uploadPdf(file)
      if (!text.trim()) {
        setError('We couldn\'t extract any text from that PDF (it may be a scanned image).')
      } else {
        addDoc({ name, text, chars })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Is the API server running?')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Documents" subtitle="Upload lecture PDFs to power your AI study tools." />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) handleFile(f)
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragOver ? 'border-brand bg-brand-50 dark:bg-navy-800' : 'border-slate-300 bg-white dark:border-navy-700 dark:bg-navy-900'
        }`}
      >
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand dark:bg-navy-800 dark:text-brand-400">
          <Upload width={24} height={24} />
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {uploading ? 'Extracting text…' : 'Drag & drop a PDF here'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">or</p>
        <button className="btn-primary mt-3" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Choose PDF'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-slate-700 dark:text-slate-300">Your library ({docs.length})</h2>
      {docs.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No documents yet. Upload your first PDF to get started.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div
              key={d.id}
              className={`flex items-center gap-3 rounded-xl border bg-white p-3.5 dark:bg-navy-900 ${
                activeId === d.id ? 'border-brand ring-1 ring-brand' : 'border-slate-200 dark:border-navy-800'
              }`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 dark:bg-navy-800 dark:text-slate-400">
                <FileText width={20} height={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{d.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {(d.chars / 1000).toFixed(1)}k characters · {new Date(d.addedAt).toLocaleDateString()}
                </div>
              </div>
              {activeId === d.id ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  <Check width={14} height={14} /> Active
                </span>
              ) : (
                <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => setActiveId(d.id)}>
                  Set active
                </button>
              )}
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                onClick={() => removeDoc(d.id)}
                aria-label="Delete document"
              >
                <Trash width={18} height={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
