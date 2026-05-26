import { NextResponse } from "next/server";
import { getCandles } from "../../../../lib/exchange/market";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "BTC/USDT";
  const interval = searchParams.get("interval") ?? "1m";
  const limit = searchParams.get("limit") ?? "80";
  const data = await getCandles(symbol, interval, limit);

  return NextResponse.json({ ok: true, data });
}
