import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { ownerEmail, applicantName, role, project, motivation, cvUrl } = await req.json();

    // 1. Basic Validation
    if (!ownerEmail || !applicantName || !role || !project || !motivation) {
       return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service misconfigured' }, { status: 500 });
    }

    // 2. Security: Verify that the recipient is actually a registered project owner
    // This prevents the endpoint from being used as a general purpose spam relay.
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', ownerEmail)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Unauthorized recipient: Target email must belong to a registered developer.' },
        { status: 403 }
      );
    }

    // 3. Simple HTML escaping for safety
    const escape = (str: string) => str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m] || m));

    const safeApplicantName = escape(applicantName);
    const safeProject = escape(project);
    const safeMotivation = escape(motivation);
    const safeRole = escape(role);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'DevelopersConnect <onboarding@resend.dev>',
        to: [ownerEmail],
        subject: `[Team App] ${safeRole} for ${safeProject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #000;">New Team Application synchronized!</h2>
            <p><strong>${safeApplicantName}</strong> has applied to join your team for the project <strong>${safeProject}</strong>.</p>
            
            <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Motivation:</h3>
              <p style="white-space: pre-wrap;">${safeMotivation}</p>
            </div>

            <p>You can review their credentials and CV here:</p>
            <a href="${cvUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Resume / CV</a>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #666;">This is an automated synchronization from the DevelopersConnect network.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, id: data.id });
    } else {
      return NextResponse.json({ error: data.message }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
