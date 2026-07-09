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
    const currentUserId = session.user.id;

    // 2. Parse request payload
    const { role, skills, description, availability } = await req.json();
    if (!role || !skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Missing required search criteria (role and skills)' }, { status: 400 });
    }

    // 3. Fetch candidates from database (excluding the current user)
    let query = supabase.from('profiles').select('*').neq('id', currentUserId);
    if (availability && availability !== 'All') {
      query = query.eq('availability', availability);
    }

    const { data: candidates, error: dbError } = await query;
    if (dbError) {
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // 4. Try LLM matching using Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const isMockKey = !GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY';
    if (!isMockKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert technical recruiter matching developers to a project opportunity.
                      
                      Project requirements:
                      - Role Needed: ${role}
                      - Key Skills: ${skills.join(', ')}
                      - Description: ${description || 'Not specified'}
                      
                      Available Candidates:
                      ${JSON.stringify(candidates.map((c)=>({
                        id: c.id,
                        full_name: c.full_name,
                        role: c.role,
                        bio: c.bio,
                        skills: c.skills,
                        availability: c.availability
                      })))}
                      
                      Respond ONLY with a JSON array containing match objects. Each object MUST look like:
                      {
                        "id": "candidate-uuid",
                        "compatibilityScore": number (0 to 100),
                        "explanation": "short 1-2 sentence reason detailing why this candidate is a good match based on their skills and background"
                      }
                      
                      Order the list from highest compatibility score to lowest.`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          const resBody = await response.json();
          const textResponse = resBody.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const matches = JSON.parse(textResponse);
            if (Array.isArray(matches)) {
              // Map back candidates metadata
              const decoratedMatches = matches.map((m)=>{
                const candidateInfo = candidates.find((c)=>c.id === m.id);
                if (!candidateInfo) return null;
                return {
                  ...candidateInfo,
                  compatibilityScore: m.compatibilityScore,
                  explanation: m.explanation
                };
              }).filter(Boolean);
              
              return NextResponse.json({
                matches: decoratedMatches,
                isAI: true
              });
            }
          }
        }
      } catch (llmError) {
        console.error('LLM Matching failed, falling back to rule-based matchmaking:', llmError);
      }
    }

    // 5. Fallback rule-based matching
    const fallbackMatches = candidates.map((c)=>{
      let score = 20; // baseline
      // Check role match (case-insensitive word overlaps)
      if (c.role && role) {
        const candidateWords = c.role.toLowerCase().split(/\s+/);
        const searchWords = role.toLowerCase().split(/\s+/);
        const overlap = searchWords.filter((w: string)=>candidateWords.includes(w) && w.length > 2);
        score += overlap.length * 20;
      }
      // Check skills match
      if (c.skills && Array.isArray(c.skills)) {
        const querySkills = skills.map((s: string)=>s.toLowerCase());
        const candidateSkills = c.skills.map((s: string)=>s.toLowerCase());
        const matchingSkills = querySkills.filter((s: string)=>candidateSkills.includes(s));
        score += matchingSkills.length * 15;
      }
      // Cap score at 95% for fallback logic
      score = Math.min(score, 95);
      
      // Generate a structured explanation
      const matchingSkillsText = c.skills ? c.skills.filter((s: string)=>skills.map((sk: string)=>sk.toLowerCase()).includes(s.toLowerCase())).join(', ') : '';
      const explanation = matchingSkillsText ? `Matched due to overlap in skills: ${matchingSkillsText}.` : `Candidate has a profile related to ${c.role || 'software engineering'}.`;
      return {
        ...c,
        compatibilityScore: score,
        explanation: `${explanation} (Matched via system criteria filter)`
      };
    });

    // Sort by compatibility score descending
    fallbackMatches.sort((a, b)=>b.compatibilityScore - a.compatibilityScore);
    return NextResponse.json({
      matches: fallbackMatches,
      isAI: false
    });

  } catch (err) {
    console.error('Route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}