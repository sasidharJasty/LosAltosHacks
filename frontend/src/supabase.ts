// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rxgpsntwiidhhkftihmr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4Z3BzbnR3aWlkaGhrZnRpaG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMDU2MTEsImV4cCI6MjA1MTc4MTYxMX0.M1HQ9CWs87i9gdLIGzfSVJuxi0hngULaP3q5FcXRV4k";

export const supabase = createClient(supabaseUrl, supabaseKey);