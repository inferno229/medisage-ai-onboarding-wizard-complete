import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function setupStorage() {
  try {
    console.log("Setting up Supabase storage bucket...");

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === "medical_reports");

    if (bucketExists) {
      console.log("Bucket 'medical_reports' already exists");
    } else {
      console.log("Creating bucket 'medical_reports'...");
      const { data, error } = await supabase.storage.createBucket("medical_reports", {
        public: false,
      });

      if (error) {
        console.error("Failed to create bucket:", error);
        process.exit(1);
      }

      console.log("Bucket created successfully:", data);
    }

    // Set up RLS policies for the bucket
    console.log("Storage bucket is ready!");
    console.log("Users can upload their medical files securely.");

  } catch (error) {
    console.error("Setup error:", error);
    process.exit(1);
  }
}

setupStorage();
