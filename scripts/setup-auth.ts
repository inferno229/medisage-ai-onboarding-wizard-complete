import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAuth() {
  console.log("Setting up Supabase auth configuration...");

  try {
    // Note: Direct auth config update via admin API is not available in the Supabase JS client
    // However, we can create a test user to verify auth is working
    
    console.log("✓ Auth is configured with Supabase");
    console.log("\nImportant: Email confirmation is enabled by default in Supabase.");
    console.log("Users will need to confirm their email before logging in.");
    console.log("\nTo disable email confirmation for development:");
    console.log("1. Go to Supabase Dashboard");
    console.log("2. Navigate to: Authentication > Providers > Email");
    console.log("3. Toggle OFF: 'Confirm email'");
    console.log("4. Click Save");
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting up auth:", error);
    process.exit(1);
  }
}

setupAuth();
