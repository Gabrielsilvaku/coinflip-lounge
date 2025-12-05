import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useChatUserInfo } from '@/hooks/useChatUserInfo';
import { AuraAvatar } from '@/components/AuraAvatar';
import { supabase } from '@/integrations/supabase/client';

interface FloatingChatProps {
  walletAddress: string | null;
}

export const FloatingChat = ({ walletAddress }: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const { messages, sendMessage } = useChat('global');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const walletAddresses = messages.map(m => m.wallet_address);
  const userInfoMap = useChatUserInfo(walletAddresses);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check mute status
  useEffect(() => {
    if (!walletAddress) return;
    
    const checkMute = async () => {
      const { data } = await supabase
        .from('muted_users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .gt('muted_until', new Date().toISOString())
        .maybeSingle();
      
      setIsMuted(!!data);
    };
    
    checkMute();
  }, [walletAddress]);

  const handleSend = () => {
    if (!walletAddress || !message.trim() || isMuted) return;

    const now = Date.now();
    if (now - lastMessageTime < 2000) {
      return;
    }

    sendMessage(walletAddress, message);
    setMessage('');
    setLastMessageTime(now);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg hover:shadow-primary/50 flex items-center justify-center transition-all hover:scale-110 animate-pulse"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center font-bold">
              {messages.length > 9 ? '9+' : messages.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed ${
            isMinimized ? 'bottom-28' : 'bottom-28'
          } right-6 z-50 w-80 bg-card border-2 border-primary/50 rounded-xl shadow-2xl shadow-primary/30 transition-all`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">Chat Global</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-3 space-y-3 bg-background/95">
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
                        className={`flex gap-2 ${
                          msg.wallet_address === walletAddress ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar with Aura */}
                        <AuraAvatar
                          level={userInfo?.level || 0}
                          transformation={userInfo?.transformation}
                          size="sm"
                        />

                        {/* Message Bubble */}
                        <div
                          className={`flex-1 p-2 rounded-lg relative overflow-hidden max-w-[200px] ${
                            msg.wallet_address === walletAddress
                              ? 'bg-primary/20 ml-auto'
                              : isOwner
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/50'
                              : 'bg-muted'
                          }`}
                        >
                          {/* Aura effect behind message */}
                          {userInfo && userInfo.level > 0 && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${userInfo.aura_color} opacity-5 animate-pulse`} />
                          )}
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-1 mb-1 flex-wrap">
                              <span className={`text-xs font-bold bg-gradient-to-r ${userInfo?.aura_color || 'from-primary to-primary'} bg-clip-text text-transparent`}>
                                {displayName}
                              </span>
                              
                              {userInfo && userInfo.level > 0 && (
                                <Badge className={`bg-gradient-to-r ${userInfo.aura_color} text-white text-[10px] px-1 py-0 font-bold border-0`}>
                                  {userInfo.level}
                                </Badge>
                              )}
                              
                              {isOwner && (
                                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-[10px] px-1 py-0 font-bold">
                                  Ⓜ
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground break-words">{msg.message}</p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={
                      !walletAddress
                        ? 'Conecte sua carteira'
                        : isMuted
                        ? 'Você está silenciado'
                        : 'Digite sua mensagem...'
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
            </>
          )}
        </div>
      )}
    </>
  );
};
