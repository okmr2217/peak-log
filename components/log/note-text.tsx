"use client";

import { splitTextWithUrls } from "@/lib/url-utils";

type Props = {
  text: string;
  singleLine?: boolean;
  className?: string;
};

export function NoteText({ text, singleLine = false, className }: Props) {
  const segments = splitTextWithUrls(text);

  const content = segments.map((segment, i) =>
    segment.type === "url" ? (
      <a
        key={i}
        href={segment.value}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[#00E5FF] underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        {segment.value}
      </a>
    ) : (
      <span key={i}>{segment.value}</span>
    )
  );

  if (singleLine) {
    return (
      <span className={`block overflow-hidden whitespace-nowrap text-ellipsis ${className ?? ""}`}>{content}</span>
    );
  }

  return <span className={`whitespace-pre-wrap ${className ?? ""}`}>{content}</span>;
}
