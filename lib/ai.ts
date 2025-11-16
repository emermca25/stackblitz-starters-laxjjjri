import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
export async function embed(text: string) {
  const r = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
  return r.data[0].embedding as number[];
}
