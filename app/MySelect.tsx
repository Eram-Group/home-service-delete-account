import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MySelect({
  value,
  onChange,
  placeholder,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  options: { value: string; label: React.ReactNode }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] min-h-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
