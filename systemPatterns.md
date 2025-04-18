# System Patterns

## Architecture Overview
- **Frontend**: Next.js 15.0.4 with React 18.3.1, SSR/SSG via Turbopack
- **API Layer**: Next.js API routes using REST conventions
- **Database**: SQLite with Prisma ORM 6.6.0 for data modeling
- **Authentication**: bcrypt 5.1.1 with next-auth custom adapter
- **Realtime**: WebSocket implementation for whiteboard syncing
- **Storage**: Local
- **State Management**: Zustand for global and component state management

## Key Design Patterns
- **Repository Pattern**: Abstracts Prisma client for CRUD operations
- **Observer/Publisher-Subscriber**: Whiteboard events broadcast to connected clients
- **Singleton**: Shared Zustand stores for auth, theme, and organization state
- **Strategy**: Different whiteboard drawing tools (pen, eraser, shapes)
- **Factory**: Task creation with various statuses and priorities

## Component Relationships
- **Layout**: Shared Shell with Navbar, Sidebar, and Content area
- **Context & State**: Zustand stores for global state management (Auth, Theme, Organization, Project)
- **UI Components**: 
  - **Atoms**: Button, Input, Select, Switch (@heroui/react)
  - **Molecules**: TaskCard, InviteModal, ProjectCard
  - **Organisms**: Whiteboard, TaskList, OrganizationDashboard

## State Management
- **Global Stores**: Zustand stores for application-wide state
  - Authentication state (user, session)
  - Theme state (dark/light mode)
  - Organization state (current organization, memberships)
  - Project state (current project, tasks)
- **Local State**: React's useState for component-specific state
- **Form State**: react-hook-form for form management

## Database Schema
- User-centric model with relationships to:
  - Companies (owned and memberships)
  - Projects (memberships and roles)
  - Tasks (assignments and comments)
  - Documents (project assets)
- Role-based permissions at Company and Project levels