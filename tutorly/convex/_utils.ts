import { Doc, Id } from "./_generated/dataModel";

export function now(): string {
  return new Date().toISOString();
}

export const assertDoc = <T>(doc: T | null): T => {
  if (!doc) throw new Error("Document not found");
  return doc;
};