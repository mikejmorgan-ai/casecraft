'use client'

import { useState, useCallback } from 'react'

const BATES_PATTERN = /^SLCo\d{6}$/

export default function DiscoverySearchPage() {
  const [query, setQuery] = useState('')
  const [content, setContent] = useState<string | null>(null)
  const [currentBates, setCurrentBates] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searchMode, setSearchMode] = useState<'bates' | 'text'>('bates')

  const fetchDocument = useCallback(async (batesNo: string) => {
    setLoading(true)
    setError(null)
    setContent(null)
    setCurrentBates(batesNo)
    try {
      const res = await fetch(`/api/discovery/bates/${batesNo}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || `Document ${batesNo} not found`)
        return
      }
      const text = await res.text()
      setContent(text)
    } catch {
      setError('Failed to fetch document')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) return

    // Direct Bates lookup
    if (BATES_PATTERN.test(trimmed)) {
      setSearchResults([])
      setSearchMode('bates')
      await fetchDocument(trimmed)
      return
    }

    // Text search across documents via API
    setSearchMode('text')
    setContent(null)
    setCurrentBates(null)
    setLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const res = await fetch(`/api/discovery/search?q=${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Search failed')
        return
      }
      const data = await res.json()
      setSearchResults(data.results || [])
      if (data.results.length === 0) {
        setError(`No documents found matching "${trimmed}"`)
      }
    } catch {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  // Four-phrase quick search buttons
  const FOUR_PHRASES = [
    'Vested mining use',
    'Vested mining rights',
    'Mine operator',
    'Mining protection area',
  ]

  const KEY_BATES = [
    { bates: 'SLCo002501', label: 'H.B. 288 Statute' },
    { bates: 'SLCo003551', label: 'Supplemental Declaration' },
    { bates: 'SLCo003624', label: 'County Calendar Event' },
    { bates: 'SLCo006843', label: "Division's Response" },
    { bates: 'SLCo006947', label: 'Tree Farm Reply Brief' },
    { bates: 'SLCo007246', label: 'Public Comment Letter' },
    { bates: 'SLCo003377', label: 'Division Surreply' },
    { bates: 'SLCo004662', label: 'County Council Agenda' },
  ]

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ borderBottom: '2px solid #2c3e50', paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#1a1a1a' }}>
          Discovery Document Search
        </h1>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
          Tree Farm LLC v. Salt Lake County — 5,576 documents (SLCo002489–SLCo018710)
        </p>
      </header>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Bates number (SLCo002501) or search text..."
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 15,
            border: '1px solid #ccc',
            borderRadius: 6,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: 15,
            backgroundColor: '#2c3e50',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Four-phrase quick search */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: '#888', marginRight: 8 }}>Quick search:</span>
        {FOUR_PHRASES.map((phrase) => (
          <button
            key={phrase}
            onClick={() => { setQuery(phrase); }}
            style={{
              padding: '4px 10px',
              margin: '0 4px 4px 0',
              fontSize: 12,
              backgroundColor: '#e8f4fd',
              color: '#2563eb',
              border: '1px solid #bdd8f0',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Key Bates shortcuts */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 12, color: '#888', marginRight: 8 }}>Key documents:</span>
        {KEY_BATES.map(({ bates, label }) => (
          <button
            key={bates}
            onClick={() => fetchDocument(bates)}
            style={{
              padding: '4px 10px',
              margin: '0 4px 4px 0',
              fontSize: 12,
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {bates} — {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Search results list */}
      {searchMode === 'text' && searchResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
            {searchResults.length} document{searchResults.length !== 1 ? 's' : ''} found
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {searchResults.map((bates) => (
              <button
                key={bates}
                onClick={() => fetchDocument(bates)}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  backgroundColor: currentBates === bates ? '#2c3e50' : '#f3f4f6',
                  color: currentBates === bates ? 'white' : '#2563eb',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {bates}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document viewer */}
      {content && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#2c3e50',
            color: 'white',
            borderRadius: '6px 6px 0 0',
            fontSize: 14,
          }}>
            <span style={{ fontWeight: 600 }}>
              Tree Farm {currentBates}.txt
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              {content.split('\n').length} lines
            </span>
          </div>
          <pre style={{
            margin: 0,
            padding: 16,
            backgroundColor: '#fafafa',
            border: '1px solid #e5e7eb',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            fontSize: 13,
            lineHeight: 1.5,
            overflow: 'auto',
            maxHeight: '70vh',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}>
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}
