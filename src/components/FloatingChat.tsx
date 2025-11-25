import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      {/* Chat Button - Positioned above music player */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg hover:shadow-primary/50 flex items-center justify-center transition-all hover:scale-110 animate-pulse"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
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
              <div className="h-96 overflow-y-auto p-3 space-y-2 bg-background/95">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center mt-8">
                    Nenhuma mensagem ainda. Seja o primeiro!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg ${
                        msg.wallet_address === walletAddress
                          ? 'bg-primary/20 ml-8'
                          : msg.wallet_address === 'PRINCEM'
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/50'
                          : 'bg-muted mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-primary font-bold">
                          {msg.wallet_address === 'PRINCEM'
                            ? 'PRINCEM'
                            : `${msg.wallet_address.slice(0, 4)}...${msg.wallet_address.slice(-4)}`}
                        </span>
                        {msg.wallet_address === 'PRINCEM' && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-1.5 py-0 font-bold">
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
                  ))
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
