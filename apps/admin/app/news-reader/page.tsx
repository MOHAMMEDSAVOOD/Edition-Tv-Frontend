import React from "react";
import { NewsReaderClient } from "@/components/news-reader/NewsReaderClient";

export const metadata = {
  title: "News Feed Reader & Wire Inbox | Edition TV Admin",
  description: "Editorial RSS reader and wire stream inbox for Edition TV Admin Control Platform.",
};

export default function NewsReaderPage() {
  return (
    <div className="w-full h-full bg-slate-950 flex flex-col overflow-hidden">
      <NewsReaderClient />
    </div>
  );
}
