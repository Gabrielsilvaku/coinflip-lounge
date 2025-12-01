-- Add RLS policies for wallet_links table
CREATE POLICY "Anyone can view wallet links"
ON public.wallet_links
FOR SELECT
TO public
USING (true);

CREATE POLICY "Service role can manage wallet links"
ON public.wallet_links
FOR ALL
TO service_role
USING (true);