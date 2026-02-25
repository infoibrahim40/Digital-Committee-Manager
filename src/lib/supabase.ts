import { createClient } from '@supabase/supabase-js';

// Fallback to provided credentials if environment variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eedeilvmlhmoegttlhsy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZGVpbHZtbGhtb2VndHRsaHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjM0ODAsImV4cCI6MjA4NzU5OTQ4MH0.f8w4Vi7xdPA3nVTzXgIq8OtxC2EQwxWlUhop2JLVe5Y';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
