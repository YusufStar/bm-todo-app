"use server";

import { 
  getCompanyMembers, 
  inviteCompanyMember,
  acceptCompanyInvitation,
  declineCompanyInvitation,
  cancelCompanyInvitation,
  getCompanyInvitations,
  getUserInvitations
} from './company';
import { CompanyMemberRole } from '@/types/forms';
import { prisma } from '@/lib/prisma';

export const getCompanyMembersAction = async (companyId: string) => {
  try {
    const members = await getCompanyMembers(companyId);
    
    // Add user details for each member
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await prisma.user.findUnique({
          where: { id: member.userId },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true
          }
        });
        
        return {
          ...member,
          user
        };
      })
    );
    
    return {
      success: true,
      members: membersWithUsers
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch company members'
    };
  }
};

export const updateMemberRoleAction = async (memberId: string, role: CompanyMemberRole, userId: string) => {
  try {
    if (!userId) {
      throw new Error('You must be logged in');
    }

    // Get the member to update
    const member = await prisma.companyMember.findUnique({
      where: { id: memberId },
      include: {
        company: {
          select: {
            ownerId: true
          }
        }
      }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Check if current user is company owner
    if (member.company.ownerId !== userId) {
      // If not owner, check if user is an admin
      const currentUserMember = await prisma.companyMember.findFirst({
        where: {
          companyId: member.companyId,
          userId: userId,
          role: CompanyMemberRole.ADMIN
        }
      });

      if (!currentUserMember) {
        throw new Error('You do not have permission to change member roles');
      }
    }

    // Update the member role
    const updatedMember = await prisma.companyMember.update({
      where: { id: memberId },
      data: { role }
    });

    return {
      success: true,
      member: updatedMember
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update member role'
    };
  }
};

export const removeMemberAction = async (memberId: string, userId: string) => {
  try {
    if (!userId) {
      throw new Error('You must be logged in');
    }

    // Get the member to remove
    const member = await prisma.companyMember.findUnique({
      where: { id: memberId },
      include: {
        company: {
          select: {
            ownerId: true
          }
        }
      }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Cannot remove the owner
    if (member.userId === member.company.ownerId) {
      throw new Error('Cannot remove the company owner');
    }

    // Check if current user is company owner or the member themselves
    if (member.company.ownerId !== userId && member.userId !== userId) {
      // If not owner, check if user is an admin
      const currentUserMember = await prisma.companyMember.findFirst({
        where: {
          companyId: member.companyId,
          userId: userId,
          role: CompanyMemberRole.ADMIN
        }
      });

      if (!currentUserMember) {
        throw new Error('You do not have permission to remove members');
      }
    }

    // Remove the member
    await prisma.companyMember.delete({
      where: { id: memberId }
    });

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove member'
    };
  }
};

export const inviteCompanyMemberAction = async (
  companyId: string, 
  email: string, 
  role: CompanyMemberRole = CompanyMemberRole.MEMBER,
  expiresInDays: number = 7
) => {
  try {
    const invitation = await inviteCompanyMember(companyId, email, expiresInDays);
    
    return {
      success: true,
      invitation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    };
  }
};

export const acceptCompanyInvitationAction = async (invitationId: string) => {
  try {
    const member = await acceptCompanyInvitation(invitationId);
    
    return {
      success: true,
      member
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept invitation'
    };
  }
};

export const declineCompanyInvitationAction = async (invitationId: string) => {
  try {
    const invitation = await declineCompanyInvitation(invitationId);
    
    return {
      success: true,
      invitation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decline invitation'
    };
  }
};

export const cancelCompanyInvitationAction = async (invitationId: string) => {
  try {
    const invitation = await cancelCompanyInvitation(invitationId);
    
    return {
      success: true,
      invitation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel invitation'
    };
  }
};

export const getCompanyInvitationsAction = async (companyId: string) => {
  try {
    const invitations = await getCompanyInvitations(companyId);
    
    return {
      success: true,
      invitations
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get company invitations'
    };
  }
};

export const getUserInvitationsAction = async () => {
  try {
    const invitations = await getUserInvitations();
    
    return {
      success: true,
      invitations
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user invitations'
    };
  }
}; 