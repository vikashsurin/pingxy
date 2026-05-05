import { Field, FieldError, FieldLabel } from "@/components/ui/field";

// Reusable wrapper
export function LabeledField({
  label,
  name,
  isInvalid,
  errors,
  children,
}: {
  label: string;
  name: string;
  isInvalid: boolean;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
