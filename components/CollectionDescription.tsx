"use client";
import { useState } from "react";

const LIMIT = 350;

export default function CollectionDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > LIMIT;

  return (
    <p className="text-zinc-500 text-sm leading-7 max-w-md group-hover:text-zinc-300 transition-colors duration-500 relative z-10 font-normal">
      {long && !expanded ? text.slice(0, LIMIT).trimEnd() + "…" : text}
      {long && (
        <button
          onClick={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
          className="ml-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors duration-200 whitespace-nowrap"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </p>
  );
}
