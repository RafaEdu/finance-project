import React from "react";
import { Controller } from "react-hook-form";
import FormField from "./FormField";

// Liga um campo do react-hook-form ao FormField. `transformValue` permite
// formatar o texto antes de gravar (ex.: máscara de moeda).
export default function ControlledFormField({
  control,
  name,
  transformValue,
  ...fieldProps
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <FormField
          {...fieldProps}
          value={value ?? ""}
          onBlur={onBlur}
          onChangeText={
            transformValue ? (text) => onChange(transformValue(text)) : onChange
          }
          error={error?.message}
        />
      )}
    />
  );
}
