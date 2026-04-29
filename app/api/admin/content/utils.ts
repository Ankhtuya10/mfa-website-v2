import { NextResponse } from "next/server";
import { CouchDbError } from "@/lib/couchdb/client";

export const adminJsonError = (error: unknown, fallback = "Admin content request failed") => {
  const status = error instanceof CouchDbError ? error.status : 500;
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status });
};
