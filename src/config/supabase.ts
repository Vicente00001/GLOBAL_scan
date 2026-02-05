import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reemplaza con tus valores de Supabase
// Encuentra estos valores en: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'https://jthkrexyketbecgmxstk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wjqVWRRMB8sHFgED5QVJuQ_ssvXdYaM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { supabase };
