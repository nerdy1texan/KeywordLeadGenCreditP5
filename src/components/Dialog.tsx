import { Dialog as HeadlessUIDialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

export default function Dialog({
  isOpen,
  title,
  content,
  action,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode | string;
  content: ReactNode | string;
  action: ReactNode | string;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessUIDialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-base-300/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessUIDialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                <HeadlessUIDialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-base-content"
                >
                  {title}
                </HeadlessUIDialog.Title>
                <div className="mt-2">
                  {typeof content == "string" ? (
                    <p className="text-sm text-base-content/80">{content}</p>
                  ) : (
                    content
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  {typeof action == "string" ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm font-medium"
                      onClick={onClose}
                    >
                      {action}
                    </button>
                  ) : (
                    action
                  )}
                </div>
              </HeadlessUIDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessUIDialog>
    </Transition>
  );
}
