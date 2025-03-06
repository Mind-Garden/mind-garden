'use server';

import { createClient } from '@/supabase/server';

export async function getDataHeatmap(userId: string) {
  const supabase = await createClient();

  const result = await supabase.rpc('get_heatmap_data', {user_id_param: userId});

  return result;
}