import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export const ChatMessage = ({ role, content, image }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
        <Card className={`p-4 ${
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-card shadow-soft"
        }`}>
          {image && (
            <img 
              src={image} 
              alt="Uploaded content" 
              className="w-full max-w-xs rounded-lg mb-3 object-cover"
            />
          )}
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </Card>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};