import type { User } from "@prisma/client";
import clsx from "clsx";

export default function Avatar({
  user,
  className,
}: {
  user: User;
  className?: string;
}) {
  const colors = [
    "#00AA55",
    "#009FD4",
    "#B381B3",
    "#939393",
    "#E3BC00",
    "#D47500",
    "#DC2A2A",
  ];

  const numberFromText = (text: string) => {
    return parseInt(
      text
        .split("")
        .map((char) => char.charCodeAt(0))
        .join(""),
      10
    );
  };

  const twoLettersFromText = (text?: string) => {
    if (!text || text.length < 2) {
      return "PR";
    }

    const sections = text.split(" ");
    if (sections.length == 1) {
      return text.substring(0, 2);
    }

    return sections.map((t) => t.charAt(0)).join("");
  };

  const twoLetters = twoLettersFromText(user.name ?? "NA");
  const color = colors[numberFromText(twoLetters) % colors.length];

  return user.image ? (
    <img
      className={clsx("rounded-full", className)}
      src={user.image}
      alt="Avatar"
    />
  ) : (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full text-sm font-semibold text-white shadow-lg",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {twoLetters}
    </div>
  );
}
