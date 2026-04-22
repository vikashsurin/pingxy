export default function Button({
  label,
  onClick,
  type = "button",
  disabled = false,
}: {
  label: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      disabled={disabled}
    >
      {label}
    </button>
  );
}
