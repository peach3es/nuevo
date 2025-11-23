import type { Paper } from "@/types/paper";

function formatAuthorsInline(authors: string[]): string {
  if (authors.length === 0) return "";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
}

export function formatApa(paper: Paper): string {
  const authors = formatAuthorsInline(paper.authors);
  const year = paper.year ? `(${paper.year}).` : "(n.d.).";
  const title = paper.title ?? "[No title]";
  const venue = paper.venue ? ` ${paper.venue}` : "";
  const doi = paper.doi
    ? ` https://doi.org/${paper.doi}`
    : paper.url
    ? ` ${paper.url}`
    : "";

  return `${authors} ${year} ${title}.${venue}${doi}`;
}

export function formatBibtex(paper: Paper): string {
  const keyBase =
    (paper.authors[0]?.split(" ").slice(-1)[0] || "key") + (paper.year ?? "");
  const key = keyBase.replace(/[^a-zA-Z0-9]/g, "");

  const lines = [
    `@article{${key},`,
    `  title   = {${paper.title || ""}},`,
    paper.authors.length ? `  author  = {${paper.authors.join(" and ")}},` : "",
    paper.venue ? `  journal = {${paper.venue}},` : "",
    paper.year ? `  year    = {${paper.year}},` : "",
    paper.doi ? `  doi     = {${paper.doi}},` : "",
    paper.url ? `  url     = {${paper.url}},` : "",
    "}",
  ].filter(Boolean);

  return lines.join("\n");
}
