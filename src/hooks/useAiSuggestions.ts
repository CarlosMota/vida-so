import { useState } from "react";
import { suggestChefWithAi } from "@/lib/ai";

export function useAiSuggestions() {
  const [loading, setLoading] = useState(false);

  async function suggestChef(input: {
    location: string;
    peopleCount: number;
    eventType?: string;
    dietaryPreferences?: string[];
    budget?: number;
    desiredDate?: string;
  }) {
    setLoading(true);
    try {
      return await suggestChefWithAi(input);
    } finally {
      setLoading(false);
    }
  }

  return { loading, suggestChef };
}

