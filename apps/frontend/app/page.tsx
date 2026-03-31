import Link from "next/link";


export default function Home() {
  return (
    <div>
      <Link href="/auth/login">Login</Link>
      <Link href="/chat">Register</Link>
    </div>
  );
}
