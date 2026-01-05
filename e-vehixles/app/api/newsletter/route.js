import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check if email already exists
    const existingSubscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json({ error: "Email already subscribed" }, { status: 409 });
    }

    // Create new subscriber
    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
      },
    });

    return NextResponse.json({ message: "Successfully subscribed!", subscriber }, { status: 201 });
  } catch (error) {
    console.error("Error creating newsletter subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}