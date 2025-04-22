import { create } from 'zustand';
import { 
  getProjectsAction, 
  createProjectAction, 
  updateProjectAction, 
  deleteProjectAction, 
  getProjectAction 
} from '@/actions/project/actions';
import { ProjectQuerySchema, ProjectStatus, CreateProjectSchema, UpdateProjectSchema } from '@/types/forms';
import { Project } from '@/types/project';
import { addToast } from '@heroui/react';
import { useCompanyStore } from './companyStore';
import { useUserStore } from './userStore';

interface ProjectState {
  // Data
  projects: Project[];
  totalProjects: number;
  totalPages: number;
  
  // UI state
  page: number;
  perPage: number;
  search: string;
  status: ProjectStatus | undefined;
  sortBy: string;
  sortDirection: 'ascending' | 'descending';
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  
  // Action states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectSchema) => Promise<void>;
  updateProject: (data: UpdateProjectSchema) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProject: (projectId: string) => Promise<any>;
  
  // UI actions
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: ProjectStatus | undefined) => void;
  setSortDescriptor: (descriptor: { column: string, direction: 'ascending' | 'descending' }) => void;
  
  // Helpers
  getQueryParams: () => ProjectQuerySchema;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Data state
  projects: [],
  totalProjects: 0,
  totalPages: 0,
  
  // UI state
  page: 1,
  perPage: 10,
  search: '',
  status: undefined,
  sortBy: 'createdAt',
  sortDirection: 'ascending',
  isLoading: false,
  isError: false,
  error: null,
  
  // Action states
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  
  // Build query parameters
  getQueryParams: () => {
    const state = get();
    const companyId = useCompanyStore.getState().selectedCompanyId;
    
    const queryParams: ProjectQuerySchema = {
      companyId: companyId || '',
      page: state.page,
      perPage: state.perPage,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
    };
    
    if (state.search) queryParams.search = state.search;
    if (state.status) queryParams.status = state.status;
    
    return queryParams;
  },
  
  // Fetch projects
  fetchProjects: async () => {
    const state = get();
    const companyId = useCompanyStore.getState().selectedCompanyId;
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
      set({
        projects: [],
        totalProjects: 0,
        totalPages: 0,
      });
      return;
    }
    
    if (!companyId) {
      set({
        projects: [],
        totalProjects: 0,
        totalPages: 0,
        isLoading: false,
        isError: true,
        error: 'No company selected'
      });
      return;
    }
    
    set({ isLoading: true, isError: false, error: null });
    
    try {
      const result = await getProjectsAction(state.getQueryParams(), userId);
      
      if (result.success) {
        set({
          projects: result.projects || [],
          totalProjects: result.totalProjects || 0,
          totalPages: result.totalPages || 0,
          isLoading: false
        });
      } else {
        set({
          isLoading: false,
          isError: true,
          error: result.error || 'Failed to fetch projects'
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
  
  // Create project
  createProject: async (projectData: CreateProjectSchema) => {
    const companyId = useCompanyStore.getState().selectedCompanyId;
    const userId = useUserStore.getState().user?.id;

    if (!userId) {
      addToast({
        title: 'Error',
        description: 'No user found',
        color: 'danger',
      });
      return;
    }

    if (!companyId) {
      addToast({
        title: 'Error',
        description: 'No company selected',
        color: 'danger',
      });
      return;
    }
    
    set({ isCreating: true });
    
    try {
      const result = await createProjectAction({
        ...projectData,
        companyId: companyId,
      }, userId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Project created successfully',
          color: 'success',
        });
        // Refetch projects
        get().fetchProjects();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to create project',
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
      set({ isCreating: false });
    }
  },
  
  // Update project
  updateProject: async (projectData: UpdateProjectSchema) => {
    const companyId = useCompanyStore.getState().selectedCompanyId;
    const userId = useUserStore.getState().user?.id;

    if (!userId) {
      addToast({
        title: 'Error',
        description: 'No user found',
        color: 'danger',
      });
      return;
    }

    if (!companyId) {
      addToast({
        title: 'Error',
        description: 'No company selected',
        color: 'danger',
      });
      return;
    }

    set({ isUpdating: true });
    
    try {
      const result = await updateProjectAction(projectData, userId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Project updated successfully',
          color: 'success',
        });
        // Refetch projects
        get().fetchProjects();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to update project',
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
  
  // Delete project
  deleteProject: async (projectId: string) => {
    const userId = useUserStore.getState().user?.id;

    if (!userId) {
      addToast({
        title: 'Error',
        description: 'No user found',
        color: 'danger',
      });
      return;
    }
    
    set({ isDeleting: true });
    
    try {
      const result = await deleteProjectAction(projectId, userId);
      
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Project deleted successfully',
          color: 'success',
        });
        // Refetch projects
        get().fetchProjects();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to delete project',
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
      set({ isDeleting: false });
    }
  },
  
  // Get a single project
  getProject: async (projectId: string) => {
    const userId = useUserStore.getState().user?.id;

    if (!userId) {
      return { success: false, error: 'No user found', project: null };
    }
    
    if (!projectId) {
      return { success: false, error: 'No project ID provided', project: null };
    }
    try {
      const result = await getProjectAction(projectId, userId);
      return result;
    } catch (error) {
      console.error('Error fetching project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch project',
        project: null
      };
    }
  },
  
  // UI actions
  setPage: (page) => set({ page }),
  
  setPerPage: (perPage) => {
    set({ perPage, page: 1 });
    get().fetchProjects();
  },
  
  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchProjects();
  },
  
  setStatus: (status) => {
    set({ status, page: 1 });
    get().fetchProjects();
  },
  
  setSortDescriptor: (descriptor) => {
    set({ 
      sortBy: descriptor.column, 
      sortDirection: descriptor.direction,
      page: 1
    });
    get().fetchProjects();
  }
})); 