import { useState } from "react";

/**
 * Custom hook for Google Gemini API integration for AI-based candidate filtering
 */
export const useAIFiltering = () => {
  const [isAIMode, setIsAIMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAPIKey = (apiKey) => {
    if (!apiKey) {
      setError("Please add your API key to use AI mode");
      return false;
    }
    clearError();
    return true;
  };

  const processAIPrompt = async (prompt, apiKey) => {
    if (!prompt.trim()) return null;

    if (!apiKey) {
      setError("Please provide a Google Gemini API key to use AI search");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Google Gemini API with the correct model name
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful assistant for filtering job candidates. 

Given this natural language query: "${prompt}"

Extract relevant filter criteria and return ONLY a valid JSON object with the following possible keys:
- "locations": array of strings (e.g., ["New York", "San Francisco"])
- "skills": array of strings (e.g., ["JavaScript", "React"])
- "educationLevel": string (one of: "High School", "Bachelor's Degree", "Master's Degree", "PhD")
- "experienceLevel": string (one of: "Junior", "Mid-level", "Senior")
- "salaryExpectation": string (one of: "$0 - $50k", "$50k - $100k", "$100k - $150k", "$150k - $200k", "$200k - $250k", "$250k+")
- "workAvailability": string (one of: "full-time", "part-time", "contract", "internship")

Only include keys that are explicitly mentioned or strongly implied in the query. 
Return empty object {} if no clear filters can be extracted.
Do not include any explanation, just the JSON.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific error types
        if (response.status === 429) {
          setError(
            "API quota exceeded. Please try again later or check your billing."
          );
          return null;
        }

        if (response.status === 401 || response.status === 403) {
          setError("Invalid API key. Please check your Google Gemini API key.");
          return null;
        }

        setError(
          `API Error: ${errorData.error?.message || "Unknown error occurred"}`
        );
        return null;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!content) {
        setError("No response received from AI. Please try again.");
        return null;
      }

      // Parse the JSON response
      try {
        // Remove any markdown code block markers if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        const filters = JSON.parse(cleanContent);
        return filters;
      } catch {
        setError(
          "AI returned invalid response. Please try rephrasing your query."
        );
        return null;
      }
    } catch (error) {
      console.error("AI filtering error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isAIMode,
    setIsAIMode,
    isLoading,
    error,
    clearError,
    processAIPrompt,
    checkAPIKey,
  };
};
