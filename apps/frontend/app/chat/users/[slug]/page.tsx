"use client";

import { use, useEffect } from "react";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [type: string]: string | string[] | undefined }>;
}) {
  const { slug } = use(params);
  const { type } = use(searchParams);

  useEffect(() => {});

  return (
    <div className="bg-amber-400 p-4">
      <h1>User ID: {slug}</h1>
    </div>
  );
}
