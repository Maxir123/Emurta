import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    
    const existingUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    return existingUser;
  } catch (error) {
    console.error("checkUser error:", error);
    return null;
  }
};
