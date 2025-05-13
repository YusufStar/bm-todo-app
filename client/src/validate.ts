import { z } from "zod";

export const emailSchema = z.string().trim().email().min(1).max(255)
export const passwordSchema = z.string().trim().min(6).max(255)
export const verificationCodeSchema = z.string().trim().min(1).max(255)

export const registerSchema = z.object({
    name: z.string().trim().min(1).max(255).regex(/^[a-zA-Z0-9 ]*$/, "Name can only contain letters, numbers, and spaces").optional(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
})

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

export const forgotPasswordSchema = z.object({
    email: emailSchema,
})

export const resetPasswordSchema = z.object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
})

export const verifyMFASchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

export const changePasswordSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
})

export const userUpdateSchema = z.object({
    name: z.string().trim().min(1).max(255).regex(/^[a-zA-Z0-9 ]*$/, "Name can only contain letters, numbers, and spaces"),
    avatar: z.string().optional(),
    department: z.string().trim().min(1).max(255),
})