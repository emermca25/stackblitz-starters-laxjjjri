// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { openai } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { message, sessionId = "", hotelSlug = process.env.HOTEL_SLUG || "seaview" } =
    await req.json();

  // 1) Get hotel
  const { data: hotel, error: hotelError } = await supabaseAdmin
    .from("hotels")
    .select("id, name")
    .eq("slug", hotelSlug)
    .maybeSingle();

  if (hotelError) {
    console.error("Hotel error:", hotelError);
  }
  if (!hotel) {
    return NextResponse.json(
      { reply: "Sorry, I couldn't find this hotel in my database." },
      { status: 200 }
    );
  }

  // 2) Get POIs + FAQs to use as context (simple RAG-lite)
  const { data: poi } = await supabaseAdmin
    .from("poi")
    .select("title, category, description, affiliate_url, url, tags")
    .eq("hotel_id", hotel.id);

  const { data: faqs } = await supabaseAdmin
    .from("faqs")
    .select("q, a")
    .eq("hotel_id", hotel.id);

  const poiText = (poi ?? [])
    .map(
      (p) =>
        `- ${p.title} (${p.category}) – ${p.description}. Tags: ${
          Array.isArray(p.tags) ? p.tags.join(", ") : p.tags ?? ""
        }. Link: ${p.affiliate_url || p.url || ""}`
    )
    .join("\n");

  const faqText = (faqs ?? [])
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join("\n\n");

  const systemPrompt = `You are the AI concierge for ${hotel.name}.
You only answer questions about the hotel and its local area.
When recommending places, list 2–4 options with:
- **Name**
- 1 short reason
- A link if provided.

If you don't know something, say so briefly.`;

  const userPrompt = `Guest question: ${message}

Here is information about local places and FAQs:

Local places:
${poiText || "No POIs found"}

FAQs:
${faqText || "No FAQs found"}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const reply = completion.choices[0].message.content ?? "Sorry, I couldn't answer that.";

  // (Optional) you could log messages to Supabase here later using a messages table

  return NextResponse.json({ reply });
}
