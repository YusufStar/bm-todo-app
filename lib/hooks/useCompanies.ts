'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompaniesAction, selectCompanyAction } from '@/actions/company/actions'
import { useEffect, useState } from 'react'

// Local storage key for company selection
const SELECTED_COMPANY_KEY = 'selectedCompanyId'

export interface UseCompaniesOptions {
  onCompanyChange?: (companyId: string) => void
}

export function useCompanies(options?: UseCompaniesOptions) {
  const queryClient = useQueryClient()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  
  // Initial hydration from localStorage
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedCompanyId = localStorage.getItem(SELECTED_COMPANY_KEY)
      if (storedCompanyId) {
        console.log('Hydrating from localStorage:', storedCompanyId)
        setSelectedCompanyId(storedCompanyId)
      }
    }
  }, [])
  
  // Fetch companies data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      console.log('Fetching companies...')
      const result = await getCompaniesAction()
      console.log('Fetched companies result:', result)
      return result
    }
  })

  // Validate selected company exists in the list or select first company
  useEffect(() => {
    if (!data?.success || !data.companies?.length) return
    
    console.log('Validating selected company with data:', {
      selectedCompanyId,
      availableCompanies: data.companies.map(c => c.id)
    })
    
    // If we have a selected company, validate it exists in the returned companies
    if (selectedCompanyId) {
      const companyExists = data.companies.some(c => c.id === selectedCompanyId)
      
      // If company doesn't exist in the list, select the first company
      if (!companyExists && data.companies.length > 0) {
        const firstCompanyId = data.companies[0].id
        console.log('Selected company not found in list, selecting first:', firstCompanyId)
        setSelectedCompanyId(firstCompanyId)
        localStorage.setItem(SELECTED_COMPANY_KEY, firstCompanyId)
      }
    } 
    // If no company is selected, select the first one
    else if (data.companies.length > 0) {
      const firstCompanyId = data.companies[0].id
      console.log('No company selected, selecting first:', firstCompanyId)
      setSelectedCompanyId(firstCompanyId)
      localStorage.setItem(SELECTED_COMPANY_KEY, firstCompanyId)
    }
  }, [data, selectedCompanyId])

  // Handle company selection
  const selectCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      console.log('Running select company mutation for ID:', companyId)
      const result = await selectCompanyAction(companyId)
      console.log('Select company result:', result)
      return result
    },
    onSuccess: (result, companyId) => {
      console.log('Select company mutation success:', { result, companyId })
      if (result.success) {
        localStorage.setItem(SELECTED_COMPANY_KEY, companyId)
        setSelectedCompanyId(companyId)
        // Call the optional callback
        options?.onCompanyChange?.(companyId)
        // Invalidate any related queries
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        // Force refetch companies to ensure data is fresh
        refetch()
      } else {
        console.error('Select company mutation failed:', result.error)
      }
    },
    onError: (error) => {
      console.error('Select company mutation error:', error)
    }
  })

  const selectCompany = (companyId: string) => {
    console.log('selectCompany called with:', companyId, 'current:', selectedCompanyId)
    if (companyId === selectedCompanyId) {
      console.log('Same company already selected, ignoring')
      return
    }
    
    // Update local state immediately for better UX
    setSelectedCompanyId(companyId)
    localStorage.setItem(SELECTED_COMPANY_KEY, companyId)
    
    // Then call the mutation to validate on the server
    selectCompanyMutation.mutate(companyId)
  }

  // Find the currently selected company in the list
  const selectedCompany = data?.success && selectedCompanyId
    ? data.companies?.find(company => company.id === selectedCompanyId) || null
    : null

  return {
    companies: data?.success ? data.companies : [],
    selectedCompany,
    selectedCompanyId,
    selectCompany,
    isLoading,
    isError,
    error: data?.error || error,
    isSelecting: selectCompanyMutation.isPending
  }
} 