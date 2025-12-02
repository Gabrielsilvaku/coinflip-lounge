import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, User } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useChatUserInfo } from '@/hooks/useChatUserInfo';
import { supabase } from '@/integrations/supabase/client';

interface ChatBoxProps {
  roomId: string | null;
  walletAddress: string | null;
}

export const ChatBox = ({ roomId, walletAddress }: ChatBoxProps) => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage } = useChat(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  
  const walletAddresses = messages.map(m => m.wallet_address);
  const userInfoMap = useChatUserInfo(walletAddresses);

  useEffect(() => {
    if (!walletAddress) return;
    checkMuteStatus();
  }, [walletAddress]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkMuteStatus = async () => {
    if (!walletAddress) return;

    try {
      const { data } = await supabase
        .from('muted_users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (data) {
        const mutedUntil = new Date(data.muted_until);
        if (mutedUntil > new Date()) {
          setIsMuted(true);
        } else {
          setIsMuted(false);
        }
      } else {
        setIsMuted(false);
      }
    } catch (error) {
      setIsMuted(false);
    }
  };

  const handleSend = () => {
    if (!walletAddress || !message.trim()) return;
    
    if (isMuted) {
      return;
    }

    // Anti-spam: 2 segundos entre mensagens
    const now = Date.now();
    if (now - lastMessageTime < 2000) {
      return;
    }

    sendMessage(walletAddress, message);
    setMessage('');
    setLastMessageTime(now);
  };

  return (
    <div className="bg-card-glass border border-primary/40 p-4 h-[400px] flex flex-col rounded-lg">
      <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
        💬 Chat da Sala
        {walletAddress === 'PRINCEM' && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs">
            OWNER
          </Badge>
        )}
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center mt-8">
            Nenhuma mensagem ainda. Seja o primeiro!
          </p>
        ) : (
          messages.map((msg) => {
            const userInfo = userInfoMap[msg.wallet_address];
            const isOwner = msg.wallet_address === 'PRINCEM';
            const displayName = isOwner 
              ? 'PRINCEM' 
              : userInfo?.display_name || `${msg.wallet_address.slice(0, 4)}...${msg.wallet_address.slice(-4)}`;
            
            return (
              <div
                key={msg.id}
                className={`p-2 rounded-lg relative overflow-hidden ${
                  msg.wallet_address === walletAddress
                    ? 'bg-primary/20 ml-8'
                    : isOwner
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/50'
                    : 'bg-muted mr-8'
                }`}
              >
                {/* Aura effect */}
                {userInfo && userInfo.level > 0 && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${userInfo.aura_color} opacity-10 animate-pulse`} />
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-primary" />
                      <span className={`text-xs font-bold bg-gradient-to-r ${userInfo?.aura_color || 'from-primary to-primary'} bg-clip-text text-transparent`}>
                        {displayName}
                      </span>
                    </div>
                    
                    {userInfo && userInfo.level > 0 && (
                      <Badge className={`bg-gradient-to-r ${userInfo.aura_color} text-white text-xs px-1.5 py-0 font-bold border-0`}>
                        Lv.{userInfo.level}
                      </Badge>
                    )}
                    
                    {userInfo?.transformation && (
                      <Badge className={`bg-gradient-to-r ${userInfo.aura_color} text-white text-xs px-1.5 py-0 font-bold border-0`}>
                        {userInfo.transformation}
                      </Badge>
                    )}
                    
                    {isOwner && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs px-1.5 py-0 font-bold">
                        Ⓜ MAJIN
                      </Badge>
                    )}
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            !walletAddress 
              ? "Conecte sua carteira" 
              : isMuted 
              ? "Você está silenciado" 
              : "Digite sua mensagem..."
          }
          disabled={!walletAddress || isMuted}
          className="bg-background border-border text-foreground"
        />
        <Button
          onClick={handleSend}
          disabled={!walletAddress || !message.trim() || isMuted}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
