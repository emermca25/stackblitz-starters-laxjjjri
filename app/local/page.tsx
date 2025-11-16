import { supabaseAdmin } from "@/lib/supabase";

export default async function Local() {
  const { data: hotel } = await supabaseAdmin.from("hotels").select("id").eq("slug", process.env.HOTEL_SLUG || "seaview").single();
  const { data: poi } = await supabaseAdmin.from("poi").select("id,title,category,description,affiliate_url,url,tags").eq("hotel_id", hotel!.id);
  return (
    <main className="p-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(poi||[]).map(p=> (
        <a key={p.id} href={(p.affiliate_url||p.url)||"#"} className="border rounded-xl p-4 block hover:shadow">
          <div className="font-semibold">{p.title}</div>
          <div className="text-xs text-gray-500">{p.category}</div>
          <p className="mt-2 text-sm">{p.description}</p>
          {p.tags && <div className="mt-2 text-xs opacity-70">{Array.isArray(p.tags)?p.tags.join(', '):p.tags}</div>}
          <div className="mt-3 text-blue-600 text-sm">Book / Learn more →</div>
        </a>
      ))}
    </main>
  );
}
