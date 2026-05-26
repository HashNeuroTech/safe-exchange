import { NextResponse } from "next/server";
import { getPlatformStatus } from "../../../../lib/exchange/store";

export async function GET() {
  return NextResponse.json({ ok: true, data: getPlatformStatus() });
}
