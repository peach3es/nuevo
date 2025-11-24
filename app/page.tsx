"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check } from "lucide-react";

import type { Paper } from "@/types/paper";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setPapers([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Search failed");
      }

      const data = (await res.json()) as { papers: Paper[] };
      setPapers(data.papers || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      // you could add a toast later
    } catch {
      // ignore for now
    }
  }

  function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500); // back to copy after 1.5s
      } catch (e) {
        console.error("Failed to copy", e);
      }
    };

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute right-2 top-2 h-7 w-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">
          {copied ? "Copied to clipboard" : "Copy to clipboard"}
        </span>
      </Button>
    );
  }

  const skeletonItems = Array.from({ length: 3 });

  return (
    <div className="min-h-screen bg-[#faf7ef] text-slate-900 flex flex-col">
      {/* Top nav */}
      <header className="border-b border-slate-200/60 bg-[#faf7ef]/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 text-xs font-semibold">
              in
            </span>
            <span className="font-semibold tracking-tight">Nuevo</span>
          </div>
          <span className="text-xs text-slate-500">
            AI-powered research helper • v1.0.0
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-10">
          {/* Hero */}
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Real research papers. Clean summaries. Instant citations.
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-6">
              Type what you&apos;re researching and Inflo will pull real papers
              from scholarly databases, summarize them based on their abstracts,
              and give you ready-to-paste citations.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mt-2 flex flex-col gap-3 md:flex-row md:items-center"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. two-phase immersion cooling for AI data centers"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm md:text-base shadow-sm outline-none ring-0 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
                ⌘K
              </span>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-2xl h-full bg-slate-900 px-5 py-3 text-sm font-medium text-[#faf7ef] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Searching…" : "Search papers"}
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {!isLoading && !error && papers.length === 0 && (
            <p className="mt-8 text-sm text-slate-500">
              No results yet. Try a topic like{" "}
              <span className="font-medium">“battery thermal management”</span>{" "}
              or{" "}
              <span className="font-medium">
                “LLM hallucination evaluation.”
              </span>
            </p>
          )}
        </section>

        {/* Results */}
        {(isLoading || papers.length > 0) && (
          <section className="border-t border-slate-200/70 bg-white/60">
            <div className="mx-auto max-w-5xl px-4 py-8">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  {isLoading ? "Searching..." : `Results (${papers.length})`}
                </h2>
                <p className="text-xs text-slate-500">
                  Summaries are based on abstracts, not full papers.
                </p>
              </div>

              <div className="space-y-5">
                {isLoading &&
                  skeletonItems.map((_, idx) => (
                    <article
                      key={`skeleton-${idx}`}
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 md:px-5 md:py-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-40 rounded-full" />
                      </div>
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-11/12" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                      <div className="mt-4 rounded-xl px-3 py-3 bg-slate-100 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </article>
                  ))}

                {!isLoading &&
                  papers.map((paper) => (
                    <article
                      key={paper.id}
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 md:px-5 md:py-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <a
                            href={paper.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-base md:text-lg font-semibold tracking-tight hover:underline"
                          >
                            {paper.title || "Untitled paper"}
                          </a>
                          <p className="mt-1 text-xs text-slate-600">
                            {paper.authors.join(", ") || "Unknown authors"}
                            {paper.year && (
                              <>
                                , <span>{paper.year}</span>
                              </>
                            )}
                            {paper.venue && (
                              <>
                                {" "}
                                | <span className="italic">{paper.venue}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-1 inline-flex items-center shrink-0 rounded-full border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500"
                        >
                          Abstract-based summary
                        </Badge>
                      </div>

                      {paper.summary && (
                        <p className="mt-3 text-sm text-slate-700 leading-relaxed text-left">
                          {paper.summary}
                        </p>
                      )}

                      {(paper.apaCitation || paper.bibtexCitation) && (
                        <Accordion
                          type="single"
                          collapsible
                          className="mt-4 rounded-xl px-3 bg-slate-100"
                        >
                          <AccordionItem value={`citations-${paper.id}`}>
                            <AccordionTrigger className="text-xs font-semibold text-slate-700 px-0 items-center">
                              <span className="leading-none text-sm">
                                Citations
                              </span>
                              <span className="ml-auto mr-1 text-[11px] font-normal text-slate-500 leading-none">
                                Expand
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 text-xs">
                                {paper.apaCitation && (
                                  <div>
                                    <div className="relative">
                                      <div className="rounded-md bg-white px-3 py-2 text-[11px] leading-relaxed pr-10">
                                        <div className="mb-1 flex items-center justify-between">
                                          <span className="font-semibold text-xs">
                                            APA
                                          </span>
                                        </div>
                                        {paper.apaCitation}
                                      </div>
                                      <CopyButton value={paper.apaCitation!} />
                                    </div>
                                  </div>
                                )}

                                {paper.bibtexCitation && (
                                  <div>
                                    <div className="relative">
                                      <pre className="rounded-md bg-white px-3 py-2 text-[11px] leading-relaxed overflow-x-auto pr-10">
                                        <div className="mb-1 flex items-center justify-between">
                                          <span className="font-semibold text-xs">
                                            BibTeX
                                          </span>
                                        </div>
                                        {paper.bibtexCitation}
                                      </pre>
                                      <CopyButton
                                        value={paper.bibtexCitation!}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </article>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-[#faf7ef]">
        <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>Built with Next.js + OpenAlex.</span>
          <span>
            Summaries may be imperfect, always read the original paper.
          </span>
        </div>
      </footer>
    </div>
  );
}
