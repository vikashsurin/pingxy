import { IconMessagesFilled } from "@tabler/icons-react";

export default function Page() {
  return (
    <div
      className="h-screen p-2 flex flex-col items-center justify-center bg-gray-50 polka"
    >
      <IconMessagesFilled className="text-gray-500" size={44} />
      <p className="px-2  text-gray-600">
        Select a conversation
      </p>
    </div >
  );
}
