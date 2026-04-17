export default function JoinViaInvite() {
  return (
    <div>
      <p className="font-bold mb-1">Join via invite code</p>
      <form action="" className="flex gap-2">
        <input
          type="text"
          name="invite-code"
          placeholder="Enter invite code"
          className="border px-2 py-1 rounded border-gray-300"
        />
        <button
          type="button"
          className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-500 transition-colors active:bg-blue-700"
        >
          Join
        </button>
      </form>
    </div>
  );
}
