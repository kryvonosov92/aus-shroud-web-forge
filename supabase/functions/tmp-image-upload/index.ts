import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.searchParams.get("path");
  if (!path) return new Response("missing path", { status: 400 });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const body = await req.arrayBuffer();
  const contentType = req.headers.get("content-type") || "application/octet-stream";
  const { error } = await supabase.storage
    .from("aws-media")
    .upload(path, body, { contentType, upsert: true });
  if (error) return new Response(error.message, { status: 500 });
  return new Response("ok");
});
