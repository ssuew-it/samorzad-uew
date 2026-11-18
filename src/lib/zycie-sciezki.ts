import { studentLifeSources } from "@/lib/living-documents";

/**
 * Dopasowanie ścieżek na stronie Życie studenckie: pytania i ścieżki z tagami.
 * Bez ikon - dane czyta też serwer (liczba ścieżek w opisie źródła), a ikony
 * dokłada wyspa ZycieDopasowanie.
 */
export type AnswerKey = "goal" | "pace" | "mode" | "start";
export type PathKey = "samorzad" | "organisations" | "circles" | "sport" | "choir" | "mobility" | "dthub" | "career" | "kafe";

export interface StudentPath {
  key: PathKey;
  href: string;
  tags: string[];
}

export const questions: Array<{ key: AnswerKey; options: string[] }> = [
  { key: "goal", options: ["relationships", "expertise", "career", "world", "expression", "impact"] },
  { key: "pace", options: ["weekly", "project", "flexible"] },
  { key: "mode", options: ["lead", "build", "perform", "compete", "support"] },
  { key: "start", options: ["zero", "ready"] },
];

export const paths: StudentPath[] = [
  // Samorząd Studentów - brakował w dopasowaniu (1.11.2026); prowadzi do naborów na stronie.
  { key: "samorzad", href: "/rekrutacja", tags: ["impact", "relationships", "project", "lead", "support", "zero"] },
  { key: "organisations", href: studentLifeSources.organisations, tags: ["relationships", "impact", "weekly", "project", "lead", "build", "support", "zero"] },
  { key: "circles", href: studentLifeSources.organisations, tags: ["expertise", "career", "weekly", "project", "build", "zero"] },
  { key: "sport", href: studentLifeSources.sport, tags: ["relationships", "expression", "weekly", "compete", "ready"] },
  { key: "choir", href: studentLifeSources.choir, tags: ["relationships", "expression", "weekly", "perform", "zero"] },
  { key: "mobility", href: studentLifeSources.mobility, tags: ["world", "expertise", "project", "flexible", "ready"] },
  { key: "dthub", href: studentLifeSources.dtHub, tags: ["expertise", "career", "impact", "project", "build", "zero"] },
  { key: "career", href: studentLifeSources.career, tags: ["career", "expertise", "flexible", "project", "support", "zero"] },
  { key: "kafe", href: studentLifeSources.kafe, tags: ["career", "expertise", "impact", "weekly", "project", "build", "zero"] },
];
