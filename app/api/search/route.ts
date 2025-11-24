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
    const papersWithCitationsAndSummaries: any[] = [];

    for (const paper of basePapers) {
      const enriched = await enrichPaperWithSummary(paper);
      papersWithCitationsAndSummaries.push(enriched);
    }

    return NextResponse.json({ papers: papersWithCitationsAndSummaries });
  } catch (err) {
    console.error("Error in /api/search:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

///HELPER FUNCTIONS
async function enrichPaperWithSummary(paper: any) {
  const apaCitation = formatApa(paper);
  const bibtexCitation = formatBibtex(paper);

  const abstract = (paper.abstract && paper.abstract.toString().trim()) || "";

  let summary: string | null = null;

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

      const llmText = completion.choices[0]?.message?.content?.trim() ?? "";

      summary = llmText || null;
    } catch (err) {
      console.error(
        "Error generating summary for paper",
        paper.id ?? paper.doi ?? "",
        err
      );
      summary = null;
    }
  } else {
    summary = "No abstract found in the paper metadata.";
  }

  return {
    ...paper,
    apaCitation,
    bibtexCitation,
    summary,
  };
}
