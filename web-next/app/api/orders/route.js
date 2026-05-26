import { NextResponse } from "next/server";
import { getWalletAddressFromRequest } from "../../../lib/auth/walletAuth";
import { listOrders, placeOrder } from "../../../lib/exchange/store";

export async function GET(request) {
  const walletAddress = getWalletAddressFromRequest(request);
  const accountId = walletAddress ? `wallet:${walletAddress.toLowerCase()}` : undefined;
  return NextResponse.json({ ok: true, data: listOrders(accountId) });
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON", message: "请求体不是有效 JSON。" },
      { status: 400 }
    );
  }

  const walletAddress = getWalletAddressFromRequest(request);
  const result = await placeOrder(body, undefined, walletAddress);

  if (!result.ok) {
    return NextResponse.json(result, { status: result.status ?? 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
