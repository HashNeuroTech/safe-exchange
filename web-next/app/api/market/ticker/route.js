import { NextResponse } from "next/server";
import { getTicker, getTickers } from "../../../../lib/exchange/market";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const data = symbol ? await getTicker(symbol) : await getTickers();

  return NextResponse.json({ ok: true, data });
}
