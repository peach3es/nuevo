// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchOpenAlex } from "@/lib/openalex";
import { formatApa, formatBibtex } from "@/lib/citations";
import { groq } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = (body.query || "").toString().trim();

    if (!query) {
      return NextResponse.json(
        { error: "Missing 'query' in request body." },
        { status: 400 }
      );
    }

    // 1. Fetch candidate papers from OpenAlex
    const basePapers = await searchOpenAlex(query, 8); // top 8 for now

    // 2. Attach citations + abstract-based summaries
    const papersWithCitationsAndSummaries = await Promise.all(
      basePapers.map(async (paper: any) => {
        const apaCitation = formatApa(paper);
        const bibtexCitation = formatBibtex(paper);

        // Try to get an abstract string (depends on how you shaped the OpenAlex result)
        const abstract =
          (paper.abstract && paper.abstract.toString().trim()) || "";

        let summary: string | null = null;

        // Only try to summarize if we have a non-trivial abstract
        if (abstract.length > 40) {
          try {
            const completion = await groq.chat.completions.create({
              model: "llama-3.1-8b-instant",
              messages: [
                {
                  role: "system",
                  content:
                    "You summarize research paper ABSTRACTS. You MUST use only information explicitly present in the abstract. Do NOT invent methods, results, numbers, or conclusions. If something is not mentioned in the abstract, say that it is not specified. Write 2–3 clear sentences for a general research audience.",
                },
                {
                  role: "user",
                  content: `Summarize the following research paper based ONLY on its abstract. Do not add any information that is not literally supported by the abstract. If the abstract is empty or unclear, say: 'No reliable abstract-based summary is possible.' Abstract: """${abstract}"""`,
                },
              ],
              temperature: 0.2,
            });

            const llmText =
              completion.choices[0]?.message?.content?.trim() ?? "";

            summary = llmText || null;
          } catch (err) {
            console.error(
              "Error generating summary for paper",
              paper.id ?? paper.doi ?? "",
              err
            );
            summary = null; // fallback – we still return the paper
          }
        } else {
          // No usable abstract
          summary = "No abstract found in the paper metadata.";
        }

        return {
          ...paper,
          apaCitation,
          bibtexCitation,
          summary, // abstract-based summary or null
        };
      })
    );

    return NextResponse.json({ papers: papersWithCitationsAndSummaries });
  } catch (err) {
    console.error("Error in /api/search:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
