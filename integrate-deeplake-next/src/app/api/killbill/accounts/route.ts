"use server";

import {
  createAccount,
  getAccount,
  searchAccountByEmail,
} from "@/app/lib/killbill";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const accountData = await request.json();
    const account = await createAccount(accountData);
    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    console.error("Kill Bill API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");
    const email = searchParams.get("email");

    if (accountId) {
      const account = await getAccount(accountId);
      return NextResponse.json(account);
    } else if (email) {
      const accounts = await searchAccountByEmail(email);
      return NextResponse.json(accounts);
    } else {
      return NextResponse.json(
        { error: "Account ID or email is required" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("Kill Bill API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
