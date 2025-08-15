import { supabase } from "@/lib/supabase";

export async function uploadToAwsMedia(file: File | Blob, suggestedExt?: string): Promise<string> {
  const ext = (file instanceof File && file.name.split('.').pop()) || suggestedExt || 'bin';
  const key = `img-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('aws-media').upload(key, file, {
    upsert: false,
    contentType: (file as any).type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('aws-media').getPublicUrl(key);
  return data.publicUrl;
}

