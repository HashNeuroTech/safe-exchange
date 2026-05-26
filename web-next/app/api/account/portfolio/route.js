import { NextResponse } from "next/server";
import { getWalletAddressFromRequest } from "../../../../lib/auth/walletAuth";
import { getPortfolio } from "../../../../lib/exchange/store";

export async function GET(request) {
  const walletAddress = getWalletAddressFromRequest(request);
  const data = await getPortfolio(undefined, walletAddress);
  return NextResponse.json({ ok: true, data });
}
