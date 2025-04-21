'use client'

import { useTransition, useEffect, memo } from 'react'
import { useCompanies } from '@/lib/hooks/useCompanies'
import { 
  Select, 
  SelectItem, 
  Spinner, 
  Avatar, 
  cn
} from '@heroui/react'
import { Building } from 'lucide-react'

function CompanySelectorComponent() {
  const {
    companies,
    selectedCompany,
    selectedCompanyId,
    selectCompany,
    isLoading,
    isError,
    error,
    isSelecting
  } = useCompanies({
    // Add callback when company changes
    onCompanyChange: (id) => {
      console.log('Company changed to:', id)
    }
  })
  
  const [isPending, startTransition] = useTransition()
  
  // Log current state for debugging
  useEffect(() => {
    console.log('Current companies:', companies)
    console.log('Selected company ID:', selectedCompanyId)
    console.log('Selected company:', selectedCompany)
  }, [companies, selectedCompany, selectedCompanyId])
  
  // Handle company selection change
  const handleCompanyChange = (companyId: string) => {
    console.log('handleCompanyChange called with:', companyId)
    startTransition(() => {
      selectCompany(companyId)
    })
  }
  
  // Loading state - styled to match the Select component dimensions
  if (isLoading) {
    return (
      <div className="my-4 relative">
        <div className="w-full h-12 px-4 py-2 rounded-lg bg-default-100 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-default-200 shrink-0"></div>
            <div className="h-4 w-32 bg-default-200 rounded"></div>
          </div>
          <Spinner size="sm" color="primary" />
        </div>
      </div>
    )
  }
  
  // Error state
  if (isError) {
    return (
      <div className="my-4 relative">
        <div className="w-full h-12 px-4 py-2 rounded-lg bg-danger-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building size={20} className="text-danger-500" />
            <span className="text-sm text-danger-600">
              {error?.toString() || 'Failed to load companies'}
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  // No companies state
  if (companies.length === 0) {
    return (
      <div className="my-4 relative">
        <div className="w-full h-12 px-4 py-2 rounded-lg bg-warning-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building size={20} className="text-warning-500" />
            <span className="text-sm text-warning-600">No companies available</span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="my-4 relative">
      <Select
        aria-label="Select a company"
        className="w-full"
        classNames={{
          trigger: "h-12 px-4 py-2 rounded-lg",
          value: "text-start text-sm font-medium"
        }}
        // Use selectedKeys instead of defaultSelectedKeys to control the component
        selectedKeys={selectedCompanyId ? [selectedCompanyId] : []}
        disallowEmptySelection={true}
        isDisabled={isPending || isSelecting}
        startContent={
          <Avatar
            size="sm"
            src={selectedCompany?.logo!}
            name={selectedCompany?.name!}
            className="shrink-0 mr-2"
            aria-label={`${selectedCompany?.name} logo`}
          />
        }
        endContent={
          isPending || isSelecting ? (
            <Spinner size="sm" color="primary" />
          ) : (
            null
          )
        }
        onSelectionChange={(key) => {
          console.log('onSelectionChange key:', key)
          // Handle both string and Set types
          const selectedKey = typeof key === 'string' 
            ? key 
            : key instanceof Set ? Array.from(key)[0]?.toString() : null
            
          console.log('Processed selected key:', selectedKey)
          
          if (selectedKey) {
            handleCompanyChange(selectedKey)
          }
        }}
      >
        {companies.map((company) => (
          <SelectItem 
            key={company.id}
            textValue={company.name}
            className={cn(
              "flex items-center gap-2 my-1",
              selectedCompanyId === company.id && "bg-primary-100 text-primary-600"
            )}
            startContent={
              <Avatar
                size="sm"
                src={company.logo!}
                name={company.name!}
                aria-label={`${company.name} logo`}
              />
            }
          >
            {company.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}

export const CompanySelector = memo(CompanySelectorComponent)
CompanySelector.displayName = 'CompanySelector'