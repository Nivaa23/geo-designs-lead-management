
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Supabase test failed:', error.message);
    return { success: false, error: error.message };
  }

  console.log('Supabase connection successful:', data);
  return { success: true, data };
}
