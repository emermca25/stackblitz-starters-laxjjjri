import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { message, sessionId = "", hotelSlug = process.env.HOTEL_SLUG || "seaview" } = await req.json();

  const { data: hotel } = await (await supabaseAdmin
    .from("hotels").select("id,name").eq("slug", hotelSlug).single());
  if (!hotel) return new Response("Hotel not found", { status: 404 });

  // Get top-k matches via RPC
  const qEmb = (await openai.embeddings.create({ model: "text-embedding-3-small", input: message })).data[0].embedding as number[];
  const { data: matches, error } = await supabaseAdmin.rpc("match_kb_chunks", {
    p_hotel_id: hotel.id,
    p_query_embedding: qEmb,
    p_match_threshold: 0.3,
    p_match_count: 6
  });
  if (error) console.error(error);

  // Attach affiliate links for POIs
  const ids = (matches||[]).filter((m:any)=>m.source==='poi').map((m:any)=>m.source_id);
  let linkMap: Record<string,string|null> = {};
  if (ids.length) {
    const { data: pois } = await supabaseAdmin.from("poi").select("id, affiliate_url, url").in("id", ids);
    for (const p of pois||[]) linkMap[p.id] = p.affiliate_url || p.url || null;
  }

  const contextBlock = (matches||[]).map((m:any,i:number)=>{
    const link = m.source==='poi' && linkMap[m.source_id] ? ` [Link](${linkMap[m.source_id]})` : '';
    return `${i+1}. ${m.content}${link}`;
  }).join("\n");

  const system = `You are the AI concierge for ${hotel.name}. Keep answers concise. When recommending, list 2–4 options with bold name, one short reason, and a direct link (use affiliate links if present).`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Guest question: ${message}\n\nRelevant info:\n${contextBlock}` }
    ]
  });

  // Log messages
  await supabaseAdmin.from("messages").insert([
    { hotel_id: hotel.id, session_id: sessionId, role: 'user', content: message },
    { hotel_id: hotel.id, session_id: sessionId, role: 'assistant', content: chat.choices[0].message.content }
  ]);

  return Response.json({ reply: chat.choices[0].message.content });
}
