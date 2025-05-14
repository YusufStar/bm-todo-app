import { z } from "zod";
import { TeamInviteStatus, TeamMemberRole, TeamStatus } from "../enums/team.enum";

export const TeamSchema = z.object({
    name: z.string().min(1).max(100),
    logo: z.string(),
    status: z.nativeEnum(TeamStatus),
    members: z.array(z.object({
        userId: z.string(),
        role: z.nativeEnum(TeamMemberRole)
    })),
});

export const TeamInviteSchema = z.object({
    email: z.string().email(),
    role: z.nativeEnum(TeamMemberRole),
    teamId: z.string(),
    status: z.nativeEnum(TeamInviteStatus),
    expiresAt: z.date(),
});