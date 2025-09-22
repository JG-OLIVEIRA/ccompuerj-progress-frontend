
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

const DISCIPLINE_SCRAPE_TAG = 'discipline_scrape_time';
const WHATSAPP_SCRAPE_TAG = 'whatsapp_scrape_time';

const getDisciplineScrapeTime = cache(
    async () => new Date().toLocaleString('pt-BR'),
    [DISCIPLINE_SCRAPE_TAG],
    { tags: [DISCIPLINE_SCRAPE_TAG], revalidate: false } // Revalidate only on demand
);

const getWhatsappScrapeTime = cache(
    async () => new Date().toLocaleString('pt-BR'),
    [WHATSAPP_SCRAPE_TAG],
    { tags: [WHATSAPP_SCRAPE_TAG], revalidate: false } // Revalidate only on demand
);


export async function GET() {
    // We get the initial values, which might be old or the default.
    // The cache mechanism handles returning the stored value until it's revalidated.
    const lastDisciplineScrape = await getDisciplineScrapeTime();
    const lastWhatsappScrape = await getWhatsappScrapeTime();

    return NextResponse.json({
        lastDisciplineScrape,
        lastWhatsappScrape,
    });
}

export async function POST(request: Request) {
    const body = await request.json();
    const { type } = body;

    if (type === 'disciplines') {
        revalidateTag(DISCIPLINE_SCRAPE_TAG);
    } else if (type === 'whatsapp') {
        revalidateTag(WHATSAPP_SCRAPE_TAG);
    } else {
        return NextResponse.json({ error: 'Invalid type provided' }, { status: 400 });
    }

    return NextResponse.json({ message: `Cache for ${type} revalidated.` });
}
