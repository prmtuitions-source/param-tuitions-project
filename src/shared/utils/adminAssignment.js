import { supabase } from './supabaseClient';

const SUPER_ADMIN_ID = '08e6845d-a656-4a27-b028-6bc6bac54b03';

export const getAssignedAdmin = async (zoneName) => {
  if (!zoneName) return SUPER_ADMIN_ID;

  try {
    const { data, error } = await supabase
      .from('admin_zone_assignments')
      .select('admin_id')
      .eq('zone_name', zoneName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching assigned admin:', error);
      return SUPER_ADMIN_ID;
    }

    return data ? data.admin_id : SUPER_ADMIN_ID;
  } catch (err) {
    console.error('Unexpected error in getAssignedAdmin:', err);
    return SUPER_ADMIN_ID;
  }
};