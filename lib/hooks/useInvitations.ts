'use client'

import { useEffect } from 'react'
import { useInvitationStore, useCompanyStore } from '@/lib/store'
import { CompanyMemberRole } from '@/types/forms'

export interface UseInvitationsOptions {
  type?: 'company' | 'user' | 'both'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useInvitations(options: UseInvitationsOptions = { type: 'company' }) {
  const invitationStore = useInvitationStore();
  const { selectedCompanyId } = useCompanyStore();
  
  // Fetch invitations based on type
  useEffect(() => {
    if (options.type === 'company' || options.type === 'both') {
      if (selectedCompanyId) {
        invitationStore.fetchCompanyInvitations();
      }
    }
    
    if (options.type === 'user' || options.type === 'both') {
      invitationStore.fetchUserInvitations();
    }
  }, [selectedCompanyId, options.type]);
  
  // Custom handlers with callbacks
  const inviteMember = async (email: string, role?: CompanyMemberRole, expiresInDays?: number) => {
    try {
      await invitationStore.inviteMember(email, role, expiresInDays);
      options.onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send invitation';
      options.onError?.(errorMsg);
    }
  };
  
  const acceptInvitation = async (invitationId: string) => {
    try {
      await invitationStore.acceptInvitation(invitationId);
      options.onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to accept invitation';
      options.onError?.(errorMsg);
    }
  };
  
  const declineInvitation = async (invitationId: string) => {
    try {
      await invitationStore.declineInvitation(invitationId);
      options.onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to decline invitation';
      options.onError?.(errorMsg);
    }
  };
  
  const cancelInvitation = async (invitationId: string) => {
    try {
      await invitationStore.cancelInvitation(invitationId);
      options.onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to cancel invitation';
      options.onError?.(errorMsg);
    }
  };

  return {
    // Data
    companyInvitations: invitationStore.companyInvitations,
    userInvitations: invitationStore.userInvitations,
    
    // State
    isLoading: invitationStore.isLoading,
    isLoadingUser: invitationStore.isLoadingUser,
    isError: invitationStore.isError,
    error: invitationStore.error,
    
    // Mutations
    inviteMember,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    
    // Action States
    isInviting: invitationStore.isInviting,
    isAccepting: invitationStore.isAccepting,
    isDeclining: invitationStore.isDeclining,
    isCancelling: invitationStore.isCancelling,
    
    // Actions
    refetchCompanyInvitations: invitationStore.fetchCompanyInvitations,
    refetchUserInvitations: invitationStore.fetchUserInvitations,
  }
} 