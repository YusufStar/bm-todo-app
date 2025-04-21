"use client";

import { useEffect } from "react";
import { useCompanyStore } from "@/lib/store";

export interface UseCompaniesOptions {
  onCompanyChange?: (companyId: string) => void;
}

export function useCompanies(options?: UseCompaniesOptions) {
  const store = useCompanyStore();
  
  // Fetch companies on mount
  useEffect(() => {
    store.fetchCompanies();
    store.hydrate();
  }, []);
  
  // Handle company selection with callback
  const selectCompany = (companyId: string) => {
    store.selectCompany(companyId)
      .then(() => {
        options?.onCompanyChange?.(companyId);
      });
  };
  
  return {
    companies: store.companies,
    selectedCompany: store.selectedCompany,
    selectedCompanyId: store.selectedCompanyId,
    selectCompany,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    isSelecting: store.isSelecting
  };
}
