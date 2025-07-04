import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ImageUpload } from "./ImageUpload";
import { chatWithAI } from "@/lib/gemini";
import { Send, MessageSquare, Trash2, ChefHat, Leaf, Clock, Mic, Volume2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useVapi from "@/hooks/useVapi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log errorInfo to a service here
    // console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: 'red', background: '#fff' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollAreaRef.current) {
      // Find the actual scrollable viewport element within ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const targetScrollTop = viewport.scrollHeight - viewport.clientHeight;
        
        if (smooth) {
          viewport.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        } else {
          viewport.scrollTop = targetScrollTop;
        }
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      // Find the actual scrollable viewport element within ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom);
      }
    }
  }, []);

  const addMessage = useCallback((message: Omit<Message, "id">) => {
    const newMessage = { ...message, id: Date.now().toString() };
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll with better timing for cooking scenarios
    // Use multiple attempts to ensure scroll works even if viewport isn't ready
    const attemptScroll = (attempts = 0) => {
      if (attempts > 5) return; // Max 5 attempts
      
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            const targetScrollTop = viewport.scrollHeight - viewport.clientHeight;
            viewport.scrollTo({
              top: targetScrollTop,
              behavior: attempts === 0 ? 'auto' : 'smooth'
            });
          } else {
            // Try again if viewport isn't ready
            attemptScroll(attempts + 1);
          }
        }
      }, attempts === 0 ? 50 : 100 * attempts);
    };
    
    attemptScroll();
  }, []);

  // Add voice transcript messages to chat (move above useVapi)
  const handleUserTranscript = useCallback((text: string) => {
    addMessage({
      role: "user",
      content: text + " (voice input)"
    });
  }, [addMessage]);

  const handleAIResponse = useCallback((text: string) => {
    addMessage({
      role: "assistant",
      content: text + " (voice response)"
    });
  }, [addMessage]);

  const { isSessionActive, speak, stop, conversationHistory, addTextMessage, clearConversation } = useVapi({
    onUserTranscript: handleUserTranscript,
    onAIResponse: handleAIResponse
  });

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

      // Add to VAPI conversation context if we have history (voice session active or previous voice interaction)
      if (conversationHistory.length > 0) {
        addTextMessage(text);
      }

      // Get AI response - use VAPI context if we have conversation history
      let response;
      if (conversationHistory.length > 0) {
        // Use VAPI conversation context for consistent responses
        const vapiMessages = [
          {
            role: "system" as const,
            content: `You are a helpful cooking assistant. You must only answer questions or engage in conversation related to cooking, recipes, food, ingredients, kitchen topics, or the current cooking process. You should also respond to greetings, confirmations (like "I'm ready", "next", "what's next", "go on", "repeat", "stop", etc.), and any conversational flow that helps the user cook or follow instructions. If the user asks about anything completely unrelated to cooking, food, or the current recipe process, politely reply: 'Sorry, I can only answer questions about cooking, food, or recipes.' Continue the conversation naturally, maintaining context from the previous interaction. If the user says they're ready or done with a step, continue to the next step or provide the next instruction.`
          },
          ...conversationHistory,
          { role: "user" as const, content: text }
        ];
        
        // Use the same AI model as VAPI for consistency
        response = await chatWithAI(text, currentImage || undefined, vapiMessages);
      } else {
        // Regular chat response
        response = await chatWithAI(text, currentImage || undefined);
      }
      
      // Add AI response
      addMessage({
        role: "assistant",
        content: response
      });

      // If voice session is active, speak the AI response
      if (isSessionActive) {
        // Speak the AI response
        speak(response).catch(err => {
          console.error('Error speaking response:', err);
        });
      }

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
  }, [input, currentImage, currentImageUrl, addMessage, clearImage, toast, isSessionActive, speak, conversationHistory, addTextMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    clearImage();
    setInput("");
    clearConversation(); // Clear VAPI conversation history
  }, [clearImage, clearConversation]);

  const clearConversationContext = useCallback(() => {
    clearConversation();
    toast({
      title: "Conversation Context Cleared",
      description: "You can now start a new conversation.",
    });
  }, [clearConversation, toast]);

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

  // Find the latest AI message for voice guidance
  const latestAIMessage = messages.filter(m => m.role === "assistant").slice(-1)[0]?.content || "";

  // On first load, greet the user in text and voice
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = "Hello! I am your AI cooking assistant. How can I help you in the kitchen today?";
      addMessage({ role: "assistant", content: greeting });
      
      // Handle async speak function properly to prevent React Error #31
      const handleGreetingSpeak = async () => {
        try {
          await speak(greeting);
        } catch (err) {
          console.error('Error speaking greeting:', err);
        }
      };
      handleGreetingSpeak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle scroll events for scroll-to-bottom button
  useEffect(() => {
    const scrollElement = scrollAreaRef.current;
    if (scrollElement) {
      // Find the actual scrollable viewport element within ScrollArea
      const viewport = scrollElement.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.addEventListener('scroll', handleScroll);
        return () => viewport.removeEventListener('scroll', handleScroll);
      }
    }
  }, [handleScroll]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full max-w-4xl mx-auto">
        {/* Chat Messages */}
        <Card className="flex-1 mb-4 shadow-soft relative">
          {/* Voice Session Indicator */}
          {isSessionActive && (
            <div className="absolute top-2 left-2 z-20">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Voice Session Active
              </div>
            </div>
          )}
          
          {/* Conversation Context Indicator */}
          {!isSessionActive && conversationHistory.length > 0 && (
            <div className="absolute top-2 left-2 z-20">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Continuing Voice Conversation
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversationContext}
                  className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                  title="Clear conversation context"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          <ScrollArea 
            className="h-[60vh] p-6" 
            ref={scrollAreaRef}
          >
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
          
          {/* Scroll to Bottom Button */}
          {showScrollToBottom && messages.length > 0 && (
            <Button
              onClick={() => scrollToBottom(true)}
              size="sm"
              variant="secondary"
              className="absolute bottom-4 right-4 z-10 shadow-lg hover:shadow-xl transition-all duration-200"
              title="Scroll to latest message"
            >
              <ChevronDown className="h-4 w-4" />
              <span className="ml-1 text-xs">Latest</span>
            </Button>
          )}
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
                {/* Voice Action Button */}
                <Button
                  onClick={() => {
                    if (isSessionActive) {
                      stop();
                    } else if (latestAIMessage) {
                      // Handle async speak function properly to prevent React Error #31
                      const handleSpeak = async () => {
                        try {
                          await speak(latestAIMessage);
                        } catch (err) {
                          console.error('Error speaking message:', err);
                        }
                      };
                      handleSpeak();
                    }
                  }}
                  disabled={isLoading || !latestAIMessage}
                  variant={isSessionActive ? "fresh" : "outline"}
                  title={isSessionActive ? "Stop Voice Guidance" : "Voice Guidance"}
                >
                  {isSessionActive ? <Volume2 className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
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
    </ErrorBoundary>
  );
};