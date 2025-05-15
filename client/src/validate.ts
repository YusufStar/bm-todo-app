import { z } from "zod";
import { LucideIcons } from "./lib/icon-lib";

export const emailSchema = z.string().trim().email().min(1).max(255)
export const passwordSchema = z.string().trim().min(6).max(255)
export const verificationCodeSchema = z.string().trim().min(1).max(255)

export enum TeamStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PAUSED = 'paused',
    ARCHIVED = 'archived',
    DELETED = 'deleted',
}

export enum TeamInviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
}

export enum TeamMemberRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
    VIEWER = 'viewer',
}

export enum TeamPlans {
    FREE = 'free', // max 5 members, max 1 project
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

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

export const CreateTeamSchema = z.object({
    name: z.string().min(1).max(100),
    logo: z.string(),
    status: z.nativeEnum(TeamStatus),
    members: z.array(z.object({
        userId: z.string(),
        role: z.nativeEnum(TeamMemberRole)
    })),
});