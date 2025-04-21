'use client'

import { useEffect } from 'react'
import { useProjectStore, useCompanyStore } from '@/lib/store'
import { ProjectStatus, CreateProjectSchema, UpdateProjectSchema } from '@/types/forms'

export interface UseProjectsOptions {
  initialPage?: number
  initialPerPage?: number
  initialSortBy?: string
  initialSortDirection?: 'ascending' | 'descending'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useProjects(options: UseProjectsOptions = {}) {
  const projectStore = useProjectStore();
  const { selectedCompanyId } = useCompanyStore();
  
  // Initialize with custom options
  useEffect(() => {
    if (options.initialPage) projectStore.setPage(options.initialPage);
    if (options.initialPerPage) projectStore.setPerPage(options.initialPerPage);
    if (options.initialSortBy && options.initialSortDirection) {
      projectStore.setSortDescriptor({
        column: options.initialSortBy,
        direction: options.initialSortDirection
      });
    }
  }, []);
  
  // Fetch projects when company changes
  useEffect(() => {
    projectStore.fetchProjects();
  }, [selectedCompanyId]);
  
  // Handler for table actions
  const handleSearch = (value: string) => {
    projectStore.setSearch(value);
  };
  
  const handleStatusFilter = (statusValue: ProjectStatus | undefined) => {
    projectStore.setStatus(statusValue);
  };
  
  const handleSortChange = (descriptor: { column: string, direction: 'ascending' | 'descending' }) => {
    projectStore.setSortDescriptor(descriptor);
  };
  
  const handlePageChange = (newPage: number) => {
    projectStore.setPage(newPage);
    projectStore.fetchProjects();
  };
  
  const handlePerPageChange = (newPerPage: number) => {
    projectStore.setPerPage(newPerPage);
  };
  
  // Custom handlers with callbacks
  const createProject = async (data: CreateProjectSchema) => {
    await projectStore.createProject(data);
    options.onSuccess?.();
  };
  
  const updateProject = async (data: UpdateProjectSchema) => {
    await projectStore.updateProject(data);
    options.onSuccess?.();
  };
  
  const deleteProject = async (projectId: string) => {
    await projectStore.deleteProject(projectId);
    options.onSuccess?.();
  };

  return {
    // Data
    projects: projectStore.projects,
    totalProjects: projectStore.totalProjects,
    totalPages: projectStore.totalPages,
    
    // State
    page: projectStore.page,
    perPage: projectStore.perPage,
    search: projectStore.search,
    status: projectStore.status,
    sortBy: projectStore.sortBy,
    sortDirection: projectStore.sortDirection,
    isLoading: projectStore.isLoading || projectStore.isCreating || projectStore.isUpdating || projectStore.isDeleting,
    isError: projectStore.isError,
    error: projectStore.error,
    selectedCompanyId,
    
    // Mutations
    createProject,
    updateProject,
    deleteProject,
    getProject: projectStore.getProject,
    isCreating: projectStore.isCreating,
    isUpdating: projectStore.isUpdating,
    isDeleting: projectStore.isDeleting,
    
    // Actions
    handleSearch,
    handleStatusFilter,
    handleSortChange,
    handlePageChange,
    handlePerPageChange,
    refetch: projectStore.fetchProjects,
  }
} 