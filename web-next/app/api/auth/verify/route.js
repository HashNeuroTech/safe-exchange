import { NextResponse } from "next/server";
import { verifyWalletSignature } from "../../../../lib/auth/walletAuth";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ ok: false, error: "INVALID_JSON", message: "请求体不是有效 JSON。" }, { status: 400 });
  }

  const result = verifyWalletSignature(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 401 });
}
