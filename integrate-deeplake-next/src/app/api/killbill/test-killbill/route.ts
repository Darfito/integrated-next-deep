import killbillClient from "@/app/lib/killbill";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await killbillClient.get("/1.0/kb/test/clock");
    return NextResponse.json({ status: "success", data: response.data });
  } catch (error) {
    console.error("Failed to connect to Kill Bill:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to connect to Kill Bill" },
      { status: 500 }
    );
  }
}
