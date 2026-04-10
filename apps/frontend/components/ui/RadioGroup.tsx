export default function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: {
    id: string;
    name: string;
    value: string;
    defaultChecked?: boolean;
  }[];
}) {
  return (
    <label>
      {label && <span className="text-sm text-gray-500">{label}</span>}
      <div className="flex  items-center  gap-4 ">
        {options.map((option) => (
          <div key={option.id} className="flex gap-2 ">
            <input
              type="radio"
              id={option.id}
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange?.(option.value)}
            />
            <label htmlFor={option.id}>{option.name}</label>
          </div>
        ))}
      </div>
    </label>
  );
}
