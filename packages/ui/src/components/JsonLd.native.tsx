import React from "react";
import type { JsonLdProps } from "../types";

/**
 * No-op on native; JSON-LD is for web search results only.
 */
export function JsonLd(_props: JsonLdProps) {
  return null;
}
