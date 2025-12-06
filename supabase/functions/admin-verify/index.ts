import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import * as nacl from "https://esm.sh/tweetnacl@1.0.3";
import { decode as decodeBase58 } from "https://deno.land/std@0.168.0/encoding/base58.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Owner wallet address - the only wallet that can perform admin actions
const OWNER_WALLET = "4uNhT1fDwJg62gYbT7sSfJ4Qmwp7XAGSVCoEMUUoHktU";

const getAdminClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

// Verify that a signature was made by the claimed wallet
function verifySignature(message: string, signature: string, publicKey: string): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = decodeBase58(signature);
    const publicKeyBytes = decodeBase58(publicKey);
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

// Verify the wallet is the owner
function isOwner(walletAddress: string): boolean {
  return walletAddress === OWNER_WALLET;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { action, walletAddress, signature, timestamp } = body;

  if (!action) {
    return new Response(JSON.stringify({ error: "Missing action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = getAdminClient();

  try {
    // Action: check_admin - verify if wallet is admin (no signature needed for read)
    if (action === "check_admin") {
      if (!walletAddress) {
        return new Response(JSON.stringify({ isAdmin: false }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if wallet is owner
      const adminStatus = isOwner(walletAddress);
      
      return new Response(JSON.stringify({ isAdmin: adminStatus }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For all other admin actions, require signature verification
    if (!walletAddress || !signature || !timestamp) {
      return new Response(JSON.stringify({ error: "Missing authentication data" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify timestamp is within 5 minutes
    const timestampDate = new Date(timestamp);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - timestampDate.getTime());
    if (diffMs > 5 * 60 * 1000) {
      return new Response(JSON.stringify({ error: "Signature expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify wallet is owner
    if (!isOwner(walletAddress)) {
      return new Response(JSON.stringify({ error: "Unauthorized: Not admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature
    const message = `Admin action: ${action} at ${timestamp}`;
    const isValid = verifySignature(message, signature, walletAddress);

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process admin actions
    if (action === "ban_user") {
      const { targetWallet, reason, ipAddress } = body;
      
      if (!targetWallet) {
        return new Response(JSON.stringify({ error: "Missing targetWallet" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("banned_users")
        .insert({
          wallet_address: targetWallet,
          ip_address: ipAddress || null,
          reason: reason || null,
        });

      if (error) throw error;

      // Log action
      await supabase.from("action_logs").insert({
        action_type: "ban_user",
        target_wallet: targetWallet,
        details: { reason, ipAddress },
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unban_user") {
      const { targetWallet } = body;

      if (!targetWallet) {
        return new Response(JSON.stringify({ error: "Missing targetWallet" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("banned_users")
        .delete()
        .eq("wallet_address", targetWallet);

      if (error) throw error;

      await supabase.from("action_logs").insert({
        action_type: "unban_user",
        target_wallet: targetWallet,
        details: {},
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mute_user") {
      const { targetWallet, reason, durationMinutes } = body;

      if (!targetWallet || typeof durationMinutes !== "number") {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const mutedUntil = new Date();
      mutedUntil.setMinutes(mutedUntil.getMinutes() + durationMinutes);

      const { error } = await supabase.from("muted_users").insert({
        wallet_address: targetWallet,
        reason: reason || null,
        muted_until: mutedUntil.toISOString(),
      });

      if (error) throw error;

      await supabase.from("action_logs").insert({
        action_type: "mute_user",
        target_wallet: targetWallet,
        details: { reason, durationMinutes },
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unmute_user") {
      const { targetWallet } = body;

      if (!targetWallet) {
        return new Response(JSON.stringify({ error: "Missing targetWallet" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("muted_users")
        .delete()
        .eq("wallet_address", targetWallet);

      if (error) throw error;

      await supabase.from("action_logs").insert({
        action_type: "unmute_user",
        target_wallet: targetWallet,
        details: {},
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_house_edge") {
      const { newEdge } = body;

      if (typeof newEdge !== "number" || newEdge < 0 || newEdge > 100) {
        return new Response(JSON.stringify({ error: "Invalid house edge value" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("game_settings")
        .update({ setting_value: newEdge.toString() })
        .eq("setting_key", "house_edge");

      if (error) throw error;

      await supabase.from("action_logs").insert({
        action_type: "update_house_edge",
        target_wallet: "",
        details: { newEdge },
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "select_raffle_winner") {
      const { ticketNumber, winnerWallet } = body;

      if (typeof ticketNumber !== "number" || !winnerWallet) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("raffle_winners").insert({
        wallet_address: winnerWallet,
        ticket_number: ticketNumber,
        raffle_id: "main",
      });

      if (error) throw error;

      await supabase.from("action_logs").insert({
        action_type: "select_raffle_winner",
        target_wallet: winnerWallet,
        details: { ticketNumber },
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "draw_jackpot_winner") {
      const { roundId } = body;

      if (!roundId) {
        return new Response(JSON.stringify({ error: "Missing roundId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Load round
      const { data: round, error: roundError } = await supabase
        .from("jackpot_rounds")
        .select("id, total_pot, status")
        .eq("id", roundId)
        .single();

      if (roundError) throw roundError;

      if (!round || round.status !== "active") {
        return new Response(JSON.stringify({ alreadyCompleted: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Load bets
      const { data: bets, error: betsError } = await supabase
        .from("jackpot_bets")
        .select("id, wallet_address, ticket_start, ticket_end")
        .eq("round_id", roundId);

      if (betsError) throw betsError;

      if (!bets || bets.length === 0) {
        return new Response(JSON.stringify({ noBets: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Compute total tickets and draw winner
      const totalTickets = bets.reduce(
        (sum, bet) => sum + (bet.ticket_end - bet.ticket_start + 1),
        0
      );

      const winningTicket = Math.floor(Math.random() * totalTickets) + 1;

      let accumulated = 0;
      let winner: any = null;

      for (const bet of bets) {
        accumulated += bet.ticket_end - bet.ticket_start + 1;
        if (winningTicket <= accumulated) {
          winner = bet;
          break;
        }
      }

      if (!winner) {
        return new Response(JSON.stringify({ error: "No winner found" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update round
      const { data: updated, error: updateError } = await supabase
        .from("jackpot_rounds")
        .update({
          status: "completed",
          winner_wallet: winner.wallet_address,
          winner_ticket_number: winningTicket,
          completed_at: new Date().toISOString(),
        })
        .eq("id", roundId)
        .eq("status", "active")
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updated) {
        return new Response(JSON.stringify({ alreadyCompleted: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("action_logs").insert({
        action_type: "draw_jackpot_winner",
        target_wallet: winner.wallet_address,
        details: { roundId, winningTicket, prize: round.total_pot },
      });

      return new Response(
        JSON.stringify({
          winner: winner.wallet_address,
          winningTicket,
          prize: round.total_pot ?? 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-verify function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
