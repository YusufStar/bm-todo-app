import { CompanyMemberRole, ProjectMemberRole, InvitationStatus } from "./forms";

export const companyMemberColorMap = {
  [CompanyMemberRole.OWNER]: "primary",
  [CompanyMemberRole.ADMIN]: "secondary",
  [CompanyMemberRole.MEMBER]: "default",
};

export const projectMemberColorMap = {
  [ProjectMemberRole.ADMIN]: "primary",
  [ProjectMemberRole.PROJECT_ADMIN]: "secondary",
  [ProjectMemberRole.DEVELOPER]: "success",
  [ProjectMemberRole.TESTER]: "warning",
  [ProjectMemberRole.MARKETING]: "danger",
};

export const invitationStatusColorMap = {
  [InvitationStatus.PENDING]: "warning",
  [InvitationStatus.ACCEPTED]: "success",
  [InvitationStatus.REJECTED]: "danger",
  [InvitationStatus.CANCELLED]: "default",
  [InvitationStatus.EXPIRED]: "secondary",
};

