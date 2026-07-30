"use client";

import { useLanguageContext } from "@/context/LanguageContext";
import en from "./en.json";
import rw from "./rw.json";
import fr from "./fr.json";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : string };
type Translations = typeof en;

const dictionaries: Record<string, DeepPartial<Translations>> = { en, rw, fr };

function get(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

export function useTranslations(namespace?: string) {
  const { language } = useLanguageContext();
  const dict = (dictionaries[language] ?? dictionaries.en) as Record<string, unknown>;

  return function t(key: string): string {
    const full = namespace ? `${namespace}.${key}` : key;
    const val = get(dict, full);
    if (val === full) {
      return get(dictionaries.en as Record<string, unknown>, full);
    }
    return val;
  };
}
