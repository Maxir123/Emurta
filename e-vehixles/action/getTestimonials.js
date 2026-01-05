// app/actions/getTestimonials.ts
"use server";

import { db } from "@/lib/prisma";

export async function getTestimonials() {
  return await db.testimonial.findMany({
    take: 3, // only 3 testimonials
    orderBy: {
      createdAt: "desc", // latest first
    },
  });
}
