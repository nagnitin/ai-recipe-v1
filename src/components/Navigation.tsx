import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, 
  ChefHat, 
  Info, 
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pages = [
    { id: "chat", label: "Chat Assistant", icon: MessageSquare },
    { id: "recipes", label: "Recipe Generator", icon: ChefHat },
    { id: "about", label: "About", icon: Info }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden md:block p-2 shadow-soft mb-6">
        <div className="flex items-center justify-center gap-2">
          {pages.map((page) => (
            <Button
              key={page.id}
              variant={currentPage === page.id ? "chef" : "ghost"}
              onClick={() => onPageChange(page.id)}
              className="flex items-center gap-2"
            >
              <page.icon className="h-4 w-4" />
              {page.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="md:hidden mb-6">
        {/* Mobile Header */}
        <Card className="p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              {(() => {
                const currentPageData = pages.find(p => p.id === currentPage);
                return currentPageData ? (
                  <>
                    <currentPageData.icon className="h-5 w-5" />
                    {currentPageData.label}
                  </>
                ) : null;
              })()}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </Card>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <Card className="mt-2 p-2 shadow-warm">
            <div className="space-y-1">
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "chef" : "ghost"}
                  onClick={() => {
                    onPageChange(page.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <page.icon className="h-4 w-4" />
                  {page.label}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};