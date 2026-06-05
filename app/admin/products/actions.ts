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

export async function saveProduct(formData: FormData) {
  const supabase = await getSupabase();

  const id = formData.get('id') as string | null;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const is_featured = formData.get('is_featured') === 'true';
  let image_url = formData.get('existing_image_url') as string;

  const file = formData.get('image') as File;
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
      image_url = publicUrlData.publicUrl;
    }
  }

  const productData = { name, description, price, stock, is_featured, image_url };

  let error;
  if (id) {
    const res = await supabase.from('products').update(productData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabase.from('products').insert([productData]);
    error = res.error;
  }

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/shop');
  
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await getSupabase();

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/shop');
  
  return { success: true };
}