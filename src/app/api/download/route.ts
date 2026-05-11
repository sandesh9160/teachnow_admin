import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('name') || 'document';

    if (!url) {
      return new Response('Missing URL parameter', { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file from source');

    const blob = await response.blob();
    const headers = new Headers();
    const mode = searchParams.get('mode') || 'attachment';
    
    // Force download or inline preview
    headers.set('Content-Disposition', `${mode}; filename="${filename}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return new Response('Failed to download file', { status: 500 });
  }
}
