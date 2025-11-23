import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

interface ChatBoxProps {
  roomId: string | null;
  walletAddress: string | null;
}

export const ChatBox = ({ roomId, walletAddress }: ChatBoxProps) => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage } = useChat(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!walletAddress || !message.trim()) return;
    sendMessage(walletAddress, message);
    setMessage('');
  };

  if (!roomId) return null;

  return (
    <Card className="bg-card border border-border p-4 h-[400px] flex flex-col">
      <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
        💬 Chat da Sala
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
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
                  : 'bg-muted mr-8'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-primary">
                  {msg.wallet_address.slice(0, 4)}...{msg.wallet_address.slice(-4)}
                </span>
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

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={walletAddress ? "Digite sua mensagem..." : "Conecte sua carteira"}
          disabled={!walletAddress}
          className="bg-background border-border text-foreground"
        />
        <Button
          onClick={handleSend}
          disabled={!walletAddress || !message.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
