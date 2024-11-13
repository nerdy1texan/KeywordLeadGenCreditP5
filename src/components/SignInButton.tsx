import Image from "next/image";

export default function SignInButton({
  className,
  onClick,
  disabled,
  text,
  icon,
}: {
  className: string;
  onClick: () => void;
  disabled: boolean;
  text: string;
  icon: string;
}) {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      disabled={disabled}
      className={`btn relative flex items-center justify-start px-0 text-white ${className}`}
    >
      <Image
        width={20}
        height={20}
        className="mx-4 shrink-0"
        src={icon}
        alt="Sign in"
      />
      <span
        className="mr-4 flex h-6 items-center border-r border-white border-opacity-25"
        aria-hidden="true"
      ></span>
      <span className="-ml-16 flex-auto truncate pl-16 pr-8">{text}</span>
    </button>
  );
}
