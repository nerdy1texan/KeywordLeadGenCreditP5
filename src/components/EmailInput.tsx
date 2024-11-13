import { type ChangeEventHandler } from "react";
import { useDictionary } from "@/components/DictionaryProvider";

interface EmailInputProps {
  handleChange?: ChangeEventHandler<any>;
  value?: string;
  className?: string;
}

export default function EmailInput({
  handleChange,
  value,
  className,
}: EmailInputProps) {
  const t = useDictionary()["Common"];
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium">
        {t["Email address"]}
      </label>
      <div className="mt-1">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          onChange={handleChange}
          value={value}
          required
          className={className ? className : "input input-bordered w-full"}
        />
      </div>
    </div>
  );
}
