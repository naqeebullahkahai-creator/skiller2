import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  className?: string;
  size?: number;
}

const VoiceSearchButton = ({ onResult, className, size = 20 }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Voice search is not supported in this browser.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Support multiple languages: Urdu, English, Hindi, Punjabi
    recognition.lang = "ur-PK"; // Primary: Urdu
    
    // Try to set multiple languages if supported
    try {
      // Some browsers support this
      (recognition as any).langs = ["ur-PK", "en-US", "hi-IN", "pa-PK"];
    } catch {}

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onResult(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast({ title: "Microphone Access Denied", description: "Please allow microphone access to use voice search.", variant: "destructive" });
      } else if (event.error !== "aborted") {
        toast({ title: "Voice Error", description: "Could not recognize speech. Please try again.", variant: "destructive" });
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [onResult, toast]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={isListening}
      className={cn(
        "p-2 rounded-full transition-all active:scale-90",
        isListening
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        className
      )}
      aria-label="Voice Search"
    >
      {isListening ? <MicOff size={size} /> : <Mic size={size} />}
    </button>
  );
};

export default VoiceSearchButton;
