"use client";
import { type ChangeEventHandler } from "react";
import { useDictionary } from "./DictionaryProvider";

interface PasswordInputProps {
  handleChange?: ChangeEventHandler<any>;
  value?: string;
  label?: string;
  name?: string;
}

export default function PasswordInput({
  label = "Password",
  name = "password",
  handleChange,
  value,
}: PasswordInputProps) {
  const t = useDictionary()["Common"];

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {(t as any)[label]}
      </label>
      <div className="mt-1">
        <input
          id={name}
          name={name}
          type="password"
          autoComplete="current-password"
          onChange={handleChange}
          value={value}
          required
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}
