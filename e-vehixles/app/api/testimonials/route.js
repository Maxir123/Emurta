// app/api/testimonials/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
// ... existing imports ...

// Handle GET requests
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
export async function POST(req) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quote } = body;

    if (!quote || typeof quote !== "string" || quote.trim() === "") {
      return NextResponse.json({ error: "Missing testimonial (quote)" }, { status: 400 });
    }

    // Upsert local user
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    
    const localUser = await db.user.upsert({
      where: { clerkUserId: clerkUser.id },
      update: {
        fullName: clerkUser.fullName,
        email: email,
      },
      create: {
        clerkUserId: clerkUser.id,
        email: email,
        fullName: clerkUser.fullName,
      },
    });

    // Create testimonial with correct userId type
    const created = await db.testimonial.create({
      data: {
        name: clerkUser.fullName,
        quote: quote.trim(),
        rating: 5, // Default rating
        imageUrl: clerkUser.imageUrl,
        userId: localUser.id, // Use the integer ID from local user
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}