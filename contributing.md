# CONTRIBUTING.md

# Contributing to b&m

Thank you for considering contributing to **b&m**! We welcome contributions of all kinds.

## Getting Started

1. **Fork the Repository**: Start by forking the repository and then clone it locally.
```bash
git clone https://github.com/yourusername/bm.git
cd bm
```

2. **Install Dependencies**: Install all required dependencies.
```bash
npm install
```

3. **Setup Database**: Create a `.env` file at the root with:
```
DATABASE_URL="file:./dev.db"
```

4. **Initialize Prisma**: Run migrations to set up your local database.
```bash
npx prisma migrate dev
```

5. **Start Development Server**: Launch the development server.
```bash
npm run dev
```

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate.
2. Update the progress.md file to reflect your contributions.
3. The PR should work properly with the existing codebase.
4. Follow the existing coding style and patterns.

## Code Guidelines

- Use TypeScript for all new code.
- Ensure proper typing for all functions and components.
- Write unit tests for new functionality.
- Use Tailwind CSS for styling components.
- Follow the repository's linting rules (`npm run lint`).
- Create Zustand stores for global state management.

## Component Structure

- Use functional components with hooks.
- Follow the atomic design pattern (atoms, molecules, organisms).
- Create reusable components when possible.
- Leverage Zustand for managing component and application state.

## Tech Stack Expectations

Please ensure familiarity with our tech stack:
- Next.js 15.0.4
- React 18.3.1
- TypeScript 5.6.3
- Tailwind CSS 3.4.16
- Prisma ORM 6.6.0
- @heroui/react components
- Zustand for state management

## License

By contributing, you agree that your contributions will be licensed under the project's license.

```markdown