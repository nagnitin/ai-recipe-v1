import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Camera, 
  MessageSquare, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Tablet 
} from "lucide-react";

export const AboutPage = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Chat with AI",
      description: "Get cooking advice, recipe suggestions, and culinary tips through natural conversation"
    },
    {
      icon: Camera,
      title: "Image Analysis",
      description: "Upload photos of your ingredients to get personalized recipe ideas"
    },
    {
      icon: Sparkles,
      title: "Recipe Generation",
      description: "Get complete recipes with ingredients and step-by-step instructions"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Camera integration and responsive design for all devices"
    }
  ];

  const techStack = [
    { name: "React", description: "Modern UI framework" },
    { name: "TypeScript", description: "Type-safe development" },
    { name: "Tailwind CSS", description: "Responsive styling" },
    { name: "Google Gemini AI", description: "AI-powered responses" },
    { name: "Shadcn/ui", description: "Beautiful components" }
  ];

  const deviceFeatures = [
    {
      icon: Smartphone,
      device: "Mobile",
      features: ["Touch-friendly interface", "Camera integration", "Optimized layouts"]
    },
    {
      icon: Tablet,
      device: "Tablet",
      features: ["Adaptive design", "Touch gestures", "Balanced layouts"]
    },
    {
      icon: Monitor,
      device: "Desktop",
      features: ["Full feature access", "Keyboard shortcuts", "Multi-column layouts"]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chef-orange bg-clip-text text-transparent">
          AI Recipe Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your smart kitchen companion powered by Google Gemini AI. Get personalized recipes, 
          cooking advice, and ingredient analysis through chat and image recognition.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center shadow-soft hover:shadow-warm transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-chef-orange rounded-lg flex items-center justify-center mb-3">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to Use */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            How to Use
          </CardTitle>
          <CardDescription>
            Get started with your AI cooking assistant in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-chef-orange rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Use the Chat Assistant to ask cooking questions or get recipe suggestions
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-herb-green to-fresh-mint rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold">Upload Ingredients</h3>
              <p className="text-sm text-muted-foreground">
                Take photos of your fridge or ingredients for personalized recipe ideas
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-chef-orange rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold">Get Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed recipes with ingredients and step-by-step instructions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Compatibility */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl">Device Compatibility</CardTitle>
          <CardDescription>
            Optimized experience across all your devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deviceFeatures.map((device, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mx-auto">
                  <device.icon className="h-8 w-8 text-spice-brown" />
                </div>
                <h3 className="font-semibold text-lg">{device.device}</h3>
                <ul className="space-y-1">
                  {device.features.map((feature, fIndex) => (
                    <li key={fIndex} className="text-sm text-muted-foreground">{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle className="text-2xl">Technical Stack</CardTitle>
          <CardDescription>
            Built with modern technologies for the best user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="text-center space-y-2">
                <Badge variant="secondary" className="w-full py-2">
                  {tech.name}
                </Badge>
                <p className="text-xs text-muted-foreground">{tech.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <p className="text-muted-foreground">
          Powered by <span className="font-semibold text-primary">Google Gemini AI</span> 🤖
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Making cooking accessible and fun for everyone
        </p>
      </div>
    </div>
  );
};