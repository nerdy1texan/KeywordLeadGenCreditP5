// src/components/ui/switch.tsx

import { Switch as HeadlessSwitch } from "@headlessui/react";

export function Switch({ checked, onChange, className }: { checked: boolean; onChange: () => void; className?: string }) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className={`${className} ${
        checked ? "bg-blue-600" : "bg-gray-200"
      } relative inline-flex h-6 w-11 items-center rounded-full`}
    >
      <span
        className={`${
          checked ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform bg-white rounded-full transition`}
      />
    </HeadlessSwitch>
  );
} 