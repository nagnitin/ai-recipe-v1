import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ImageUpload } from "./ImageUpload";
import { chatWithAI } from "@/lib/gemini";
import { Send, MessageSquare, Trash2, ChefHat, Leaf, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  const addMessage = useCallback((message: Omit<Message, "id">) => {
    const newMessage = { ...message, id: Date.now().toString() };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleImageUpload = useCallback((file: File) => {
    setCurrentImage(file);
    const url = URL.createObjectURL(file);
    setCurrentImageUrl(url);
  }, []);

  const clearImage = useCallback(() => {
    if (currentImageUrl) {
      URL.revokeObjectURL(currentImageUrl);
    }
    setCurrentImage(null);
    setCurrentImageUrl(null);
  }, [currentImageUrl]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text && !currentImage) return;

    setIsLoading(true);
    try {
      // Add user message
      addMessage({
        role: "user",
        content: text || "Analyze this image",
        image: currentImageUrl || undefined
      });

      // Get AI response
      const response = await chatWithAI(text, currentImage || undefined);
      
      // Add AI response
      addMessage({
        role: "assistant",
        content: response
      });

      // Clear input and image
      setInput("");
      clearImage();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, currentImage, currentImageUrl, addMessage, clearImage, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    clearImage();
    setInput("");
  }, [clearImage]);

  const quickActions = [
    {
      icon: ChefHat,
      label: "Recipe Ideas",
      message: "Give me some quick recipe ideas for dinner",
      variant: "chef" as const
    },
    {
      icon: Leaf,
      label: "Healthy Options",
      message: "What are some healthy meal options?",
      variant: "fresh" as const
    },
    {
      icon: Clock,
      label: "Quick Meals",
      message: "What are some meals I can make in under 30 minutes?",
      variant: "warm" as const
    }
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Messages */}
      <Card className="flex-1 mb-4 shadow-soft">
        <ScrollArea className="h-[60vh] p-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to AI Cooking Assistant!</h3>
              <p className="text-muted-foreground mb-6">
                Ask me about cooking, upload ingredient photos, or get recipe suggestions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-md">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant={action.variant}
                    size="sm"
                    onClick={() => sendMessage(action.message)}
                    disabled={isLoading}
                    className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  image={message.image}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="p-4 bg-card shadow-soft">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Image Preview */}
      {currentImageUrl && (
        <Card className="p-4 mb-4 bg-cream">
          <div className="flex items-center gap-3">
            <img 
              src={currentImageUrl} 
              alt="Upload preview" 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Image ready to analyze</p>
              <p className="text-xs text-muted-foreground">This image will be sent with your next message</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearImage}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Input Area */}
      <Card className="p-4 shadow-warm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cooking, recipes, or upload an image..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={isLoading || (!input.trim() && !currentImage)}
                variant="chef"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <ImageUpload onImageUpload={handleImageUpload} />
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions (when chat has messages) */}
      {messages.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                onClick={() => sendMessage(action.message)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};