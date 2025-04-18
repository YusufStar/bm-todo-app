"use server";

import { SignInSchema, signInSchema } from "@/types/forms";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcrypt";

export const signInAction = async (values: SignInSchema): Promise<{ error?: string, success?: string }> => {
    const validatedFields = signInSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }
    
    const { email, password } = validatedFields.data;

    const user = await getUserByEmail(email);

    if (!user) {
        return { error: "User not found" };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        return { error: "Invalid password" };
    }

    return { success: "Signed in successfully" };
    
};
