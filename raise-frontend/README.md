# Raise Frontend

Modern, professional Next.js frontend application for the Raise steganography platform.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **UI Components**: Custom component library
- **Icons**: Lucide React

## 📁 Project Structure

```
raise-frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── auth/                # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/           # Dashboard page
│   │   ├── stego/               # Steganography pages
│   │   │   ├── encode/
│   │   │   ├── decode/
│   │   │   └── history/
│   │   ├── profile/             # User profile
│   │   ├── notifications/       # Notifications
│   │   └── settings/            # Settings
│   │
│   ├── components/              # Reusable components
│   │   └── ui/                  # UI component library
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Loading.tsx
│   │       └── index.ts
│   │
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication feature
│   │   │   └── components/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   └── stego/               # Steganography feature
│   │       └── components/
│   │           ├── EncodeForm.tsx
│   │           └── DecodeForm.tsx
│   │
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/                 # API client and services
│   │   │   ├── client.ts        # Axios client with interceptors
│   │   │   ├── auth.ts          # Auth API service
│   │   │   ├── stego.ts         # Stego API service
│   │   │   ├── notifications.ts # Notifications API service
│   │   │   ├── users.ts         # Users API service
│   │   │   └── index.ts
│   │   ├── utils.ts             # Utility functions
│   │   └── constants.ts         # App-wide constants
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useAuth.ts           # Authentication hook
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts             # Main types
│   │   └── api.ts               # API-specific types
│   │
│   ├── config/                  # Configuration files
│   │   └── env.ts               # Environment variables
│   │
│   └── styles/                  # Global styles
│       └── globals.css          # Global CSS with Tailwind
│
├── public/                      # Static assets
├── .env.local.example          # Environment variables example
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🏗️ Architecture

### Modular Architecture

The project follows a **modular architecture** pattern:

1. **Feature Modules** (`src/features/`): Self-contained feature modules with their own components, hooks, and logic
2. **Shared Components** (`src/components/`): Reusable UI components used across features
3. **API Layer** (`src/lib/api/`): Centralized API communication with service-based architecture
4. **Type Safety**: Full TypeScript coverage with shared type definitions
5. **State Management**: Zustand for global state (auth, etc.)

### Key Design Patterns

- **Separation of Concerns**: Clear separation between UI, business logic, and API calls
- **Component Composition**: Reusable, composable UI components
- **Custom Hooks**: Encapsulated logic in custom React hooks
- **Service Layer**: API calls abstracted into service modules
- **Type-First**: TypeScript types defined before implementation

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running at `http://localhost:8000` (see `raise-backend/`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_APP_NAME=Raise
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running the Application

**Development Mode** (recommended for development):

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

**Production Mode**:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Other Commands

**Type Checking**:
```bash
npm run type-check
```

**Linting**:
```bash
npm run lint
```

### Important Notes

- The frontend connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`
- Make sure the backend is running before starting the frontend
- The frontend runs directly with Node.js (no Docker required)
- Hot reload is enabled in development mode for instant updates

## 🎨 UI Components

### Available Components

- **Button**: Versatile button with variants (primary, secondary, outline, ghost, danger)
- **Input**: Form input with label, error handling, and icons
- **Card**: Container component with header, content, and footer sections
- **Loading**: Loading spinner with size variants

### Usage Example

```tsx
import { Button, Input, Card } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <Input label="Email" type="email" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## 🔌 API Integration

### API Client

The API client (`src/lib/api/client.ts`) provides:

- Automatic token injection
- Token refresh on 401 errors
- Request/response interceptors
- File upload support with progress tracking

### Using API Services

```tsx
import { authApi, stegoApi } from '@/lib/api';

// Login
const { user, tokens } = await authApi.login({ email, password });

// Encode message
const response = await stegoApi.encode(file, { message, password }, onProgress);
```

## 🔐 Authentication

Authentication is handled through:

1. **useAuth Hook**: Global auth state management
2. **API Client**: Automatic token handling
3. **Middleware**: Route protection
4. **Local Storage**: Token persistence

### Protected Routes

Routes under these paths require authentication:
- `/dashboard`
- `/stego/*`
- `/profile`
- `/settings`
- `/notifications`

## 🎯 Features

### Implemented

- ✅ User authentication (login/register)
- ✅ Steganography encoding
- ✅ Steganography decoding
- ✅ Operation history
- ✅ User profile
- ✅ Notifications
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications

### Planned

- 🔄 Settings page
- 🔄 Password reset
- 🔄 Email verification
- 🔄 Advanced steganography options
- 🔄 Batch operations
- 🔄 Dark mode

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules
- Use functional components with hooks
- Prefer named exports for components
- Use absolute imports with `@/` prefix

### Component Guidelines

1. Keep components small and focused
2. Extract reusable logic into custom hooks
3. Use proper TypeScript types
4. Handle loading and error states
5. Add proper accessibility attributes

### API Integration

1. All API calls go through service modules
2. Handle errors gracefully with toast notifications
3. Show loading states during async operations
4. Use proper TypeScript types for requests/responses

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_API_VERSION` | API version | `v1` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Raise` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running at `http://localhost:8000`
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify CORS settings in the backend

2. **Build Errors**
   - Run `npm run type-check` to find TypeScript errors
   - Clear `.next` folder: `rm -rf .next`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

3. **Authentication Issues**
   - Clear browser local storage
   - Check token expiration
   - Verify backend authentication endpoints are working

4. **Port Already in Use**
   - Kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`
   - Or use a different port: `PORT=3001 npm run dev`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 License

This project is part of the Raise steganography platform.

