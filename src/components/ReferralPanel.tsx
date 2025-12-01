import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, DollarSign, Gift } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { toast } from "sonner";

interface ReferralPanelProps {
  walletAddress: string | null;
}

export const ReferralPanel = ({ walletAddress }: ReferralPanelProps) => {
  const { referralCode, referrals, totalEarned, loading } = useReferrals(walletAddress);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Código copiado!');
  };

  if (loading) {
    return (
      <Card className="bg-card border-2 border-primary/50 p-6">
        <p className="text-center text-muted-foreground">Carregando...</p>
      </Card>
    );
  }

  if (!walletAddress) {
    return (
      <Card className="bg-card border-2 border-primary/50 p-6">
        <p className="text-center text-muted-foreground">
          Conecte sua carteira para ver seu painel de afiliados
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-2 border-primary/50 p-6">
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Programa de Afiliados</h2>
          </div>
          <p className="text-muted-foreground">
            Ganhe 7% de comissão nas apostas dos seus indicados!
          </p>
        </div>

        {/* Referral Code */}
        <div className="bg-background/50 border-2 border-primary/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2 text-center">Seu Código de Referência</p>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="bg-background text-center font-mono text-lg font-bold text-primary"
            />
            <Button
              onClick={copyReferralCode}
              className="bg-primary hover:bg-primary/90"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total de Indicados</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{referrals.length}</p>
          </div>

          <div className="bg-background/50 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">Total Ganho</span>
            </div>
            <p className="text-3xl font-bold text-secondary">{totalEarned.toFixed(4)} SOL</p>
          </div>
        </div>

        {/* Referrals List */}
        {referrals.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Seus Indicados
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-background/50 border border-border rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-sm">
                      {referral.referee_wallet.slice(0, 8)}...{referral.referee_wallet.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">
                    +{referral.total_earned.toFixed(4)} SOL
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <h4 className="font-bold text-primary mb-2">Como Funciona</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Compartilhe seu código com amigos</li>
            <li>✓ Eles usam o código ao se cadastrar</li>
            <li>✓ Você ganha 7% de cada aposta deles</li>
            <li>✓ Sem limites de ganhos!</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
