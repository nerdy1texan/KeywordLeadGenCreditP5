"use client";
import { type ChangeEventHandler } from "react";
import { useDictionary } from "@/components/DictionaryProvider";

interface NameInputProps {
  handleChange?: ChangeEventHandler<any>;
  value?: string;
}

export default function NameInput({ handleChange, value }: NameInputProps) {
  const t = useDictionary()["Common"];
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium">
        {t["Your name"]}
      </label>
      <div className="mt-1">
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          onChange={handleChange}
          value={value}
          required
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}
