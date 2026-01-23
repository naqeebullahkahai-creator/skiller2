import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/hooks/useNotifications";

export interface ProductQuestion {
  id: string;
  product_id: string;
  customer_id: string;
  seller_id: string;
  question_text: string;
  answer_text: string | null;
  status: "pending" | "answered" | "rejected";
  is_visible: boolean;
  asked_at: string;
  answered_at: string | null;
  created_at: string;
  customer_name?: string;
  product_title?: string;
}

// Mask username for privacy (e.g., "Ahmed Khan" -> "Ahmed K.")
export const maskUserName = (name: string): string => {
  if (!name) return "Anonymous";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1, 3) + "***";
  }
  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase() + ".";
  return `${firstName} ${lastInitial}`;
};

// Hook for product detail page - fetch public Q&A
export const useProductQuestions = (productId: string | undefined) => {
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const fetchQuestions = useCallback(async () => {
    if (!productId) {
      setQuestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch answered questions + user's own pending questions
      const { data, error } = await supabase
        .from("product_questions")
        .select(`
          *,
          profiles:customer_id (full_name)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedQuestions: ProductQuestion[] = (data || []).map((q: any) => ({
        id: q.id,
        product_id: q.product_id,
        customer_id: q.customer_id,
        seller_id: q.seller_id,
        question_text: q.question_text,
        answer_text: q.answer_text,
        status: q.status,
        is_visible: q.is_visible,
        asked_at: q.asked_at,
        answered_at: q.answered_at,
        created_at: q.created_at,
        customer_name: q.profiles?.full_name || "Anonymous",
      }));

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Filter questions by search query
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(query) ||
      (q.answer_text?.toLowerCase().includes(query) || false)
    );
  });

  return {
    questions: filteredQuestions,
    allQuestions: questions,
    isLoading,
    searchQuery,
    setSearchQuery,
    refetch: fetchQuestions,
  };
};

// Hook for posting a question
export const useAskQuestion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const askQuestion = async (
    productId: string,
    sellerId: string,
    questionText: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to ask a question",
        variant: "destructive",
      });
      return false;
    }

    if (!questionText.trim()) {
      toast({
        title: "Empty Question",
        description: "Please enter your question",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("product_questions").insert({
        product_id: productId,
        customer_id: user.id,
        seller_id: sellerId,
        question_text: questionText.trim(),
      });

      if (error) throw error;

      toast({
        title: "Question Submitted! ✓",
        description: "The seller will be notified and can answer your question.",
      });

      return true;
    } catch (error: any) {
      console.error("Error posting question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit question",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { askQuestion, isSubmitting };
};

// Hook for seller dashboard - manage Q&A
export const useSellerQuestions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("pending");

  const fetchQuestions = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      let query = supabase
        .from("product_questions")
        .select(`
          *,
          profiles:customer_id (full_name),
          products:product_id (title)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedQuestions: ProductQuestion[] = (data || []).map((q: any) => ({
        id: q.id,
        product_id: q.product_id,
        customer_id: q.customer_id,
        seller_id: q.seller_id,
        question_text: q.question_text,
        answer_text: q.answer_text,
        status: q.status,
        is_visible: q.is_visible,
        asked_at: q.asked_at,
        answered_at: q.answered_at,
        created_at: q.created_at,
        customer_name: q.profiles?.full_name || "Anonymous",
        product_title: q.products?.title || "Unknown Product",
      }));

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error("Error fetching seller questions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const answerQuestion = async (
    questionId: string,
    answerText: string,
    customerId: string,
    productTitle: string
  ): Promise<boolean> => {
    if (!answerText.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please enter your answer",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("product_questions")
        .update({
          answer_text: answerText.trim(),
          status: "answered",
          answered_at: new Date().toISOString(),
        })
        .eq("id", questionId);

      if (error) throw error;

      // Send notification to customer
      await createNotification(
        customerId,
        "Your Question Was Answered! 💬",
        `Your question about "${productTitle}" has been answered by the seller.`,
        "order",
        `/product/${productTitle.toLowerCase().replace(/\s+/g, "-")}`
      );

      toast({
        title: "Answer Submitted! ✓",
        description: "The customer will be notified.",
      });

      fetchQuestions();
      return true;
    } catch (error: any) {
      console.error("Error answering question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
      return false;
    }
  };

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  return {
    questions,
    isLoading,
    filter,
    setFilter,
    answerQuestion,
    refetch: fetchQuestions,
    pendingCount,
  };
};

// Hook for admin moderation
export const useAdminQAModeration = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllQuestions = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("product_questions")
        .select(`
          *,
          profiles:customer_id (full_name),
          products:product_id (title)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const mappedQuestions: ProductQuestion[] = (data || []).map((q: any) => ({
        id: q.id,
        product_id: q.product_id,
        customer_id: q.customer_id,
        seller_id: q.seller_id,
        question_text: q.question_text,
        answer_text: q.answer_text,
        status: q.status,
        is_visible: q.is_visible,
        asked_at: q.asked_at,
        answered_at: q.answered_at,
        created_at: q.created_at,
        customer_name: q.profiles?.full_name || "Anonymous",
        product_title: q.products?.title || "Unknown Product",
      }));

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error("Error fetching all questions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllQuestions();
  }, [fetchAllQuestions]);

  const toggleVisibility = async (questionId: string, isVisible: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("product_questions")
        .update({ is_visible: isVisible })
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: isVisible ? "Question Visible" : "Question Hidden",
        description: isVisible 
          ? "The Q&A is now visible on the product page" 
          : "The Q&A has been hidden from the product page",
      });

      fetchAllQuestions();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update visibility",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteQuestion = async (questionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("product_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Question Deleted",
        description: "The Q&A has been permanently removed",
      });

      fetchAllQuestions();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    questions,
    isLoading,
    toggleVisibility,
    deleteQuestion,
    refetch: fetchAllQuestions,
  };
};
