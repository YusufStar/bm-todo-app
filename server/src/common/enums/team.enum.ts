enum TeamStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PAUSED = 'paused',
    ARCHIVED = 'archived',
    DELETED = 'deleted',
}

enum TeamInviteStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
}

enum TeamMemberRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
    VIEWER = 'viewer',
}

enum TeamPlans {
    FREE = 'free', // max 5 members, max 1 project
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

export { TeamStatus, TeamInviteStatus, TeamMemberRole, TeamPlans};