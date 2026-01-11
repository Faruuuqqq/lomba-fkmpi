# Development Guide - MITRA-AI

## Getting Started for Development

### Prerequisites
- Node.js 18+ 
- Git
- PostgreSQL 14+ (or use Docker)
- OpenAI API Key

### Local Development Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd lomba-fkmpi
```

2. **Backend Setup**
```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

3. **Frontend Setup (New Terminal)**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Project Structure

### Backend (NestJS)
```
server/
├── src/
│   ├── auth/              # Authentication (JWT, register, login)
│   ├── projects/          # CRUD operations for projects
│   ├── ai/               # OpenAI integration
│   ├── common/            # Shared code (guards, decorators)
│   └── prisma/           # Database service
├── prisma/
│   └── schema.prisma      # Database schema
└── main.ts               # Application entry point
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   │   └── ui/          # Base UI components (shadcn/ui style)
│   ├── contexts/         # React contexts (Auth)
│   ├── hooks/            # Custom React hooks
│   ├── lib/             # Utilities and API client
│   └── types/           # TypeScript type definitions
```

---

## Development Workflow

### 1. Making Changes

**Backend changes**:
```bash
cd server
# Edit code
npm run start:dev  # Hot reload enabled
```

**Frontend changes**:
```bash
cd frontend
# Edit code
npm run dev  # Hot reload enabled
```

### 2. Database Changes

```bash
cd server
# Modify prisma/schema.prisma

# Create migration
npx prisma migrate dev --name migration-name

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio
```

### 3. Testing API

**With curl**:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**With Postman**:
1. Import API collection (optional)
2. Set base URL: `http://localhost:3001`
3. Test endpoints

---

## Key Features Implementation

### 1. Paste Guard (Editor)

Located in: `frontend/src/components/Editor.tsx`

```typescript
handlePaste: (view, event, slice) => {
  const pastedText = slice.content.textBetween(0, slice.content.size);
  const wordCount = pastedText.split(' ').length;
  
  if (isLocked && wordCount > 20) {
    event.preventDefault();
    alert('Cannot paste >20 words in locked mode');
    return true;
  }
  return false;
}
```

### 2. AI Unlock Logic

Located in: `server/src/projects/projects.service.ts`

```typescript
async save(id: string, userId: string, dto: SaveProjectDto) {
  const wordCount = this.countWords(dto.content);
  const isAiUnlocked = wordCount >= 150;
  
  return this.prisma.project.update({
    where: { id },
    data: { isAiUnlocked },
  });
}
```

### 3. Socratic AI Prompt

Located in: `server/src/ai/ai.service.ts`

```typescript
const systemPrompt = `You are MITRA, a Socratic Tutor...
Rules:
1. DO NOT write the essay for them.
2. Identify logical fallacies.
3. Answer with a question or critique.
4. Keep response under 3 sentences.`;
```

---

## Code Style Guidelines

### TypeScript

**Backend (NestJS)**
```typescript
@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string, userId: string) {
    // implementation
  }
}
```

**Frontend (React)**
```typescript
'use client';

export function Component({ prop }: { prop: string }) {
  const [state, setState] = useState<string>('');

  // implementation
}
```

### File Naming

- **Components**: PascalCase (e.g., `AiSidebar.tsx`)
- **Services**: PascalCase with `.service.ts` (e.g., `ProjectsService.ts`)
- **Types**: `index.ts` in types folder
- **Utilities**: camelCase (e.g., `utils.ts`, `api.ts`)

### Imports Order

1. React/Next.js imports
2. Third-party libraries
3. Internal imports
4. Types/interfaces

---

## Common Tasks

### Add New API Endpoint

**Backend**:
1. Create DTO in `src/module/module.dto.ts`
2. Add method to Service
3. Add route to Controller
4. Export from Module

**Frontend**:
1. Add function to `src/lib/api.ts`
2. Create component or add handler
3. Add TypeScript types to `src/types/index.ts`

### Add New Page

**Frontend**:
```bash
cd frontend/src/app
mkdir new-page
touch new-page/page.tsx
```

### Add New Component

**Frontend**:
```bash
cd frontend/src/components
touch ComponentName.tsx
```

---

## Debugging

### Backend Logs

```bash
cd server
npm run start:dev
# Watch terminal output for errors
```

### Frontend Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for React errors or network issues

### Database Debugging

```bash
cd server
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Common Issues

**Issue**: CORS Error
```bash
# Check FRONTEND_URL in .env
# Ensure it matches http://localhost:3000
```

**Issue**: Database Connection Failed
```bash
# Verify PostgreSQL is running
# Check DATABASE_URL in .env
psql -h localhost -U postgres -d mitra_ai
```

**Issue**: Module Not Found
```bash
# Reinstall dependencies
cd server && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

---

## Testing

### Manual Testing Checklist

**Authentication**:
- [ ] Register new user
- [ ] Login with existing user
- [ ] Logout works
- [ ] Protected routes redirect to login

**Project Management**:
- [ ] Create new project
- [ ] View all projects
- [ ] View project details
- [ ] Delete project

**Editor**:
- [ ] Type content (word count updates)
- [ ] Paste small text (<20 words) when locked
- [ ] Paste large text (>20 words) when locked (should block)
- [ ] Auto-save works

**AI Features**:
- [ ] AI locked at <150 words
- [ ] AI unlocks at >=150 words
- [ ] Chat with AI works
- [ ] Chat history displays
- [ ] AI responses are short (2-3 sentences)

**Export**:
- [ ] Export to HTML
- [ ] Export includes essay
- [ ] Export includes chat history
- [ ] Export includes statistics

---

## Performance Optimization

### Backend
- Use pagination for large datasets
- Implement caching with Redis (future)
- Optimize database queries with indexes
- Use connection pooling

### Frontend
- Lazy load components
- Implement image optimization
- Use Next.js Image component
- Minimize bundle size

---

## Future Enhancements

1. **Real-time Collaboration**
   - WebSocket support
   - Multiple users editing

2. **Advanced AI Features**
   - Plagiarism detection
   - Grammar checking
   - Citation suggestions

3. **Analytics Dashboard**
   - Writing statistics
   - AI usage patterns
   - Progress tracking

4. **Mobile App**
   - React Native version
   - Offline mode

---

## Contributing

### Pull Request Process

1. Create feature branch
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and test
```bash
npm run lint
npm run build
```

3. Commit changes
```bash
git add .
git commit -m "feat: add new feature"
```

4. Push and create PR
```bash
git push origin feature/your-feature-name
```

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

---

## Useful Commands

### Backend
```bash
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npx prisma studio    # Open database GUI
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tiptap Editor](https://tiptap.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

---

## Contact

For questions or issues, please contact the development team or create an issue in the repository.
