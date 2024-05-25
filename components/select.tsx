"use client";

import { useMemo } from "react";
import { SingleValue } from "react-select";
import CreateableSelect from "react-select/creatable";

type Props = {
  value?: string | null | undefined;
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
};

export const Select = ({
  value,
  onChange,
  onCreate,
  options = [],
  disabled,
  placeholder,
}: Props) => {
  const selectOptions = useMemo(
    () =>
      (options ?? []).map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [options]
  );

  return (
    <CreateableSelect
      className="text-sm h-10"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#e2e8f0",
          ":hover": {
            borderColor: "#e2e8f0",
          },
        }),
      }}
      value={selectOptions.find((option) => option.value === value)}
      onChange={(value: SingleValue<{ label: string; value: string }>) =>
        onChange(value?.value)
      }
      onCreateOption={(value: string) => {
        onCreate?.(value);
        onChange(value);
      }}
      isDisabled={disabled}
      placeholder={placeholder}
      options={selectOptions}
    />
  );
};
