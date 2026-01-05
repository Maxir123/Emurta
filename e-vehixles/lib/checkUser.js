// lib/check-user.ts
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    // find user in DB
    let existingUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // if not found, create them
    if (!existingUser) {
      existingUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? "",
          fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        },
      });
      console.log("New user created in DB:", existingUser.id);
    }

    return existingUser;
  } catch (error) {
    console.error("checkUser error:", error);
    return null;
  }
};
