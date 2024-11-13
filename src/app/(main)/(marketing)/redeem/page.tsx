"use client";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { useDictionary } from "@/components/DictionaryProvider";
import { ActivationInputs } from "@/components/ActivationInputs";

export default function Redeem() {
  const t = useDictionary()["Common"];

  return (
    <div className="flex justify-center py-36 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-lg justify-center px-3 lg:px-10">
        <RainbowWrapper>
          <div className="w-full rounded-3xl bg-base-100 p-10">
            <div className="mb-6 flex flex-row items-center justify-between sm:mx-auto sm:w-full sm:max-w-md">
              <h4 className="h4">{(t as any)["Redeem Code"]}</h4>
            </div>
            <ActivationInputs />
          </div>
        </RainbowWrapper>
      </div>
    </div>
  );
}
