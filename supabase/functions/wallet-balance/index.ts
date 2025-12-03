import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return new Response(JSON.stringify({ error: "walletAddress is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rpcBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [walletAddress],
    };

    const rpcResponse = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rpcBody),
    });

    if (!rpcResponse.ok) {
      const text = await rpcResponse.text();
      console.error("Solana RPC error", rpcResponse.status, text);
      return new Response(JSON.stringify({ error: "Failed to fetch balance" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await rpcResponse.json();
    const lamports = json?.result?.value ?? 0;
    const balance = lamports / 1_000_000_000; // lamports to SOL

    return new Response(JSON.stringify({ balance }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("wallet-balance error", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
