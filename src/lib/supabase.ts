
import { createClient } from '@supabase/supabase-js'

// Supabase configuration that works in both Lovable and local development
// In Lovable: Uses the direct values below
// In local development: Uses VITE_* environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlxdrbqstjodlkrsisbd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seGRyYnFzdGpvZGxrcnNpc2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTU4MzcsImV4cCI6MjA2ODY3MTgzN30.BRODsGG0ENL3vnEzWcP5_a-_-60FyJxkzZVVTdgDK2k';

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration error: Missing URL or API key');
  throw new Error('Supabase configuration is incomplete. Please check your environment variables or configuration.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Supabase configuration error: Invalid URL format');
  throw new Error('Supabase URL is not a valid URL format.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log configuration status (without exposing sensitive data)
console.log('Supabase client initialized successfully');
console.log('Using URL:', supabaseUrl);
console.log('Environment source:', import.meta.env.VITE_SUPABASE_URL ? 'Environment variables' : 'Direct configuration');
