import { z } from "zod";

export const userUpdateSchema = z.object({
    name: z.string().trim().min(1).max(255).regex(/^[a-zA-Z0-9 ]*$/, "Name can only contain letters, numbers, and spaces").optional(),
    avatar: z.string(),
    department: z.string().trim().min(1).max(255).optional(),
})