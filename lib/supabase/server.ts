import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
}