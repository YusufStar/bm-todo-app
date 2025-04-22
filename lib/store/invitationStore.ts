import { create } from 'zustand';
import { addToast } from '@heroui/react';
import { useCompanyStore } from './companyStore';
import { 
  getCompanyInvitationsAction,
  getUserInvitationsAction,
  inviteCompanyMemberAction,
  acceptCompanyInvitationAction,
  declineCompanyInvitationAction,
  cancelCompanyInvitationAction
} from '@/actions/member/actions';
import { CompanyMemberRole, InvitationStatus } from '@/types/forms';

export interface CompanyInvitation {
  id: string;
  companyId: string;
  senderEmail: string;
  invitedEmail: string;
  role: CompanyMemberRole;
  status: InvitationStatus;
  message?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  expiredAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
}

interface InvitationState {
  // Data
  companyInvitations: CompanyInvitation[];
  userInvitations: CompanyInvitation[];
  
  // UI state
  isLoading: boolean;
  isLoadingUser: boolean;
  isError: boolean;
  error: string | null;
  
  // Action states
  isInviting: boolean;
  isAccepting: boolean;
  isDeclining: boolean;
  isCancelling: boolean;
  
  // Actions
  fetchCompanyInvitations: () => Promise<void>;
  fetchUserInvitations: () => Promise<void>;
  inviteMember: (email: string, role?: CompanyMemberRole, expiresInDays?: number) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
}

export const useInvitationStore = create<InvitationState>((set, get) => ({
  // Data state
  companyInvitations: [],
  userInvitations: [],
  
  // UI state
  isLoading: false,
  isLoadingUser: false,
  isError: false,
  error: null,
  
  // Action states
  isInviting: false,
  isAccepting: false,
  isDeclining: false,
  isCancelling: false,
  
  // Fetch company invitations
  fetchCompanyInvitations: async () => {
    const companyId = useCompanyStore.getState().selectedCompanyId;
    
    if (!companyId) {
      set({
        companyInvitations: [],
        isLoading: false,
        isError: true,
        error: 'No company selected'
      });
      return;
    }
    
    set({ isLoading: true, isError: false, error: null });
    
    try {
      const result = await getCompanyInvitationsAction(companyId);
      
      if (result.success) {
        set({
          companyInvitations: result.invitations as CompanyInvitation[],
          isLoading: false
        });
      } else {
        set({
          isLoading: false,
          isError: true,
          error: result.error || 'Failed to fetch invitations'
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  
  // Fetch user invitations
  fetchUserInvitations: async () => {
    set({ isLoadingUser: true, isError: false, error: null });
    
    try {
      const result = await getUserInvitationsAction();
      
      if (result.success) {
        set({
          userInvitations: result.invitations as CompanyInvitation[],
          isLoadingUser: false
        });
      } else {
        set({
          isLoadingUser: false,
          isError: true,
          error: result.error || 'Failed to fetch user invitations'
        });
      }
    } catch (error) {
      set({
        isLoadingUser: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  
  // Invite a new member
  inviteMember: async (email: string, role = CompanyMemberRole.MEMBER, expiresInDays = 7) => {
    const companyId = useCompanyStore.getState().selectedCompanyId;
    
    if (!companyId) {
      addToast({
        title: 'Error',
        description: 'No company selected',
        color: 'danger',
      });
      return;
    }
    
    set({ isInviting: true });
    
    try {
      const result = await inviteCompanyMemberAction(companyId, email, role, expiresInDays);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Invitation sent successfully',
          color: 'success',
        });
        // Refetch invitations
        get().fetchCompanyInvitations();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to send invitation',
          color: 'danger',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        color: 'danger',
      });
    } finally {
      set({ isInviting: false });
    }
  },
  
  // Accept invitation
  acceptInvitation: async (invitationId: string) => {
    set({ isAccepting: true });
    
    try {
      const result = await acceptCompanyInvitationAction(invitationId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Invitation accepted successfully',
          color: 'success',
        });
        // Remove from user invitations
        const userInvitations = get().userInvitations.filter(inv => inv.id !== invitationId);
        set({ userInvitations });
        // Refresh user invitations
        get().fetchUserInvitations();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to accept invitation',
          color: 'danger',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        color: 'danger',
      });
    } finally {
      set({ isAccepting: false });
    }
  },
  
  // Decline invitation
  declineInvitation: async (invitationId: string) => {
    set({ isDeclining: true });
    
    try {
      const result = await declineCompanyInvitationAction(invitationId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Invitation declined',
          color: 'success',
        });
        // Update in user invitations
        const userInvitations = get().userInvitations.filter(inv => inv.id !== invitationId);
        set({ userInvitations });
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to decline invitation',
          color: 'danger',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        color: 'danger',
      });
    } finally {
      set({ isDeclining: false });
    }
  },
  
  // Cancel invitation
  cancelInvitation: async (invitationId: string) => {
    set({ isCancelling: true });
    
    try {
      const result = await cancelCompanyInvitationAction(invitationId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Invitation cancelled',
          color: 'success',
        });
        // Update in company invitations
        const companyInvitations = get().companyInvitations.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: InvitationStatus.CANCELLED, cancelledAt: new Date() } 
            : inv
        );
        set({ companyInvitations });
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to cancel invitation',
          color: 'danger',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        color: 'danger',
      });
    } finally {
      set({ isCancelling: false });
    }
  }
})); 