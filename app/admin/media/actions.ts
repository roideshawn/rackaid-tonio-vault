'use server';

import { createServerActionClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function uploadMediaAsset(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

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
  const cookieStore = await cookies();
  const supabase = createServerActionClient({ cookies: () => cookieStore });

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/media');
  return { success: true };
}