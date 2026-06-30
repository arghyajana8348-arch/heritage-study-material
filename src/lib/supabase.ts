import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://pcpwlzgraqhmmbfbsbqy.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_hPOfg0hP6ksCZ0cx6dBAxw_WX8thatF";

export const supabase = createClient(supabaseUrl, supabaseKey);
