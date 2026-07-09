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
    const { resumeText, profileData } = await req.json();
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Missing resume text' }, { status: 400 });
    }

    // 3. Validation: Verify if the text contains standard resume components
    const isPDF = resumeText.startsWith('[PDF_FILE_BASE64]:');
    let base64Content = '';
    console.log(`[ResumeStudio] Received request. isPDF: ${isPDF}, length: ${resumeText.length}`);
    
    if (!isPDF) {
      const resumeKeywords = [
        'education',
        'experience',
        'work',
        'project',
        'skill',
        'university',
        'school',
        'employment',
        'cv',
        'resume',
        'contact',
        'profile',
        'accomplishments'
      ];
      const lowercaseText = resumeText.toLowerCase();
      const matchedKeywords = resumeKeywords.filter((k)=>lowercaseText.includes(k));
      console.log(`[ResumeStudio] Non-PDF keywords matched:`, matchedKeywords);
      if (matchedKeywords.length < 2) {
        console.warn(`[ResumeStudio] Validation failed. Matched keywords: ${matchedKeywords.length}`);
        return NextResponse.json({
          error: 'The uploaded text or file does not appear to be a valid resume. Please paste or upload a resume/CV containing standard sections like Education, Experience, or Skills.'
        }, { status: 400 });
      }
    } else {
      const parts = resumeText.split(':');
      base64Content = parts.slice(2).join(':');
      console.log(`[ResumeStudio] Extracted PDF base64. length: ${base64Content.length}`);
    }

    // 4. Contact Gemini
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const isMockKey = !GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY';
    console.log(`[ResumeStudio] Using mock: ${isMockKey}`);
    
    if (isMockKey) {
      // Mock Response for testing if key is not configured
      return NextResponse.json({
        isAI: false,
        overallScore: 78,
        atsScore: 70,
        googleReadiness: 65,
        harvardFormat: 80,
        recruiterImpression: "Solid foundation but lacks quantifiable impact. Wording feels passive in multiple sections.",
        strengths: [
          "Good list of technical skills (Next.js, TypeScript)",
          "Clear reverse chronological structure"
        ],
        weaknesses: [
          "Fails to quantify achievements with metrics",
          "Includes weak action verbs like 'Responsible for' and 'Helped'"
        ],
        missingSections: ["Leadership & Activities"],
        missingSkills: ["Cloud deployments (Vercel/AWS)", "Unit testing (Jest)"],
        rewrittenResume: `**${profileData?.full_name || 'DEVELOPER NAME'}**\n[Add Email] | [Add Phone] | [Add Portfolio URL]\n\n**EDUCATION**\n[Add Degree, University] | [Add Dates]\n\n**EXPERIENCE**\n*   **Software Engineer** | DevelopersConnect | [Add Dates]\n    *   Redesigned frontend data loading flows for dashboard profiles, reducing load times by [Add measurable result].\n    *   Implemented direct messaging module supporting live WebSocket synchronizations with other builders.\n\n**PROJECTS**\n*   **AI Developer Matchmaker** | Next.js, Gemini API, PostgreSQL\n    *   Architected semantic matching API route using Gemini model to evaluate profiles and compute compatibility scores.\n    *   Designed high-fidelity dashboard views with compatibility meters and score visualizations.`,
        careerAnalysis: {
          paths: ["Frontend Engineer", "Full Stack Developer", "Technical Founder"],
          gaps: ["Testing frameworks", "CI/CD pipelines"],
          projects: ["Build a full-stack open source collaborative whiteboard with real-time sync."]
        }
      });
    }

    // Prepare Gemini Request Body
    const partsArray = [];
    if (isPDF) {
      partsArray.push({
        inlineData: {
          mimeType: "application/pdf",
          data: base64Content
        }
      });
      partsArray.push({
        text: `You are BhutanDevelopersConnect AI Resume Studio, an expert AI Resume Coach and FAANG Technical Recruiter.
        
        Analyze the attached PDF resume.
        
        Follow these rules for valid resumes:
        1. Harvard Resume layout (Name, Contact, Education, Experience, Leadership, Projects, Skills, Interests). No tables, graphics, progress bars, or icons.
        2. Google Resume rules (Strong action verbs, X-Y-Z formula: Accomplished X, measured by Y, by doing Z. Quantify achievements. Insert '[Add measurable result]' where metrics are missing).
        3. Never fabricate or invent user experience.
        
        User Profile Data from BhutanDevelopersConnect:
        ${JSON.stringify(profileData || {})}
        
        Respond ONLY with a JSON object. The object MUST strictly match this schema:
        {
          "error": "string explaining that input is not a valid resume (ONLY IF the PDF is not a resume, otherwise omit this field)",
          "overallScore": number (0-100),
          "atsScore": number (0-100),
          "googleReadiness": number (0-100),
          "harvardFormat": number (0-100),
          "recruiterImpression": "string summarizing impression",
          "strengths": ["string strengths"],
          "weaknesses": ["string weaknesses"],
          "missingSections": ["string missing sections"],
          "missingSkills": ["string missing skills"],
          "rewrittenResume": "string in markdown format containing the rewritten, polished resume optimized for Harvard/Google rules",
          "careerAnalysis": {
            "paths": ["suggested paths"],
            "gaps": ["skill gaps"],
            "projects": ["suggested projects to add"]
          }
        }`
      });
    } else {
      partsArray.push({
        text: `You are BhutanDevelopersConnect AI Resume Studio, an expert AI Resume Coach and FAANG Technical Recruiter.
        
        First, verify if the provided text is actually a resume, CV, or professional profile. If the text is clearly an invoice, receipt, article, or other unrelated document, you MUST set the "error" property below explaining the issue.
        
        Follow these rules for valid resumes:
        1. Harvard Resume layout (Name, Contact, Education, Experience, Leadership, Projects, Skills, Interests). No tables, graphics, progress bars, or icons.
        2. Google Resume rules (Strong action verbs, X-Y-Z formula: Accomplished X, measured by Y, by doing Z. Quantify achievements. Insert '[Add measurable result]' where metrics are missing).
        3. Never fabricate or invent user experience.
        
        User Profile Data from BhutanDevelopersConnect:
        ${JSON.stringify(profileData || {})}
        
        User's Current Resume Text:
        ${resumeText}
        
        Respond ONLY with a JSON object. The object MUST strictly match this schema:
        {
          "error": "string explaining that input is not a valid resume (ONLY IF text is not a resume, otherwise omit this field)",
          "overallScore": number (0-100),
          "atsScore": number (0-100),
          "googleReadiness": number (0-100),
          "harvardFormat": number (0-100),
          "recruiterImpression": "string summarizing impression",
          "strengths": ["string strengths"],
          "weaknesses": ["string weaknesses"],
          "missingSections": ["string missing sections"],
          "missingSkills": ["string missing skills"],
          "rewrittenResume": "string in markdown format containing the rewritten, polished resume optimized for Harvard/Google rules",
          "careerAnalysis": {
            "paths": ["suggested paths"],
            "gaps": ["skill gaps"],
            "projects": ["suggested projects to add"]
          }
        }`
      });
    }

    console.log(`[ResumeStudio] Calling Gemini API...`);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: partsArray
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    console.log(`[ResumeStudio] Gemini response status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ResumeStudio] Gemini API error payload:`, errorText);
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const resBody = await response.json();
    const textResponse = resBody.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`[ResumeStudio] Gemini returned text. length: ${textResponse?.length}`);
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    const parsedData = JSON.parse(textResponse);
    console.log(`[ResumeStudio] Parsed keys:`, Object.keys(parsedData));
    if (parsedData.error) {
      console.warn(`[ResumeStudio] Gemini flagged input error:`, parsedData.error);
      return NextResponse.json({ error: parsedData.error }, { status: 400 });
    }

    return NextResponse.json({
      ...parsedData,
      isAI: true
    });

  } catch (err) {
    console.error('Resume Studio error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}