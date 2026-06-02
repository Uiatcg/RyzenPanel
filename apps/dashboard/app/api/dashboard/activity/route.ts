import { NextResponse } from "next/server";
import { getActivity } from "@/src/lib/dashboard";

export async function GET() {
  const data = await getActivity();
  return NextResponse.json(data);
}
