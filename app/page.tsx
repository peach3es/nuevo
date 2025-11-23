"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
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
        {papers.length > 0 && (
          <section className="border-t border-slate-200/70 bg-white/60">
            <div className="mx-auto max-w-5xl px-4 py-8">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  Results ({papers.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Summaries are based on abstracts, not full papers.
                </p>
              </div>

              <div className="space-y-5">
                {papers.map((paper) => (
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
                              {" "}
                              · <span>{paper.year}</span>
                            </>
                          )}
                          {paper.venue && (
                            <>
                              {" "}
                              · <span className="italic">{paper.venue}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <span className="mt-1 inline-flex h-6 items-center rounded-full border border-slate-200 px-2 text-[11px] uppercase tracking-wide text-slate-500 bg-slate-50">
                        Abstract-based summary
                      </span>
                    </div>

                    {paper.summary && (
                      <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                        {paper.summary}
                      </p>
                    )}

                    {/* Citations */}
                    <details className="mt-4 group">
                      <summary className="cursor-pointer text-xs font-medium text-slate-700 flex items-center gap-1">
                        <span className="group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                        Citations
                      </summary>
                      <div className="mt-2 space-y-3 text-xs">
                        {paper.apaCitation && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-semibold">APA</span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(paper.apaCitation!)
                                }
                                className="text-[11px] text-slate-500 hover:text-slate-800"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed">
                              {paper.apaCitation}
                            </p>
                          </div>
                        )}
                        {paper.bibtexCitation && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-semibold">BibTeX</span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(paper.bibtexCitation!)
                                }
                                className="text-[11px] text-slate-500 hover:text-slate-800"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed overflow-x-auto">
                              {paper.bibtexCitation}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
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
