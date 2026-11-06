// Supabase client. The URL and the publishable key are meant to be public: row level security (table quiz_progress) protects the data.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://dflsowyzpizrdvwqtroa.supabase.co', 'sb_publishable_eZsyx0TkLHSp8uROpCpD4A_Ba1BjQzL')
