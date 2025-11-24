import OpenAI from "openai";

export const groq = new OpenAI({
  apiKey: process.env.LLM_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});
