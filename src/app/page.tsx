'use client'

import { useEffect, useState, useCallback } from 'react'

interface FileItem {
  url: string
  pathname: string
  uploadedAt: string
  size: number
  type: string
}

function getFileType(pathname: string): 'image' | 'text' | 'code' | 'file' {
  const ext = pathname.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['txt', 'md', 'log'].includes(ext)) return 'text'
  if (['js', 'ts', 'py', 'json', 'html', 'css', 'sh'].includes(ext)) return 'code'
  return 'file'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatTime(date: string): string {
  return new Date(date).toLocaleString()
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [textContents, setTextContents] = useState<Record<string, string>>({})

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files')
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Failed to fetch files:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTextContent = useCallback(async (url: string) => {
    if (textContents[url]) return
    try {
      const res = await fetch(url)
      const text = await res.text()
      setTextContents(prev => ({ ...prev, [url]: text }))
    } catch (err) {
      console.error('Failed to fetch text:', err)
    }
  }, [textContents])

  const deleteFile = async (url: string) => {
    if (!confirm('Delete this file?')) return
    try {
      await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      fetchFiles()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchFiles, 3000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchFiles])

  useEffect(() => {
    files.forEach(file => {
      const type = getFileType(file.pathname)
      if (type === 'text' || type === 'code') {
        fetchTextContent(file.url)
      }
    })
  }, [files, fetchTextContent])

  const images = files.filter(f => getFileType(f.pathname) === 'image')
  const texts = files.filter(f => getFileType(f.pathname) === 'text')
  const codes = files.filter(f => getFileType(f.pathname) === 'code')
  const others = files.filter(f => getFileType(f.pathname) === 'file')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">📱 Phone Dashboard</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400">Auto-refresh</span>
          </label>
          <button
            onClick={fetchFiles}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </header>

      {files.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-xl">No files yet</p>
          <p className="mt-2">Send something from your phone!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {images.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-blue-400">🖼️ Images ({images.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((file) => (
                  <div key={file.url} className="bg-gray-900 rounded-lg overflow-hidden group relative">
                    <img
                      src={file.url}
                      alt={file.pathname}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm truncate">{file.pathname.split('/').pop()}</p>
                      <p className="text-xs text-gray-500">{formatTime(file.uploadedAt)} · {formatSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => deleteFile(file.url)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {texts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-green-400">📝 Text ({texts.length})</h2>
              <div className="space-y-4">
                {texts.map((file) => (
                  <div key={file.url} className="bg-gray-900 rounded-lg p-4 group relative">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{file.pathname.split('/').pop()}</p>
                      <p className="text-xs text-gray-500">{formatTime(file.uploadedAt)}</p>
                    </div>
                    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap max-h-64">
                      {textContents[file.url] || 'Loading...'}
                    </pre>
                    <button
                      onClick={() => deleteFile(file.url)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {codes.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-purple-400">💻 Code ({codes.length})</h2>
              <div className="space-y-4">
                {codes.map((file) => (
                  <div key={file.url} className="bg-gray-900 rounded-lg p-4 group relative">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{file.pathname.split('/').pop()}</p>
                      <p className="text-xs text-gray-500">{formatTime(file.uploadedAt)}</p>
                    </div>
                    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto max-h-64">
                      <code>{textContents[file.url] || 'Loading...'}</code>
                    </pre>
                    <button
                      onClick={() => deleteFile(file.url)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-orange-400">📁 Files ({others.length})</h2>
              <div className="space-y-2">
                {others.map((file) => (
                  <div key={file.url} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between group">
                    <div>
                      <p className="font-medium">{file.pathname.split('/').pop()}</p>
                      <p className="text-xs text-gray-500">{formatTime(file.uploadedAt)} · {formatSize(file.size)}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={file.url}
                        download
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition text-sm"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => deleteFile(file.url)}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
