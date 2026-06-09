import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://joywybbvhinvqsiomvkj.supabase.co'
const supabaseKey = 'sb_publishable_XwPu-Y0SWNWFRn6PSBHBAQ_b7AKr26u'

export const supabase = createClient(supabaseUrl, supabaseKey)
