// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchOpenAlex } from "@/lib/openalex";
import { formatApa, formatBibtex } from "@/lib/citations";

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

    const papersWithCitations = basePapers.map((paper) => {
      const apaCitation = formatApa(paper);
      const bibtexCitation = formatBibtex(paper);

      return {
        ...paper,
        apaCitation,
        bibtexCitation,
      };
    });

    return NextResponse.json({ papers: papersWithCitations });
  } catch (err) {
    console.error("Error in /api/search:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
