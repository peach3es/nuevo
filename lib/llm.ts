import OpenAI from "openai";

const llmApiKey = process.env.LLM_API_KEY;
if (!llmApiKey) {
  throw new Error("Environment variable LLM_API_KEY is not set. Please set it to your API key.");
}

export const groq = new OpenAI({
  apiKey: llmApiKey,
  baseURL: "https://api.groq.com/openai/v1",
});
