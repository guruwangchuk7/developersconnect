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

    // 2. Parse request payload
    const { inputText, contentType, writingMode } = await req.json();
    if (!inputText || typeof inputText !== 'string') {
      return NextResponse.json({ error: 'Missing input text' }, { status: 400 });
    }

    const mode = writingMode || 'Improve Writing';
    const type = contentType || 'Post Update';

    // 3. Check Gemini API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const isMockKey = !GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY';

    console.log(`[WritingAssistant] Received request. isMockKey: ${isMockKey}`);

    if (isMockKey) {
      // Mock Response for testing
      let outputText = '';
      if (mode === 'Professional') {
        outputText = `We are excited to share a project update with the community. ${inputText}`;
      } else if (mode === 'Engaging') {
        outputText = `🚀 Hey builders! ${inputText} What do you think about this? Let us know in the comments below!`;
      } else if (mode === 'Shorten') {
        outputText = `${inputText.slice(0, 100)}...`;
      } else {
        outputText = `[Optimized for ${type} using ${mode}]: ${inputText}`;
      }
      return NextResponse.json({ outputText, isAI: false });
    }

    console.log(`[WritingAssistant] Calling Gemini API...`);
    // Call real Gemini model
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
                  text: `You are the AI Writing Assistant for BhutanDevelopersConnect.
                  Your job is to rewrite the input content.
                  
                  RULES:
                  - Preserve technologies, links, dates, programming syntax, code, names, companies, and technical details.
                  - Never exaggerate or invent achievements/metrics.
                  - Return ONLY the rewritten content.
                  - Do NOT explain what you changed, do NOT add headings, do NOT wrap the response in quotes.
                  
                  Context:
                  - Content Type: ${type}
                  - Writing Mode: ${mode}
                  
                  Input:
                  ${inputText}`
                }
              ]
            }
          ]
        })
      }
    );

    console.log(`[WritingAssistant] Gemini response status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[WritingAssistant] Gemini API error payload:`, errorText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const resBody = await response.json();
    let textResponse = resBody.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    // Clean any accidental markdown code wraps if Gemini added them (e.g. ```text or similar)
    if (textResponse.startsWith('```')) {
      textResponse = textResponse.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
    }

    return NextResponse.json({ outputText: textResponse.trim(), isAI: true });

  } catch (err: any) {
    console.error('Writing Assistant error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
