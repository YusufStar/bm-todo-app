import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { User } from "@prisma/client";

export const meAction = async (): Promise<User | null> => {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const user = await getUserById(session.user.id);
    
    if (!user) {
        return null;
    }

    return {
        ...user,
        password: "",
    } as User;
};