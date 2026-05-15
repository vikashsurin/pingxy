"use client";

import { IconCalendarTime, IconFiles, IconMessages } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import FeatureCard from "./FeatureCard";

export default function Home() {
  return (
    <>
      <div className="ggt h-screen">
        <section className="grid grid-cols-3 p-4 ">
          <div></div>
          <Image
            src="/logo.svg"
            alt="Logo"
            className="justify-self-center"
            width={156}
            height={72}
            priority
          />
          <div className="flex justify-end items-center gap-2">
            {/*<Link href="/auth/login">
              <span className="px-4 py-2  text-[#480000] hover:font-medium transition-all duration-300">Login</span>
            </Link>*/}
            <button className="bg-[#00FF1E] font-bold px-4 py-2 border border-[#480000] ios-modern-btn text-[#480000]  hover:brightness-110">
              <Link href="/auth/login">Get Started</Link>
            </button>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center p-32">
          <p className=" text-6xl  flex gap-2">
            <span className="font-semibold tracking-tighter">Connect .</span>
            <span className="font-semibold">Collaborate .</span>
            <span className="text-[#480000] font-black">Conquer .</span>
          </p>
          <p className="text-xl p-8">
            The high-performance communication platform for modern teams who
            move fast.
          </p>
          <CtaButton />
        </section>

        <section className="flex items-center justify-center gap-2">
          <FeatureCard
            icon={<IconMessages size={52} className="text-white" />}
            text="1-1 and Group Conversations"
          />

          <FeatureCard
            icon={<IconFiles size={52} className="text-white" />}
            text="File Sharing"
          />

          <FeatureCard
            icon={<IconCalendarTime size={52} className="text-white" />}
            text="Schedule Meetings"
          />
        </section>
      </div>
    </>
  );
}

function CtaButton() {
  return (
    <button className="ios-modern-btn bg-radial-[at_0%_0%] from-[#00FFA1] to-[#00FF1E]  text-2xl font-medium  px-16   w-125  py-5 rounded-sm   hover:from-[#00FFD9]  transition-all duration-500  outline-2 outline-gray-800 ">
      <Link href="/auth/login">Get Started</Link>
    </button>
  );
}
