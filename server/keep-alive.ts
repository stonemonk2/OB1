// ============================================================
// 2ndBrain — Supabase Keep-Alive Edge Function
// Prevents free tier projects from pausing due to inactivity.
// Deploy this alongside index.ts using the same process.
// Schedule via pg_cron — see instructions in README.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    const { data, error } = await supabase
      .from("thoughts")
      .select("id")
      .limit(1);

    if (error) throw error;

    const count = data?.length ?? 0;
    console.log(`✅ Keep-alive ping successful. Rows sampled: ${count}`);

    return new Response(
      JSON.stringify({
        status: "alive",
        timestamp: new Date().toISOString(),
        rows_sampled: count
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Keep-alive ping failed:", err);
    return new Response(
      JSON.stringify({ status: "error", message: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
