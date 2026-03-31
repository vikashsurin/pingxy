"use client"; // Required to use usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();

  // This checks if the current URL matches the link's destination
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-4 py-2 transition-colors ${
        isActive
          ? "bg-gray-200 text-gray-900"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}
