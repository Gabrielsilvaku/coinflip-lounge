import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import * as nacl from "https://esm.sh/tweetnacl@1.0.3";
import { decode as decodeBase58 } from "https://deno.land/std@0.168.0/encoding/base58.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Owner wallet address for admin-only operations
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

  const action = body?.action as string | undefined;

  if (!action) {
    return new Response(JSON.stringify({ error: "Missing action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = getAdminClient();

  try {
    // Action: ensure_active_round - public read, no auth needed
    if (action === "ensure_active_round") {
      const { data, error } = await supabase
        .from("jackpot_rounds")
        .select("*")
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching active round in function:", error);
        throw error;
      }

      let round = data;

      if (!round) {
        const { data: newRound, error: insertError } = await supabase
          .from("jackpot_rounds")
          .insert({
            status: "active",
            total_pot: 0,
            started_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (insertError) {
          console.error("Error creating new round in function:", insertError);
          throw insertError;
        }

        round = newRound;
      }

      return new Response(JSON.stringify({ round }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: place_bet - requires wallet signature verification
    if (action === "place_bet") {
      const roundId = (body.roundId || body.round_id) as string | undefined;
      const walletAddress = (body.walletAddress || body.wallet_address) as string | undefined;
      const amount = body.amount as number | undefined;
      const signature = body.signature as string | undefined;
      const timestamp = body.timestamp as string | undefined;

      if (!roundId || !walletAddress || typeof amount !== "number" || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid bet data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify wallet ownership via signature
      if (!signature || !timestamp) {
        return new Response(JSON.stringify({ error: "Missing signature for bet verification" }), {
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

      // Verify signature
      const message = `Place bet: ${amount} SOL at ${timestamp}`;
      const isValid = verifySignature(message, signature, walletAddress);

      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid wallet signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get last ticket_end for this round
      const { data: lastBet, error: lastError } = await supabase
        .from("jackpot_bets")
        .select("ticket_end")
        .eq("round_id", roundId)
        .order("ticket_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError && lastError.code !== "PGRST116") {
        console.error("Error getting last bet in function:", lastError);
        throw lastError;
      }

      const lastTicketEnd = lastBet?.ticket_end ?? 0;
      const ticketStart = lastTicketEnd + 1;
      const ticketCount = Math.floor(amount * 10); // 1 SOL = 10 tickets

      if (ticketCount <= 0) {
        return new Response(JSON.stringify({ error: "Amount too low for tickets" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ticketEnd = ticketStart + ticketCount - 1;

      // Insert bet
      const { error: betError } = await supabase.from("jackpot_bets").insert({
        round_id: roundId,
        wallet_address: walletAddress,
        amount,
        ticket_start: ticketStart,
        ticket_end: ticketEnd,
      });

      if (betError) {
        console.error("Error inserting bet in function:", betError);
        throw betError;
      }

      // Update total pot safely
      const { data: round, error: roundError } = await supabase
        .from("jackpot_rounds")
        .select("total_pot")
        .eq("id", roundId)
        .single();

      if (roundError) {
        console.error("Error fetching round for pot update:", roundError);
        throw roundError;
      }

      const currentPot = Number(round?.total_pot ?? 0);
      const newTotalPot = currentPot + amount;

      const { error: updateError } = await supabase
        .from("jackpot_rounds")
        .update({ total_pot: newTotalPot })
        .eq("id", roundId);

      if (updateError) {
        console.error("Error updating pot in function:", updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ ticketStart, ticketEnd, ticketCount, totalPot: newTotalPot }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Action: draw_winner - requires admin signature verification
    if (action === "draw_winner") {
      const roundId = (body.roundId || body.round_id) as string | undefined;
      const walletAddress = body.walletAddress as string | undefined;
      const signature = body.signature as string | undefined;
      const timestamp = body.timestamp as string | undefined;

      if (!roundId) {
        return new Response(JSON.stringify({ error: "Missing roundId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify admin wallet for manual draws
      if (walletAddress && signature && timestamp) {
        if (walletAddress !== OWNER_WALLET) {
          return new Response(JSON.stringify({ error: "Unauthorized: Not admin" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const message = `Draw winner for round: ${roundId} at ${timestamp}`;
        const isValid = verifySignature(message, signature, walletAddress);

        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid admin signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Load round
      const { data: round, error: roundError } = await supabase
        .from("jackpot_rounds")
        .select("id, total_pot, status, started_at")
        .eq("id", roundId)
        .single();

      if (roundError) {
        console.error("Error loading round in draw_winner:", roundError);
        throw roundError;
      }

      if (!round || round.status !== "active") {
        return new Response(JSON.stringify({ alreadyCompleted: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // For automatic draws (no signature), verify 60 seconds have passed
      if (!signature) {
        const startedAt = new Date(round.started_at);
        const now = new Date();
        const elapsedMs = now.getTime() - startedAt.getTime();
        
        if (elapsedMs < 60000) {
          return new Response(JSON.stringify({ error: "Round timer not expired" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Load bets
      const { data: bets, error: betsError } = await supabase
        .from("jackpot_bets")
        .select("id, wallet_address, ticket_start, ticket_end")
        .eq("round_id", roundId);

      if (betsError) {
        console.error("Error loading bets in draw_winner:", betsError);
        throw betsError;
      }

      if (!bets || bets.length === 0) {
        return new Response(JSON.stringify({ noBets: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Compute total tickets
      const totalTickets = bets.reduce(
        (sum, bet) => sum + (bet.ticket_end - bet.ticket_start + 1),
        0,
      );

      const winningTicket = Math.floor(Math.random() * totalTickets) + 1;

      // Find winner
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

      // Update round as completed
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

      if (updateError) {
        console.error("Error updating round in draw_winner:", updateError);
        throw updateError;
      }

      if (!updated) {
        return new Response(JSON.stringify({ alreadyCompleted: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          winner: winner.wallet_address,
          winnerWallet: winner.wallet_address,
          winningTicket,
          prize: round.total_pot ?? 0,
          totalPot: round.total_pot ?? 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("jackpot-admin function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
