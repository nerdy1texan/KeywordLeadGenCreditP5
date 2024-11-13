import { type ReactNode } from "react";

interface SectionHeaderProps {
  tag?: string;
  title?: string | ReactNode;
  description: string | ReactNode;
}

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
      {typeof props.title == "string" ? (
        <h2 className="h2 mb-4">{props.title}</h2>
      ) : (
        props.title
      )}
      {typeof props.description == "string" ? (
        <p className="text-xl text-gray-500" data-aos="fade-up">
          {props.description}
        </p>
      ) : (
        props.description
      )}
    </div>
  );
}
