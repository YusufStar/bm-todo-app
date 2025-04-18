"use server";

import { SignUpSchema, signUpSchema } from "@/types/forms";
import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcrypt";
export const registerAction = async (values: SignUpSchema): Promise<{ error?: string, success?: string }> => {
    const validatedFields = signUpSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email, password, confirmPassword, username} = validatedFields.data;
    
    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }
    
    const user = await getUserByEmail(email);

    if (user) {
        return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
        },
    });
    
    return { success: "Email sent!" };
};
