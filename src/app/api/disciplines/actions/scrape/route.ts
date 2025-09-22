
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

// This is a helper function to call our own API to update the cache
// It's defined here to avoid circular dependencies and keep logic co-located.
async function updateScrapeCache(request: Request, type: 'disciplines' | 'whatsapp') {
    const internalApiUrl = new URL('/api/scrape-cache', request.url);
    try {
        await fetch(internalApiUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
        });
    } catch (e) {
        // Log the error but don't block the main response
        console.error("Failed to update scrape cache:", e);
    }
}


export async function POST(request: Request) {
  try {
    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/disciplines/actions/scrape`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiResponse.status !== 202) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: `External API call failed: ${errorText}` }, { status: apiResponse.status });
    }
    
    // On success, trigger our internal API to update the cached timestamp.
    // We don't await this so the user gets a fast response.
    updateScrapeCache(request, 'disciplines');

    // The external API returns 202 Accepted with no body, so we forward that.
    return new NextResponse(null, { status: 202 });

  } catch (error) {
    console.error('Proxy scraping error:', error);
    return NextResponse.json({ error: 'Internal Server Error while proxying scrape action' }, { status: 500 });
  }
}
