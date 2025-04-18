# Project Brief

## Purpose
b&m is a business management platform that empowers teams to create and manage multiple organizations, collaborate on projects with real-time whiteboard capabilities, assign and track tasks, and store assets securely in a cloud-like environment.

## Goals
- **Secure Authentication**: Enable users to register and log in using username or email with bcrypt encrypted passwords.
- **Organization Workflow**: Allow users to create organizations, send and respond to invitations, and manage member roles (Owner, Admin, Member).
- **Project & Task Management**: Provide CRUD operations for projects and tasks, including statuses, priorities, due dates, subtasks, and comments.
- **Collaborative Whiteboard**: Integrate a real-time drawing board for visual brainstorming within projects.
- **Asset Storage**: Offer cloud-like file storage for project documents, images, and other assets.

## Scope
- **Included**:
  - User registration/login with username or email
  - Organization creation and invitation management
  - Project creation with status, priority, budget, dates
  - Task assignments with workflows, subtasks, and comments
  - Whiteboard integration for live collaboration
  - Asset upload/download functionality for project documents
  - Role-based permissions (Company and Project levels)
- **Excluded (MVP)**:
  - Advanced analytics/dashboard
  - Payment processing or billing (basic paid flag exists)
  - Mobile-native application (responsive web only)
  - Third-party integrations

## Tech Implementation
- **Frontend**: Next.js 15.0.4, React 18.3.1, @heroui/react, Tailwind CSS
- **State Management**: Zustand for global state
- **Backend**: Prisma ORM 6.6.0 with SQLite database
- **Authentication**: bcrypt 5.1.1, custom next-auth adapter
- **Forms & Validation**: react-hook-form 7.55.0, Zod 3.24.3

## Stakeholders
- **End Users**: Team members and project collaborators
- **Organization Admins**: Users who manage company settings and members
- **Project Managers**: Users responsible for project planning and task delegation
- **Development Team**: Engineers maintaining and extending the platform