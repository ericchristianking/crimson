import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://jkikhteetiusofprmnox.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpraWtodGVldGl1c29mcHJtbm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDc2OTUsImV4cCI6MjA4MjUyMzY5NX0.P73O5iHS2iOW0Pl7wQWdgcxp8zP8RHl0zyYmcL5v2mk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
