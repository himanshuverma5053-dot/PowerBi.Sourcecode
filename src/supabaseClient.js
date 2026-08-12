import { createClient } from '@supabase/supabase-js';

const RAW_SUPABASE_URL = "https://vqdzmzvsimdfkgyspsvd.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_P9eeqX3o3AjivDgB72ureQ_NpxXIge_";

// Strip out /rest/v1/ suffix if present so @supabase/supabase-js can correctly route /auth/v1 and /rest/v1 requests
const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

