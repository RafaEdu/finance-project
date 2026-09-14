import { supabase } from "../lib/supabase";

const AVATAR_BUCKET = "avatars";

// Envia a imagem do avatar e devolve a URL pública.
export async function uploadAvatar(
  userId,
  body,
  { contentType = "image/png", fileExt = "png" } = {},
) {
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(fileName, body, { contentType, upsert: true });

  if (uploadError) return { data: null, error: uploadError };

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName);
  return { data: data?.publicUrl ?? null, error: null };
}
