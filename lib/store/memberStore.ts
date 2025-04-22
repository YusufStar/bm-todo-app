import { create } from 'zustand';
import { addToast } from '@heroui/react';
import { useCompanyStore } from './companyStore';
import { 
  getCompanyMembersAction,
  updateMemberRoleAction,
  removeMemberAction
} from '@/actions/member/actions';
import { CompanyMemberRole } from '@/types/forms';
import { useUserStore } from './userStore';

export interface CompanyMember {
  id: string;
  userId: string;
  companyId: string;
  role: CompanyMemberRole;
  user: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface MemberState {
  // Data
  members: CompanyMember[];
  
  // UI state
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  
  // Action states
  isUpdating: boolean;
  isRemoving: boolean;
  
  // Actions
  fetchMembers: () => Promise<void>;
  updateMemberRole: (memberId: string, role: CompanyMemberRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  // Data state
  members: [],
  
  // UI state
  isLoading: false,
  isError: false,
  error: null,
  
  // Action states
  isUpdating: false,
  isRemoving: false,
  
  // Fetch members
  fetchMembers: async () => {
    const companyId = useCompanyStore.getState().selectedCompanyId;
    
    if (!companyId) {
      set({
        members: [],
        isLoading: false,
        isError: true,
        error: 'No company selected'
      });
      return;
    }
    
    set({ isLoading: true, isError: false, error: null });
    
    try {
      const result = await getCompanyMembersAction(companyId);
      
      if (result.success) {
        set({
          members: result.members as CompanyMember[],
          isLoading: false
        });
      } else {
        set({
          isLoading: false,
          isError: true,
          error: result.error || 'Failed to fetch members'
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
  
  // Update member role
  updateMemberRole: async (memberId: string, role: CompanyMemberRole) => {
    const userId = useUserStore.getState().user?.id;

    if (!userId) {
      throw new Error('You must be logged in');
    }

    set({ isUpdating: true });
    
    try {
      const result = await updateMemberRoleAction(memberId, role, userId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Member role updated successfully',
          color: 'success',
        });
        // Update member in the local state
        const members = get().members.map(member => 
          member.id === memberId ? { ...member, role } : member
        );
        set({ members });
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to update member role',
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
      set({ isUpdating: false });
    }
  },
  
  // Remove member
  removeMember: async (memberId: string) => {
    const userId = useUserStore.getState().user?.id;

    if (!userId) {
      throw new Error('You must be logged in');
    }
    set({ isRemoving: true });
    
    try {
      const result = await removeMemberAction(memberId, userId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Member removed successfully',
          color: 'success',
        });
        // Remove member from the local state
        const members = get().members.filter(member => member.id !== memberId);
        set({ members });
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to remove member',
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
      set({ isRemoving: false });
    }
  }
})); 