import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nlxdrbqstjodlkrsisbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seGRyYnFzdGpvZGxrcnNpc2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTU4MzcsImV4cCI6MjA2ODY3MTgzN30.BRODsGG0ENL3vnEzWcP5_a-_-60FyJxkzZVVTdgDK2k';

export const supabase = createClient(supabaseUrl, supabaseKey);
