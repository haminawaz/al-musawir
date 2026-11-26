import { NextResponse } from "next/server";
import { snapshot } from "@/mock/db";

// Public and read-only: everything the website shows, in one response.
// This is the endpoint the website will read once it moves off its own data files.

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

export function GET() {
  return NextResponse.json({ data: snapshot() }, { headers });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
