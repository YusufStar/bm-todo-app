import { z } from "zod";

export const emailSchema = z.string().trim().email().min(1).max(255)
export const passwordSchema = z.string().trim().min(6).max(255)
export const verificationCodeSchema = z.string().trim().min(1).max(255)

export const registerSchema = z.object({
    name: z.string().trim().min(1).max(255),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    userAgent: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
})

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    userAgent: z.string().optional()
})

export const verificationEmailSchema = z.object({
    code: verificationCodeSchema
})

export const resetPasswordSchema = z.object({
    password: passwordSchema,
    verificationCode: verificationCodeSchema,
})

export const changePasswordSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
})