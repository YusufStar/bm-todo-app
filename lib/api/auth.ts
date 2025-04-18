import { User } from "@prisma/client";
/**
 * Fetch current user data
 */
export const fetchCurrentUser = async (): Promise<User | null | string> => {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Important for authentication
      credentials: "include",
    });

    const data = await response.json();

    if (data.error === "Unauthorized") {
      return data.error as string;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
