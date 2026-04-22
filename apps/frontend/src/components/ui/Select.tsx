import useClickOutside from "@/src/hooks/useClickOutside";
import { ChevronsUpDown } from "lucide-react";
import { useRef, useState } from "react";

type Option = {
  key: string;
  name: string;
};

export default function CustomSelect({
  name,
  label,
  options,
  value, // Add this: The currently selected option from parent
  onChange,
}: {
  name: string;
  label: string;
  options: Option[];
  value?: Option; // The parent's state
  onChange?: (option: Option) => void;
}) {
  const selectRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(selectRef, () => setIsOpen(false));

  return (
    <div ref={selectRef} className=" w-full">
      <input type="hidden" name={name} value={value?.key} />
      <span className="text-sm text-gray-500 ">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="border border-gray-300 rounded py-1 px-2 w-full flex justify-between items-center"
        >
          {/* Use the prop value instead of local state */}
          {value?.name}
          <ChevronsUpDown size={14} />
        </button>

        {isOpen && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded bottom-full max-h-96 overflow-y-auto">
            {options.map((option) => (
              <li key={option.key}>
                <button
                  type="button"
                  onClick={() => {
                    onChange?.(option); // Tell parent to change state
                    setIsOpen(false);
                  }}
                  className={`py-2 px-4 text-left w-full ${value?.key === option.key ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {option.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
