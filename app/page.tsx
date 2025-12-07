// app/admin/signup/page.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return setError(error.message);

    const userId = data.user?.id;
    if (!userId) return;

    await supabase.from("hotels").insert({
      user_id: userId,
      name: hotelName,
      postcode,
    });

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Create Hotel Account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Hotel Name</label>
            <input
              type="text"
              placeholder="e.g. Seaview Hotel"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Postcode</label>
            <input
              type="text"
              placeholder="e.g. BN1 1AA"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Sign Up
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
