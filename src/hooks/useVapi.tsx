import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const VAPI_API_KEY = "403b339f-18f7-4a6c-b958-6cc710661d5d";

// Global VAPI instance to prevent duplicates
let globalVapiInstance: any = null;

interface UseVapiOptions {
  onUserTranscript?: (text: string) => void;
  onAIResponse?: (text: string) => void;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function destroyVapiInstance() {
  if (globalVapiInstance) {
    try {
      globalVapiInstance.stop();
    } catch (err) {
      // ignore
    }
    globalVapiInstance = null;
  }
}

const useVapi = (options: UseVapiOptions = {}) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const vapiRef = useRef<any>(null);

  const initializeVapi = useCallback(() => {
    if (!globalVapiInstance) {
      globalVapiInstance = new Vapi(VAPI_API_KEY);
    }
    if (!vapiRef.current) {
      vapiRef.current = globalVapiInstance;
      if (!vapiRef.current._listenersSet) {
        vapiRef.current._listenersSet = true;
        vapiRef.current.on('call-start', () => setIsSessionActive(true));
        vapiRef.current.on('call-end', () => {
          setIsSessionActive(false);
          setTranscript("");
        });
        vapiRef.current.on('message', (message: any) => {
          if (message.type === 'transcript' && message.transcriptType === 'final' && message.role === 'user') {
            setTranscript((prev) => prev + '\n' + message.transcript);
            if (options.onUserTranscript) options.onUserTranscript(message.transcript);
            setConversationHistory(prev => [...prev, { role: 'user', content: message.transcript }]);
          }
          if (message.type === 'transcript' && message.transcriptType === 'final' && message.role === 'assistant') {
            if (options.onAIResponse) options.onAIResponse(message.transcript);
            setConversationHistory(prev => [...prev, { role: 'assistant', content: message.transcript }]);
          }
        });
        vapiRef.current.on('error', (e: Error) => {
          console.error('Vapi error:', e);
          if (e.message && e.message.includes('Duplicate DailyIframe')) {
            destroyVapiInstance();
            setTimeout(() => {
              vapiRef.current = null;
              initializeVapi();
            }, 1000);
          }
        });
      }
    }
  }, [options]);

  useEffect(() => {
    initializeVapi();
    return () => {
      vapiRef.current = null;
    };
  }, [initializeVapi]);

  // Helper to split instructions into steps and add 'Tell me when you are done...' after each
  function makeStepByStepInstructions(text: string) {
    // Try to split by numbered steps
    const stepRegex = /\d+\.\s+(.+?)(?=(?:\n\d+\.|$))/gs;
    const steps = [];
    let match;
    while ((match = stepRegex.exec(text)) !== null) {
      steps.push(match[1].trim());
    }
    if (steps.length === 0) return text; // fallback
    return steps.map((step, i) => `Step ${i + 1}: ${step}. Tell me when you are done, and I will continue to the next step.`).join(' ');
  }

  const speak = async (text: string) => {
    if (!vapiRef.current) return;
    if (isSessionActive) {
      // Don't start if already active
      return;
    }
    try {
      // Always stop before starting
      await vapiRef.current.stop();
      await new Promise(resolve => setTimeout(resolve, 500));
      const messages = [
        {
          role: "system" as const,
          content: `You are a helpful cooking assistant. You must only answer questions or engage in conversation related to cooking, recipes, food, ingredients, kitchen topics, or the current cooking process. You should also respond to greetings, confirmations (like "I'm ready", "next", "what's next", "go on", "repeat", "stop", etc.), and any conversational flow that helps the user cook or follow instructions. If the user asks about anything completely unrelated to cooking, food, or the current recipe process, politely reply: 'Sorry, I can only answer questions about cooking, food, or recipes.' Read the following instructions to the user in a clear, friendly, and detailed manner. For each step, say: 'Tell me when you are done, and I will continue to the next step.' Wait for the user to say they are done before continuing.`
        },
        ...conversationHistory,
        {
          role: "user" as const,
          content: makeStepByStepInstructions(text)
        }
      ];
      await vapiRef.current.start({
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          messages: messages
        },
        voice: {
          provider: "11labs",
          voiceId: "burt",
          speed: 0.85 // slower voice
        }
      });
    } catch (err) {
      console.error('Error starting Vapi session:', err);
      setIsSessionActive(false);
      if (err.message && err.message.includes('Duplicate DailyIframe')) {
        destroyVapiInstance();
        setTimeout(() => {
          vapiRef.current = null;
          initializeVapi();
        }, 1000);
      }
    }
  };

  const stop = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const addTextMessage = useCallback((message: string) => {
    setConversationHistory(prev => [...prev, { role: 'user', content: message }]);
  }, []);

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return { 
    isSessionActive, 
    transcript, 
    speak, 
    stop, 
    conversationHistory,
    addTextMessage,
    clearConversation
  };
};

export default useVapi; 