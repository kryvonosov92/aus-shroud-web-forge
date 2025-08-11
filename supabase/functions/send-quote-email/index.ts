import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttachmentIn {
  filename: string;
  contentType?: string;
  base64: string; // Base64 (no data: prefix)
}

interface EmailPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  projectAddress?: string;
  message: string;
  howHeardAboutUs: string;
  attachmentUrls?: string[]; // Stored paths in Supabase (for reference)
  attachments?: AttachmentIn[]; // Raw files to attach to email
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret in Supabase");
    }

    const resend = new Resend(RESEND_API_KEY);
    const payload: EmailPayload = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      projectAddress,
      message,
      howHeardAboutUs,
      attachmentUrls = [],
      attachments = [],
    } = payload;

    const attachmentsForResend = attachments.map((a) => ({
      filename: a.filename,
      content: base64ToUint8Array(a.base64),
    }));

    const html = `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ""}
      ${projectAddress ? `<p><strong>Project Address:</strong> ${projectAddress}</p>` : ""}
      <p><strong>How heard about us:</strong> ${howHeardAboutUs}</p>
      <p><strong>Message:</strong></p>
      <p>${(message || "").replace(/\n/g, "<br/>")}</p>
      ${attachmentUrls.length ? `<p><strong>Storage Attachments:</strong><br/>${attachmentUrls.map((p) => `<code>${p}</code>`).join('<br/>')}</p>` : ''}
    `;

    const toAddress = "info@auswindowshrouds.com.au";

    const { data, error } = await resend.emails.send({
      from: "Aus Window Shrouds <info@auswindowshrouds.com.au>",
      to: [toAddress],
      subject: `New Quote Request from ${firstName} ${lastName}`,
      html,
      reply_to: email,
      attachments: attachmentsForResend,
    } as any);

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-quote-email error:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
