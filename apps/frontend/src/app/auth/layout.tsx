"use client";
import Image from "next/image";
import TabButton from "./components/TabButton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen flex flex-col items-center pt-12">
      <div className="mb-8 flex flex-col items-center">
        <Image src="/logo.svg" alt="Logo" width={360} height={144} priority />

        <nav className="flex gap-1 bg-radial from-gray-200 to-gray-50 p-2 rounded-md mb-8">
          <TabButton href="/auth/login" label="Login" />
          <TabButton href="/auth/register" label="Register" />
          <TabButton href="/auth/guest" label="Guest" />
        </nav>
      </div>

      <div className="w-full max-w-md px-4">{children}</div>
    </section>
  );
}
