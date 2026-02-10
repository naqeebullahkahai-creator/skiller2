import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatbotFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const useChatbotFAQs = () => {
  return useQuery({
    queryKey: ["chatbot-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_faqs")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as ChatbotFAQ[];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 min
  });
};

// Simple keyword matching bot - no AI needed, trained for FANZON only
export const findBotAnswer = (
  query: string,
  faqs: ChatbotFAQ[]
): { answer: string; question: string; category: string } | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Score each FAQ based on keyword matches
  let bestMatch: ChatbotFAQ | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    
    // Check keyword matches
    for (const keyword of faq.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    
    // Check question similarity
    const questionWords = faq.question.toLowerCase().split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    for (const qWord of queryWords) {
      if (qWord.length < 3) continue;
      for (const fWord of questionWords) {
        if (fWord.includes(qWord) || qWord.includes(fWord)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return {
      answer: bestMatch.answer,
      question: bestMatch.question,
      category: bestMatch.category,
    };
  }

  return null;
};
