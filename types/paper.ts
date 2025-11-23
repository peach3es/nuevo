export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  abstract?: string;
  doi?: string;
  url?: string;
  summary?: string; // LLM-generated
  apaCitation?: string; // to be filled by citation helpers
  bibtexCitation?: string; // to be filled by citation helpers
}
