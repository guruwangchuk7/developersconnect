import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    // 2. Parse payload
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // 3. Fetch URL content
    console.log(`[FetchUrlInfo] Fetching webpage: ${url}`);
    let htmlContent = '';
    try {
      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        next: { revalidate: 60 }
      });
      
      if (!pageRes.ok) {
        throw new Error(`Status ${pageRes.status}`);
      }
      htmlContent = await pageRes.text();
    } catch (fetchErr: any) {
      console.error('[FetchUrlInfo] Failed to fetch URL:', fetchErr);
      return NextResponse.json({ error: `Could not fetch website contents: ${fetchErr.message}` }, { status: 400 });
    }

    // 4. Clean HTML to avoid bloating Gemini context window
    const cleanedHtml = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove CSS styles
      .replace(/<[^>]+>/g, ' ')                                         // Strip HTML tags
      .replace(/\s+/g, ' ')                                             // Clean whitespace
      .slice(0, 10000);                                                 // Keep first 10,000 characters

    // 5. Query Gemini with the cleaned text to extract JSON structure
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      return NextResponse.json({
        title: "Mock Scraped Event",
        venue: "Scraped Venue",
        startsOn: new Date().toISOString().split('T')[0],
        endsOn: new Date().toISOString().split('T')[0],
        registrationDeadline: new Date().toISOString().split('T')[0],
        description: `This is a mock event description extracted from the URL: ${url}. (To enable actual parsing, configure a valid Gemini API Key in your environment).`
      });
    }

    console.log(`[FetchUrlInfo] Sending contents to Gemini...`);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an event scraper assistant. Parse the text from this website and extract event details.
                  Return ONLY a JSON object matching this structure:
                  {
                    "title": "Event Name",
                    "venue": "Venue Name or 'Online'",
                    "startsOn": "YYYY-MM-DD (or empty string)",
                    "endsOn": "YYYY-MM-DD (or empty string)",
                    "registrationDeadline": "YYYY-MM-DD (or empty string)",
                    "description": "A clear, descriptive summary of the event (agenda, details, registration details)."
                  }
                  
                  Do NOT wrap in markdown formatting, code block quotes, or any other explanations. Return only the raw JSON.
                  
                  Webpage text:
                  ${cleanedHtml}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini scraping error: ${response.statusText}`);
    }

    const resBody = await response.json();
    let textResponse = resBody.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    // Clean JSON block formatting if present
    if (textResponse.includes('```')) {
      textResponse = textResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
    }

    // Parse extracted JSON
    let extractedDetails;
    try {
      extractedDetails = JSON.parse(textResponse.trim());
    } catch (parseErr) {
      console.error('[FetchUrlInfo] Failed to parse JSON response:', textResponse);
      throw new Error('AI response was not in a valid JSON format');
    }

    return NextResponse.json(extractedDetails);

  } catch (err: any) {
    console.error('[FetchUrlInfo] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
