import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex gap-2">
          <Link href="/">Home</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/about">About</Link>
          <Link href="/chat/settings">Settings</Link>
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}
