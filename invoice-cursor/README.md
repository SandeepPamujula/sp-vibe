# Invoice Cursor

Expense invoice processing application with role-based access control for admin and accountant users.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Build the application for production:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
invoice-cursor/
├── src/
│   └── app/          # Next.js App Router
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── .cursorrules      # Cursor AI rules and milestones
├── next.config.js    # Next.js configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Dependencies and scripts
```

## Implementation Milestones

See `.cursorrules` for detailed implementation milestones and progress tracking.

## License

ISC

