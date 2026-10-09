"use client";
import { useState } from "react";
import { primaryButton } from "@/components/ButtonLink";

export function Worksheet({title, lines}: {title: string; lines: string[]}): React.ReactElement {
  const fields = lines.filter(line => line.includes("____"));
  const example = lines.filter(line => !line.includes("____"));
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [notice, setNotice] = useState("");
  function save(): void {
    const text = [title, "", ...fields.map((line, i) => line.replace(/_{4,}/g, answers[i]?.trim() || "To complete"))].join("\n\n");
    const url = URL.createObjectURL(new Blob([text], {type: "text/plain;charset=utf-8"}));
    const link = document.createElement("a"); link.href = url; link.download = "vexa-worksheet.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Your worksheet download is ready. Your answers have not been sent to VEXA.");
  }
  return <section className="border-t border-vx-ink pt-6">
    <h2 className="font-text text-h3 font-semibold text-vx-ink">{title}</h2>
    <p className="mt-3 text-vx-ink-2">Fill this in for your own work, then save a text copy. Your answers stay on this page until you leave.</p>
    <div className="mt-6 space-y-5">
      {fields.map((line, i) => <label key={line} className="block font-medium">{line.replace(/:?\s*_{4,}/g, "")}<textarea rows={2} value={answers[i] || ""} onChange={e => setAnswers({...answers, [i]:e.target.value})} className="mt-2 block w-full border border-vx-hair bg-vx-white p-3 font-normal focus:outline-2 focus:outline-vx-accent-deep" /></label>)}
    </div>
    {fields.length ? <div className="mt-6"><button type="button" onClick={save} className={primaryButton}>Save my worksheet</button><p role="status" className="mt-3 text-small">{notice}</p></div> : null}
    {example.length ? <details className="mt-8 border border-vx-hair bg-vx-stone p-5"><summary className="cursor-pointer font-semibold">See the filled example</summary><ul className="mt-5 space-y-4 text-vx-ink-2">{example.map((line,i) => <li key={i}>{line}</li>)}</ul></details> : null}
  </section>;
}
