import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "./ImageUpload";
import { extractIngredientsAndRecipes, chatWithAI } from "@/lib/gemini";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ChefHat, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RecipeGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [chatImage, setChatImage] = useState<File | null>(null);
  const [chatImageUrl, setChatImageUrl] = useState<string | null>(null);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const { toast } = useToast();

  const handleImageAnalysis = async (file: File) => {
    setIsLoading(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      const response = await extractIngredientsAndRecipes(file);
      setRecipes(response);
      
      toast({
        title: "Success!",
        description: "Image analyzed and recipes generated!"
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatImageUpload = (file: File) => {
    setChatImage(file);
    const url = URL.createObjectURL(file);
    setChatImageUrl(url);
  };

  const handleChatSubmit = async () => {
    if (!chatQuestion.trim() || !chatImage) return;

    setIsLoading(true);
    try {
      const response = await chatWithAI(chatQuestion, chatImage);
      setChatResponse(response);
      
      toast({
        title: "Response received!",
        description: "AI has analyzed your ingredients."
      });
    } catch (error) {
      console.error("Error getting chat response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" />
          AI Recipe Generator
        </h1>
        <p className="text-muted-foreground">
          Upload photos of your ingredients and get personalized recipe suggestions!
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Recipes
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Chat with Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Upload Your Ingredients</CardTitle>
              <CardDescription>
                Take a photo of your fridge, pantry, or ingredients to get recipe suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <ImageUpload onImageUpload={handleImageAnalysis} />
                {uploadedImage && (
                  <div className="w-full max-w-md">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded ingredients" 
                      className="w-full rounded-lg shadow-md object-cover max-h-64"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(isLoading || recipes) && (
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Recipe Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Analyzing ingredients and generating recipes...</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {recipes}
                      </pre>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Chat About Your Ingredients</CardTitle>
              <CardDescription>
                Upload an image and ask specific questions about your ingredients or recipes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload onImageUpload={handleChatImageUpload} />
              
              {chatImageUrl && (
                <div className="w-full max-w-md mx-auto">
                  <img 
                    src={chatImageUrl} 
                    alt="Chat ingredients" 
                    className="w-full rounded-lg shadow-md object-cover max-h-64"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask about your ingredients (e.g., 'What can I make with these?', 'Are these ingredients fresh?')"
                  onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                />
                <Button 
                  onClick={handleChatSubmit}
                  disabled={!chatQuestion.trim() || !chatImage || isLoading}
                  variant="chef"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask AI"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(isLoading || chatResponse) && (
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">AI is analyzing your ingredients...</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {chatResponse}
                      </pre>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};