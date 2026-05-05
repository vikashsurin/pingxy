import { Input } from "@/components/ui/input";
import { LabeledField } from "./LabeledField";

export function TextFormField({
  form,
  name,
  label,
  placeholder,
  type = "text",
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <form.Field name={name}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <LabeledField label={label} name={field.name} isInvalid={isInvalid} errors={field.state.meta.errors}>
            <Input
              id={field.name}
              name={field.name}
              type={type}
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(type === "number" ? Number(e.target.value) : e.target.value)
              }
              placeholder={placeholder}
            />
          </LabeledField>
        );
      }}
    </form.Field>
  );
}
