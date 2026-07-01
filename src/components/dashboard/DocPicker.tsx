import { Link } from 'react-router-dom'
import { useDocuments } from '../../context/DocumentsContext'
import { FileText } from '../icons'

/**
 * Dropdown to pick the "active" document that AI features operate on.
 * Renders a prompt to upload when the library is empty.
 */
export default function DocPicker() {
  const { docs, activeId, setActiveId } = useDocuments()

  if (docs.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-navy-700 dark:bg-navy-850 dark:text-slate-300">
        <FileText width={16} height={16} />
        No documents yet.
        <Link to="/dashboard/documents" className="font-semibold text-brand hover:text-brand-600">Upload one →</Link>
      </div>
    )
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-600">Document:</span>
      <select
        className="input max-w-xs py-2"
        value={activeId ?? ''}
        onChange={(e) => setActiveId(e.target.value)}
      >
        {docs.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </label>
  )
}
