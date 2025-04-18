"use server";

import { SignInSchema, signInSchema } from "@/types/forms";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

export const signInAction = async (values: SignInSchema): Promise<{ error?: string, success?: string, warning?: string }> => {
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

    // if (!user.emailVerified) {
    //     return { warning: "Please verify your email" };
    // }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: "Something went wrong" };
            }
        }

        throw error;
    }

    return { success: "Signed in successfully" };
};
