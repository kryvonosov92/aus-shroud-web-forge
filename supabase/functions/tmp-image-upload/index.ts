import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  const path = url.searchParams.get("path");
  const contentType = req.headers.get("content-type") || "image/png";
  if (!path || req.method !== "POST") {
    return new Response(JSON.stringify({ error: "path query param and POST required" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const body = await req.arrayBuffer();
  const { error } = await supabase.storage
    .from("aws-media")
    .upload(path, body, { contentType, upsert: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ ok: true, path }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
