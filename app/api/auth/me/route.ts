import { meAction } from "@/actions/auth/me";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await meAction();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 