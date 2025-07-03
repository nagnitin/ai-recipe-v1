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
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-medium [&>h3]:mt-3 [&>h3]:mb-1 [&>ul]:my-2 [&>ol]:my-2 [&>p]:my-1">
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium mt-3 mb-1 text-foreground">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                p: ({ children }) => <p className="my-1 text-sm">{children}</p>,
              }}
            >
              {content}
            </ReactMarkdown>
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