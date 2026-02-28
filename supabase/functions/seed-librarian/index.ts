import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if librarian already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const librarianExists = existingUsers?.users?.some(
      (u: any) => u.email === "yuva@gmail.com"
    );

    if (librarianExists) {
      return new Response(
        JSON.stringify({ message: "Librarian already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create librarian user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: "yuva@gmail.com",
      password: "2020yuvaguru",
      email_confirm: true,
      user_metadata: { name: "Yuva Guru", role: "librarian" },
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Librarian created", user_id: user.user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
