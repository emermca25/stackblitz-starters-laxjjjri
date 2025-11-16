"use client";
import { useState, useRef } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role:"user"|"assistant"; content:string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = typeof window !== "undefined" ? (localStorage.sessionId ||= crypto.randomUUID()) : "";

  async function send() {
    const content = inputRef.current?.value?.trim();
    if (!content) return;
    setMessages(m => [...m, { role: "user", content }]);
    inputRef.current!.value = "";
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content, sessionId })
    }).then(r => r.json());
    setMessages(m => [...m, { role: "assistant", content: r.reply }]);
  }

  return (
    <>
      <button onClick={() => setOpen(v=>!v)} className="fixed bottom-4 right-4 rounded-full px-4 py-2 shadow border bg-white">
        {open ? "Close Concierge" : "Chat with concierge"}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 w-96 max-w-[95vw] h-96 bg-white border rounded-xl shadow flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b font-semibold">Seaview Concierge</div>
          <div className="flex-1 p-3 space-y-3 overflow-auto text-sm">
            {messages.map((m,i)=> (
              <div key={i} className={m.role==="user"?"text-right":"text-left"}>
                <div className={`inline-block px-3 py-2 rounded-lg whitespace-pre-wrap ${m.role==="user"?"bg-gray-100":"bg-gray-50"}`}
                  dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, "<br/>") }} />
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input ref={inputRef} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about food, sights…" className="flex-1 border rounded px-3 py-2" />
            <button onClick={send} className="px-3 py-2 border rounded">Send</button>
          </div>
        </div>
      )}
    </>
  );
}
