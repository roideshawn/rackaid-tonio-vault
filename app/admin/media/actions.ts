'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper to initialize the new Supabase SSR client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (error) {}
        }
      }
    }
  );
}

export async function uploadMediaAsset(formData: FormData) {
  const supabase = await getSupabase();
  
  const file = formData.get('file') as File;
  const bucketName = formData.get('bucket') as string;

  if (!file || !bucketName) {
    return { success: false, error: 'Missing file asset or target destination.' };
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  revalidatePath('/admin/media');
  return { success: true, url: publicUrlData.publicUrl };
}

export async function deleteMediaAsset(bucketName: string, path: string) {
  const supabase = await getSupabase();

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/media');
  return { success: true };
}