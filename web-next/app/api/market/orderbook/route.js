import { NextResponse } from "next/server";
import { getOrderBook } from "../../../../lib/exchange/market";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "BTC/USDT";
  const levels = searchParams.get("levels") ?? "14";
  const data = await getOrderBook(symbol, levels);

  return NextResponse.json({ ok: true, data });
}
