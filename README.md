# Si-Tuntas

Sistem Ketuntasan Mata Pelajaran Siswa SMK - Digital platform untuk mengelola dan memvalidasi ketuntasan mata pelajaran siswa sebelum mengikuti ujian.

## 🎯 Features

- **Role-Based Access Control** - 5 user roles: Admin, Teacher, Homeroom, Counselor, Student
- **Digital Completion Sheets** - Replace paper-based tracking
- **Multi-Level Approval** - Teacher → Homeroom → Counselor workflow
- **Real-time Notifications** - Instant updates for all stakeholders
- **PDF Generation** - Download completion certificates

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **PDF**: jsPDF

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/si-tuntas.git
cd si-tuntas

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.situntas.id | password123 |
| Teacher | budi@demo.situntas.id | password123 |
| Homeroom | dewi@demo.situntas.id | password123 |
| Counselor | wahyu@demo.situntas.id | password123 |
| Student | andi@demo.situntas.id | password123 |

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Authentication pages
│   ├── (dashboard)/  # Dashboard pages
│   │   ├── admin/    # Admin pages
│   │   ├── teacher/  # Teacher pages
│   │   ├── homeroom/ # Homeroom pages
│   │   ├── counselor/# Counselor pages
│   │   └── student/  # Student pages
├── actions/          # Server actions
├── components/       # React components
│   ├── layout/       # Layout components
│   └── ui/           # shadcn/ui components
├── hooks/            # React hooks
├── lib/              # Utility functions
│   └── supabase/     # Supabase clients
└── types/            # TypeScript types
```

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_APP_URL` | Application URL |

## 📊 Database Schema

Key tables:
- `profiles` - User profiles
- `user_roles` - Role assignments
- `subjects` - Subject master data
- `classes` - Class management
- `exams` - Exam periods
- `completion_sheets` - Per-student completion tracking
- `completion_items` - Per-subject completion status
- `notifications` - Real-time notifications

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/si-tuntas)

1. Click the button above or go to [Vercel](https://vercel.com)
2. Import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

## 📝 License

MIT License
