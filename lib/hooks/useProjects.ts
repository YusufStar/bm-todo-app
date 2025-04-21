'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { getProjectsAction, createProjectAction, updateProjectAction, deleteProjectAction, getProjectAction } from '@/actions/project/actions'
import { useCompanies } from './useCompanies'
import { ProjectQuerySchema, ProjectStatus, CreateProjectSchema, UpdateProjectSchema } from '@/types/forms'
import { addToast } from '@heroui/react'
import { ActionResult } from '@/types'

// Define the shape of the projects action result for better type safety
interface ProjectsActionResult {
  projects: any[];
  totalProjects: number;
  totalPages: number;
}

export interface UseProjectsOptions {
  initialPage?: number
  initialPerPage?: number
  initialSortBy?: string
  initialSortDirection?: 'ascending' | 'descending'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useProjects(options: UseProjectsOptions = {}) {
  const queryClient = useQueryClient()
  const { selectedCompanyId, selectedCompany } = useCompanies()
  
  // State for filtering and pagination
  const [page, setPage] = useState(options.initialPage || 1)
  const [perPage, setPerPage] = useState(options.initialPerPage || 10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | undefined>(undefined)
  const [sortBy, setSortBy] = useState(options.initialSortBy || 'createdAt')
  const [sortDirection, setSortDirection] = useState(options.initialSortDirection || 'ascending')
  
  // Build query parameters
  const queryParams: ProjectQuerySchema = {
    companyId: selectedCompanyId || '',
    page,
    perPage,
    sortBy,
    sortDirection,
  }
  
  if (search) queryParams.search = search
  if (status) queryParams.status = status
  
  // Fetch projects
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: async () => {
      if (!selectedCompanyId) {
        return { 
          success: false, 
          error: 'No company selected',
          projects: [],
          totalProjects: 0,
          totalPages: 0
        }
      }
      const result = await getProjectsAction(queryParams)
      return result
    },
    enabled: !!selectedCompanyId,
  })
  
  // Create project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectSchema) => {
      return await createProjectAction({
        ...projectData,
        companyId: selectedCompanyId || '',
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Project created successfully',
          color: 'success',
        })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        options.onSuccess?.()
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to create project',
          color: 'danger',
        })
        options.onError?.(result.error || 'Failed to create project')
      }
    },
    onError: (error: Error) => {
      addToast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        color: 'danger',
      })
      options.onError?.(error.message || 'An unexpected error occurred')
    }
  })
  
  // Update project
  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: UpdateProjectSchema) => {
      return await updateProjectAction(projectData)
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Project updated successfully',
          color: 'success',
        })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        options.onSuccess?.()
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to update project',
          color: 'danger',
        })
        options.onError?.(result.error || 'Failed to update project')
      }
    },
    onError: (error: Error) => {
      addToast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        color: 'danger',
      })
      options.onError?.(error.message || 'An unexpected error occurred')
    }
  })
  
  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await deleteProjectAction(projectId)
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Project deleted successfully',
          color: 'success',
        })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        options.onSuccess?.()
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to delete project',
          color: 'danger',
        })
        options.onError?.(result.error || 'Failed to delete project')
      }
    },
    onError: (error: Error) => {
      addToast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        color: 'danger',
      })
      options.onError?.(error.message || 'An unexpected error occurred')
    }
  })
  
  // Get a single project
  const getProject = async (projectId: string | null) => {
    if (!projectId) {
      return { success: false, error: 'No project ID provided', project: null };
    }
    
    try {
      const result = await getProjectAction(projectId);
      return result;
    } catch (error) {
      console.error('Error fetching project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        project: null
      };
    }
  }
  
  // Reset pagination when filters change
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])
  
  const handleStatusFilter = useCallback((statusValue: ProjectStatus | undefined) => {
    setStatus(statusValue)
    setPage(1)
  }, [])
  
  const handleSortChange = useCallback((descriptor: { column: string, direction: 'ascending' | 'descending' }) => {
    setSortBy(descriptor.column)
    setSortDirection(descriptor.direction)
    setPage(1)
  }, [])
  
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])
  
  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage)
    setPage(1)
  }, [])

  // Safe access to data properties with proper type casting
  const successData = data?.success ? data as (ActionResult<ProjectsActionResult> & ProjectsActionResult) : null;

  return {
    // Data
    projects: successData?.projects || [],
    totalProjects: successData?.totalProjects || 0,
    totalPages: successData?.totalPages || 0,
    
    // State
    page,
    perPage,
    search,
    status,
    sortBy,
    sortDirection,
    isLoading: isLoading || createProjectMutation.isPending || updateProjectMutation.isPending || deleteProjectMutation.isPending,
    isError,
    error: data?.error || (error as Error)?.message,
    selectedCompany,
    
    // Mutations
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    getProject,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    
    // Actions
    handleSearch,
    handleStatusFilter,
    handleSortChange,
    handlePageChange,
    handlePerPageChange,
    refetch,
  }
} 