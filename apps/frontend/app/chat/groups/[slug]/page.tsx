import { use } from "react";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    [type: string]: string | string[] | undefined;
    name: string;
  }>;
}) {
  const { slug } = use(params);
  const { type, name } = use(searchParams);

  return (
    <div
      id={slug}
      className="m-2 border  p-2 rounded-lg border-gray-300 bg-gray-100"
    >
      <h1 className="px-2 text-gray-400">{name}</h1>
    </div>
  );
}
