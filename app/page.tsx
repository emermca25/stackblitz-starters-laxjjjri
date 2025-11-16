import { supabaseAdmin } from "@/lib/supabase";

export default async function Home() {
  const slug = process.env.HOTEL_SLUG || "seaview";

  const {
    data: hotel,
    error: hotelError,
  } = await supabaseAdmin
    .from("hotels")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle(); // doesn't throw if not found

  if (hotelError) {
    console.error("Hotel query error:", hotelError);
  }

  if (!hotel) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-semibold">No hotel found</h1>
          <p className="text-sm text-slate-600">
            I couldn&apos;t find a hotel with slug <code>{slug}</code>.
            Check your Supabase data or the <code>HOTEL_SLUG</code> env var.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: poi,
    error: poiError,
  } = await supabaseAdmin
    .from("poi")
    .select("id, title, category, description, affiliate_url, url, tags")
    .eq("hotel_id", hotel.id);

  if (poiError) {
    console.error("POI query error:", poiError);
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{hotel.name} – Local Area</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hand-picked places near the hotel.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(poi ?? []).map((p: any) => (
        <a
        key={p.id}
        href={(p.affiliate_url || p.url) || "#"}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
      >
        <div className="font-semibold">{p.title}</div>
      
        <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
          {p.category}
        </div>
      
        <p className="mt-2 text-sm text-slate-700">{p.description}</p>
      
        {p.tags && (
          <div className="mt-2 text-xs text-slate-500">
            {Array.isArray(p.tags) ? p.tags.join(", ") : p.tags}
          </div>
        )}
      
        <div className="mt-3 text-sm text-blue-600">
          Book / Learn more →
        </div>
      </a>
      
        ))}
      </section>
    </main>
  );
}
