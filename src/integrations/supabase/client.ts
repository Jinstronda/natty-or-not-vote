
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = "https://nutgdqowaqjnxtedascw.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGdkcW93YXFqbnh0ZWRhc2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTI4NDIsImV4cCI6MjA2NTA2ODg0Mn0.qMp-opvv1lDphYUYtRGL9XhFlexaEBHtpcSViW3p5_Y"

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
