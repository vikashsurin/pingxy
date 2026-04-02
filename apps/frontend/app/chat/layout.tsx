import Link from "next/link";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav className="flex gap-2">
        <Link href="/">Home</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/about">About</Link>
        <Link href="/chat/settings">Settings</Link>
      </nav>
      <div>{children}</div>
    </section>
  );
}
