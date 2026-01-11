# MITRA-AI Platform

MITRA-AI adalah platform penulisan akademik berbasis web yang memaksa mahasiswa untuk melakukan inisiasi pemikiran mandiri sebelum berkolaborasi dengan AI.

## Fitur Utama

- **Smart Editor**: Editor teks dengan Tiptap yang mencegah copy-paste (>20 kata) di fase awal
- **AI Lock System**: AI terkunci sampai pengguna menulis 150 kata
- **Socratic AI Tutor**: AI yang bertanya balik dan mengkritik argumen, bukan membuatkan esai
- **Word Count Tracking**: Pelacakan real-time menuju pembukaan fitur AI
- **Chat History**: Riwayat interaksi AI yang lengkap untuk referensi
- **Export Report**: Ekspor lengkap dengan esai, log chat, dan statistik

## Teknologi

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- OpenAI API
- JWT Authentication

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Tiptap Editor
- Axios

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/mitra_ai?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="sk-your-openai-api-key"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

5. Run Prisma migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

6. Start the backend server:
```bash
npm run start:dev
```

Backend akan berjalan di `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start the frontend dev server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (requires auth)

### Projects
- `POST /projects` - Create project baru
- `GET /projects` - Get semua project user
- `GET /projects/:id` - Get detail project
- `PATCH /projects/:id/save` - Simpan konten project
- `PATCH /projects/:id/finish` - Tandai project selesai
- `DELETE /projects/:id` - Delete project

### AI
- `POST /ai/analyze` - Get feedback AI (requires 150 words)
- `GET /ai/chat-history/:projectId` - Get riwayat chat

## Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables di dashboard Render
3. Deploy sebagai Web Service

### Frontend (Vercel)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` ke URL backend Render
3. Deploy

## Struktur Proyek

```
lomba-fkmpi/
├── server/              # Backend NestJS
│   ├── src/
│   │   ├── auth/       # Authentication module
│   │   ├── projects/   # Projects module
│   │   ├── ai/         # AI module
│   │   ├── prisma/     # Database service
│   │   └── common/     # Guards, decorators
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── frontend/            # Frontend Next.js
    ├── src/
    │   ├── app/        # Next.js App Router
    │   ├── components/  # React components
    │   ├── lib/        # Utilities & API
    │   └── types/      # TypeScript types
    └── package.json
```

## License

MIT License
