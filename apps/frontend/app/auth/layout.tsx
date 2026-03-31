// auth/layout.tsx
import Image from "next/image";
import CustomLink from "./components/CustomLink";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center pt-12">
      <header className="mb-8 flex flex-col items-center">
        <Image src="/logo.svg" alt="Logo" width={360} height={144} priority />

        <nav
          className="mt-6 flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200"
          role="tablist"
        >
          <CustomLink href="/auth/login" label="Login" />
          <CustomLink href="/auth/register" label="Register" />
          <CustomLink href="/auth/guest" label="Guest" />
        </nav>
      </header>

      <main className="w-full max-w-md px-4">{children}</main>
    </div>
  );
}
