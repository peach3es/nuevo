// lib/openalex.ts
import type { Paper } from "@/types/paper";

const OPENALEX_BASE = "https://api.openalex.org/works";

type OpenAlexWork = {
  id: string;
  display_name: string;
  publication_year?: number;
  doi?: string;
  ids?: { doi?: string };
  authorships?: { author?: { display_name?: string } }[];
  primary_location?: { source?: { display_name?: string } };
  abstract_inverted_index?: Record<string, number[]>;
};

/**
 * Rebuilds OpenAlex's abstract_inverted_index into a string.
 */
function rebuildAbstract(index: Record<string, number[]>): string {
  const positions: string[] = [];
  for (const [word, idxs] of Object.entries(index)) {
    idxs.forEach((i) => {
      positions[i] = word;
    });
  }
  return positions.join(" ");
}

/**
 * Searches OpenAlex for works matching the query and maps them to Paper[].
 */
export async function searchOpenAlex(
  query: string,
  perPage = 10
): Promise<Paper[]> {
  const url = `${OPENALEX_BASE}?search=${encodeURIComponent(
    query
  )}&per-page=${perPage}&sort=relevance_score:desc`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error("OpenAlex error:", res.status, await res.text());
    throw new Error("OpenAlex request failed");
  }

  const data = await res.json();

  const works: OpenAlexWork[] = data.results ?? [];

  const papers: Paper[] = works.map((work) => {
    const doiRaw = work.doi ?? work.ids?.doi;
    const doi = doiRaw
      ? doiRaw.replace(/^https?:\/\/doi.org\//i, "")
      : undefined;

    const urlFromDoi = doi ? `https://doi.org/${doi}` : undefined;

    const authors =
      (work.authorships ?? [])
        .map((a) => a.author?.display_name?.trim())
        // type guard: filter out undefined and tell TS it's now string[]
        .filter((name): name is string => Boolean(name)) ?? [];

    return {
      id: work.id,
      title: work.display_name,
      authors,
      year: work.publication_year,
      venue: work.primary_location?.source?.display_name,
      abstract: work.abstract_inverted_index
        ? rebuildAbstract(work.abstract_inverted_index)
        : undefined,
      doi,
      url: urlFromDoi ?? work.id,
    };
  });

  return papers;
}
