import { api } from "encore.dev/api";

interface ReflectionPromptResponse {
  prompts: string[];
}

/**
 * Returns generic end-of-day reflection prompts.
 */
export const getReflectionPrompts = api<void, ReflectionPromptResponse>(
  { expose: true, method: "GET", path: "/reflection/prompts" },
  async () => {
    return {
      prompts: [
        "What is one highlight from today?",
        "Did anything challenge you?",
        "Name something you're grateful for.",
        "How did your mood shift today?",
      ],
    };
  },
);
