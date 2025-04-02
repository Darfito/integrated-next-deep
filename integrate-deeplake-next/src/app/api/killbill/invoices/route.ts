"use server";

import {
  createInvoice,
  getInvoice,
  getInvoicesByAccount,
} from "@/app/lib/killbill";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const invoice = await createInvoice(accountId);
    return NextResponse.json(invoice, { status: 201 });
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
    const invoiceId = searchParams.get("invoiceId");
    const accountId = searchParams.get("accountId");

    if (invoiceId) {
      const invoice = await getInvoice(invoiceId);
      return NextResponse.json(invoice);
    } else if (accountId) {
      const invoices = await getInvoicesByAccount(accountId);
      return NextResponse.json(invoices);
    } else {
      return NextResponse.json(
        { error: "Invoice ID or Account ID is required" },
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
