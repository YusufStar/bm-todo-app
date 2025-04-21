import { ProjectStatus, Priority } from './forms';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  dueDate: string | null;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  isPublic: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  tasksCount: number;
  membersCount: number;
}

export interface ProjectWithCounts extends Project {
  tasksCount: number;
  membersCount: number;
}

export type ProjectStatusBadgeColor = 
  | 'success'  // COMPLETED
  | 'primary'  // IN_PROGRESS
  | 'warning'  // NOT_STARTED
  | 'secondary' // STOPPED
  | 'danger'   // ARCHIVED
  | 'default';  // fallback

export type PriorityBadgeColor = 
  | 'danger'    // HIGH
  | 'warning'   // MEDIUM
  | 'success'   // LOW
  | 'default';  // fallback

export const projectStatusColorMap: Record<ProjectStatus, ProjectStatusBadgeColor> = {
  'COMPLETED': 'success',
  'IN_PROGRESS': 'primary',
  'NOT_STARTED': 'warning',
  'STOPPED': 'secondary',
  'ARCHIVED': 'danger'
};

export const priorityColorMap: Record<Priority, PriorityBadgeColor> = {
  'HIGH': 'danger',
  'MEDIUM': 'warning',
  'LOW': 'success'
}; 