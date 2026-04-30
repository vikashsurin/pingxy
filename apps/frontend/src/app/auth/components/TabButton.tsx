"use client"; // Required to use usePathname

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();

  const isActive = pathname === href;
  return (
    <Link href={href}>
      <Button
        variant={"ghost"}
        className={`rounded-sm hover:bg-white ${isActive ? "bg-gray-800  hover:bg-white  text-white" : ""}`}
      >
        {label}
      </Button>
    </Link>
  );
}
