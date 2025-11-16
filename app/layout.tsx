
// app/layout.tsx
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "Seaview Hotel",
  description: "AI Concierge demo",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
        {children}
        <ChatWidget /> {/* floating button in bottom-right */}
      </body>
    </html>
  );
}
