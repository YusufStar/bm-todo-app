import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyMemberRole, InvitationStatus } from "@/types/forms";

export const getCompanyMembers = async (companyId: string) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("You are not authenticated");
  }

  const members = await prisma.companyMember.findMany({
    where: {
      companyId: companyId,
    },
  });

  if (!members) {
    return [];
  }

  const isMember = members.some((member) => member.userId === userId);

  if (!isMember) {
    throw new Error("You are not a member of this company");
  }

  return members;
};

export const inviteCompanyMember = async (companyId: string, email: string, expiresInDays: number = 7) => {
    const session = await auth()
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId) {
        throw new Error("You are not authenticated")
    }

    if (!userEmail) {
        throw new Error("User email not found")
    }

    const company = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    })
    
    if (!company) {
        throw new Error("Company not found")
    }

    const existingInvitation = await prisma.companyInvitation.findFirst({
        where: {
            companyId: companyId,
            invitedEmail: email,
            status: {
                not: InvitationStatus.CANCELLED
            }
        }
    })

    if (existingInvitation) {
        throw new Error("Invitation already sent")
    }

    // Set expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const invitation = await prisma.companyInvitation.create({
        data: {
            companyId: companyId,
            invitedEmail: email,
            senderEmail: userEmail,
            expiresAt
        }
    })

    return invitation
}

export const acceptCompanyInvitation = async (invitationId: string) => {
    const session = await auth()
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId) {
        throw new Error("You are not authenticated")
    }

    if (!userEmail) {
        throw new Error("User email not found")
    }

    const invitation = await prisma.companyInvitation.findUnique({
        where: {
            id: invitationId
        }
    })

    if (!invitation) {
        throw new Error("Invitation not found")
    }

    if (invitation.invitedEmail !== userEmail) {
        throw new Error("This invitation is not for you")
    }

    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`)
    }

    const company = await prisma.company.findUnique({
        where: {
            id: invitation.companyId
        }
    })

    if (!company) {
        throw new Error("Company not found")
    }
    
    const existingMember = await prisma.companyMember.findFirst({
        where: {
            companyId: invitation.companyId,
            userId: userId
        }
    })

    if (existingMember) {
        throw new Error("You are already a member of this company")
    }

    // Update invitation status
    await prisma.companyInvitation.update({
        where: {
            id: invitationId
        },
        data: {
            status: InvitationStatus.ACCEPTED,
            acceptedAt: new Date()
        }
    })

    // Create company member
    const member = await prisma.companyMember.create({
        data: {
            companyId: invitation.companyId,
            userId: userId,
            role: CompanyMemberRole.MEMBER
        }
    })

    return member
}

export const declineCompanyInvitation = async (invitationId: string) => {
    const session = await auth()
    const userEmail = session?.user?.email

    if (!userEmail) {
        throw new Error("You are not authenticated")
    }

    const invitation = await prisma.companyInvitation.findUnique({
        where: {
            id: invitationId
        }
    })

    if (!invitation) {
        throw new Error("Invitation not found")
    }

    if (invitation.invitedEmail !== userEmail) {
        throw new Error("This invitation is not for you")
    }

    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`)
    }

    // Update invitation status
    const updatedInvitation = await prisma.companyInvitation.update({
        where: {
            id: invitationId
        },
        data: {
            status: InvitationStatus.REJECTED,
            rejectedAt: new Date()
        }
    })

    return updatedInvitation
}

export const cancelCompanyInvitation = async (invitationId: string) => {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("You are not authenticated")
    }

    const invitation = await prisma.companyInvitation.findUnique({
        where: {
            id: invitationId
        }
    })

    if (!invitation) {
        throw new Error("Invitation not found")
    }

    // Check if user is company admin or owner
    const companyMember = await prisma.companyMember.findFirst({
        where: {
            companyId: invitation.companyId,
            userId: userId,
            role: {
                in: [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN]
            }
        }
    })

    if (!companyMember) {
        throw new Error("You don't have permission to cancel this invitation")
    }

    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`)
    }

    // Update invitation status
    const updatedInvitation = await prisma.companyInvitation.update({
        where: {
            id: invitationId
        },
        data: {
            status: InvitationStatus.CANCELLED,
            cancelledAt: new Date()
        }
    })

    return updatedInvitation
}

export const getCompanyInvitations = async (companyId: string) => {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("You are not authenticated")
    }

    // Check if user is company admin or owner
    const companyMember = await prisma.companyMember.findFirst({
        where: {
            companyId,
            userId,
            role: {
                in: [CompanyMemberRole.OWNER, CompanyMemberRole.ADMIN]
            }
        }
    })

    if (!companyMember) {
        throw new Error("You don't have permission to view company invitations")
    }

    const invitations = await prisma.companyInvitation.findMany({
        where: {
            companyId
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return invitations
}

export const getUserInvitations = async () => {
    const session = await auth()
    const userEmail = session?.user?.email

    if (!userEmail) {
        throw new Error("You are not authenticated")
    }

    const invitations = await prisma.companyInvitation.findMany({
        where: {
            invitedEmail: userEmail,
        },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return invitations
}

export const expireCompanyInvitation = async (invitationId: string) => {
    const invitation = await prisma.companyInvitation.findUnique({
        where: {
            id: invitationId
        }
    })

    if (!invitation) {
        throw new Error("Invitation not found")
    }

    if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`)
    }

    const updatedInvitation = await prisma.companyInvitation.update({
        where: {
            id: invitationId
        },
        data: {
            status: InvitationStatus.EXPIRED,
            expiredAt: new Date()
        }
    })

    return updatedInvitation
}

// Add a utility function to check for and expire invitations
export const checkAndExpireInvitations = async () => {
    const now = new Date()
    
    // Find all pending invitations that have expired
    const expiredInvitations = await prisma.companyInvitation.findMany({
        where: {
            status: InvitationStatus.PENDING,
            expiresAt: {
                lt: now
            }
        }
    })
    
    if (expiredInvitations.length === 0) {
        return { expiredCount: 0 }
    }
    
    // Update all expired invitations
    await prisma.companyInvitation.updateMany({
        where: {
            id: {
                in: expiredInvitations.map(inv => inv.id)
            }
        },
        data: {
            status: InvitationStatus.EXPIRED,
            expiredAt: now
        }
    })
    
    return { 
        expiredCount: expiredInvitations.length,
        expiredIds: expiredInvitations.map(inv => inv.id)
    }
}