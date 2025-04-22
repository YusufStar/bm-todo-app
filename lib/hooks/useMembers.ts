'use client'

import { useEffect } from 'react'
import { useMemberStore, useCompanyStore } from '@/lib/store'
import { CompanyMemberRole } from '@/types/forms'

export interface UseMembersOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useMembers(options: UseMembersOptions = {}) {
  const memberStore = useMemberStore();
  const { selectedCompanyId } = useCompanyStore();
  
  // Fetch members when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      memberStore.fetchMembers();
    }
  }, [selectedCompanyId]);
  
  // Custom handlers with callbacks
  const updateMemberRole = async (memberId: string, role: CompanyMemberRole) => {
    try {
      await memberStore.updateMemberRole(memberId, role);
      options.onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update member role';
      options.onError?.(errorMsg);
    }
  };
  
  const removeMember = async (memberId: string) => {
    try {
      await memberStore.removeMember(memberId);
      options.onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove member';
      options.onError?.(errorMsg);
    }
  };

  return {
    // Data
    members: memberStore.members,
    
    // State
    isLoading: memberStore.isLoading || memberStore.isUpdating || memberStore.isRemoving,
    isError: memberStore.isError,
    error: memberStore.error,
    
    // Mutations
    updateMemberRole,
    removeMember,
    
    // Actions
    refetch: memberStore.fetchMembers,
  }
} 