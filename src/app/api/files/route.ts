import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { blobs } = await list()
    
    const files = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        uploadedAt: blob.uploadedAt,
        size: blob.size,
      }))

    return NextResponse.json({ files })
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
