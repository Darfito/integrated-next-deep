"use server";

import {
  createSubscription,
  getSubscription,
  getSubscriptionsByAccount,
} from "@/app/lib/killbill";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accountId, subscriptionData } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const subscription = await createSubscription(accountId, subscriptionData);
    return NextResponse.json(subscription, { status: 201 });
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
    const subscriptionId = searchParams.get("subscriptionId");
    const accountId = searchParams.get("accountId");

    if (subscriptionId) {
      const subscription = await getSubscription(subscriptionId);
      return NextResponse.json(subscription);
    } else if (accountId) {
      const subscriptions = await getSubscriptionsByAccount(accountId);
      return NextResponse.json(subscriptions);
    } else {
      return NextResponse.json(
        { error: "Subscription ID or Account ID is required" },
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
