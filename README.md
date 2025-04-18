# b&m Business Management

**b&m** is a comprehensive business management application that enables users to register with a username or email, create and manage organizations, accept or reject invites, assign members to projects, collaborate on a shared whiteboard, create and track tasks, and store assets in a cloud-like storage.

## Key Features

- **User Authentication**: Sign up with username or email, secure login with bcrypt password encryption.
- **Organization Management**: Create organizations, invite members, accept or reject invitations.
- **Project Management**: Create projects under an organization, set status, priority, budget, dates, and visibility.
- **Task Tracking**: Assign tasks to project members, set statuses, priorities, due dates, subtasks, comments.
- **Collaboration Whiteboard**: Real-time drawing board for brainstorming and visual collaboration.
- **Cloud Assets**: Upload and manage files similar to Google Drive.
- **Roles & Permissions**: Fine-grained control with company and project roles.

## Tech Stack

- **Front-End**: Next.js 15.0.4, React 18.3.1, Tailwind CSS 3.4.16, @heroui/react, framer-motion, lucide-react
- **State Management**: Zustand for global state management
- **Back-End**: Prisma ORM 6.6.0, SQLite
- **Authentication**: bcrypt 5.1.1, next-auth custom adapter
- **Validation**: Zod 3.24.3, @hookform/resolvers 5.0.1
- **Forms**: react-hook-form 7.55.0
- **Theming**: next-themes 0.4.4