import { z } from "zod";
import { emailSchema } from "./auth.validator";

export const mfaCodeSchema = z.string().trim().min(1).max(6);

export const verifyMfaSchema = z.object({
    code: mfaCodeSchema,
    secretKey: z.string().trim().min(1),
})

export const verifyMfaForLoginSchema = z.object({
    code: mfaCodeSchema,
    email: emailSchema,
    userAgent: z.string().optional(),
})