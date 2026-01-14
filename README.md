# MITRA-AI Platform

MITRA-AI adalah platform penulisan akademik berbasis web yang memaksa mahasiswa untuk melakukan inisiasi pemikiran mandiri sebelum berkolaborasi dengan AI.

---

## 🏆 Juri Access

### Quick Access Credentials
- **Email**: `demo@gmail.com`
- **Password**: `demo123`
- **Role**: Demo User (Full feature access)

### 🚀 How to Access
1. Visit the login page at `http://localhost:3000/login`
2. Click the **"🚀 Use Juri Credentials"** button at the top
3. Credentials will be automatically filled in the form
4. Click **"Sign In"** to enter the dashboard

### ✅ Available Features for Testing
- **📝 Smart Editor**: Rich text editor with paste protection
- **🤖 AI Lock System**: AI unlocks after 150 words
- **💬 Socratic AI Tutor**: Question-based AI assistance
- **📊 Word Count Tracking**: Real-time progress monitoring
- **📁 File Upload System**: Upload images and documents
- **😈 Devil's Advocate Mode**: Challenge your arguments
- **✅ Grammar Checker**: Improve writing quality
- **🛡️ Plagiarism Detection**: Ensure academic integrity
- **📚 Citation Suggestions**: Find relevant academic sources
- **📈 Analytics Dashboard**: Track usage and performance
- **📱 Mobile-Responsive**: Works on all devices
- **📄 Export Functionality**: Download complete reports

#---

## 🔐 Authentication System

### Login vs Register

#### **Login Flow**
- **Purpose**: Access existing account
- **Process**: Email + password validation
- **Security**: JWT token generation, account lockout protection
- **Features**: Rate limiting, failed attempt tracking, reCAPTCHA support

#### **Register Flow**
- **Purpose**: Create new user account
- **Process**: Email + password + optional name
- **Validation**: Email uniqueness, password strength
- **Security**: Password hashing, input sanitization

### User Roles
- **USER**: Standard user with full feature access
- **ADMIN**: Administrative access to management dashboard
- **Juri Demo**: Special demo account (demo@gmail.com) for judges

### Security Features Implemented
- **Rate Limiting**: 5 attempts per 5 minutes per IP
- **Account Lockout**: Progressive lockout (15min → 60min)
- **Password Security**: bcrypt hashing with 10 salt rounds
- **Input Validation**: Anti-SQL injection, XSS protection
- **Bot Detection**: Google reCAPTCHA v2 integration

---

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
