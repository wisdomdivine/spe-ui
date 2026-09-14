import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registrations for this event have closed." },
    { status: 403 }
  );
}
