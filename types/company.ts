export type CompanyRole = 'ADMIN' | 'MEMBER' | 'OWNER';

export type CompanyUser = {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
};

export type CompanyMember = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  role: CompanyRole;
  companyId: string;
  user: CompanyUser;
};

export type Company = {
  id: string;
  name: string;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner: CompanyUser;
  members: CompanyMember[];
}; 