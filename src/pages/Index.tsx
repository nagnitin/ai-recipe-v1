import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { RecipeGenerator } from "@/components/RecipeGenerator";
import { AboutPage } from "@/components/AboutPage";
import { Navigation } from "@/components/Navigation";
import { ChefHat } from "lucide-react";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("chat");

  const renderPage = () => {
    switch (currentPage) {
      case "chat":
        return <ChatInterface />;
      case "recipes":
        return <RecipeGenerator />;
      case "about":
        return <AboutPage />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/30 to-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chef-orange rounded-lg flex items-center justify-center shadow-warm">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-chef-orange bg-clip-text text-transparent">
              AI Recipe Assistant
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your smart kitchen companion powered by Google Gemini AI. 
            Get personalized recipes and cooking advice through chat and image analysis.
          </p>
        </div>

        {/* Navigation */}
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Main Content */}
        <main className="pb-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
