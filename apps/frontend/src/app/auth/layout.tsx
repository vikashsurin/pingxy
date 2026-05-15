"use client";
import Image from "next/image";
import TabButton from "./components/TabButton";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <section className="min-h-screen grid grid-cols-2  justify-center p-12 ">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={360}
        height={144}
        priority
        className="justify-self-center"
        onClick={(e) => {
          e.preventDefault();
          router.push("/");
        }}
      />
      <div className="mb-8 flex flex-col items-center">
        <nav className="flex gap-1 bg-radial from-gray-200 to-gray-50 p-2 rounded-md mb-8">
          <TabButton href="/auth/login" label="Login" />
          <TabButton href="/auth/register" label="Register" />
        </nav>
        <div className="w-full max-w-md px-4">{children}</div>
      </div>
    </section>
  );
}
