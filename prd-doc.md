# Product Requirements Document (PRD)
## Sistem Ketuntasan Mata Pelajaran Siswa SMK

---

## 1. Overview

### 1.1 Product Vision
Sistem digital untuk mengelola dan memvalidasi ketuntasan mata pelajaran siswa SMK sebelum mengikuti ujian, dengan alur approval bertingkat dari Guru Mata Pelajaran → Wali Kelas → Guru BK.

### 1.2 Problem Statement
Proses validasi ketuntasan siswa sebelum ujian masih manual menggunakan kertas, menyebabkan:
- Kesulitan tracking status ketuntasan per siswa
- Proses approval lambat dan tidak transparan
- Risiko kehilangan dokumen fisik
- Sulit monitoring siswa yang belum tuntas

### 1.3 Success Metrics (MVP)
- 100% digitalisasi lembar ketuntasan
- Waktu approval ≤ 3 hari per tahap
- Notifikasi real-time terkirim dalam < 5 detik
- PDF dapat digenerate dalam < 10 detik

---

## 2. Tech Stack

### 2.1 Core Technologies
- **Frontend Framework**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS + shadcn/ui
- **Real-time**: Supabase Realtime Channels
- **Authentication**: Supabase Auth
- **PDF Generation**: react-pdf atau jsPDF
- **State Management**: React Server Components + Zustand (client state)

### 2.2 Development Standards
- TypeScript (strict mode)
- ESLint + Prettier
- Conventional Commits
- Supabase Row Level Security (RLS)
- API Route Protection dengan middleware

---

## 3. User Roles & Permissions

### 3.1 Roles

| Role | Kode | Deskripsi |
|------|------|-----------|
| Admin | `ADMIN` | Mengelola ujian, lembar ketuntasan, user management |
| Guru Mata Pelajaran | `TEACHER` | Mencentang ketuntasan mapel yang diajar |
| Wali Kelas | `HOMEROOM` | Memberikan approval pertama setelah semua mapel tuntas |
| Guru BK | `COUNSELOR` | Memberikan approval final |
| Siswa | `STUDENT` | Melihat status ketuntasan dan mencetak PDF |

**Note**: 
- Seorang user bisa memiliki multiple roles (contoh: `TEACHER` + `HOMEROOM`)
- Role assignment menggunakan junction table `user_roles`

---

## 4. Database Schema

### 4.1 Core Tables

```sql
-- Users (extend Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(255) NOT NULL,
  nip VARCHAR(50) UNIQUE, -- untuk guru/admin
  nisn VARCHAR(20) UNIQUE, -- untuk siswa
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles (many-to-many)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'HOMEROOM', 'COUNSELOR', 'STUDENT')),
  metadata JSONB, -- untuk data tambahan seperti kelas yang diajar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Mata Pelajaran
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kelas
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- contoh: "XII RPL 1"
  grade_level INT NOT NULL, -- 10, 11, 12
  major VARCHAR(50), -- RPL, TKJ, MM, dll
  academic_year VARCHAR(20) NOT NULL, -- "2024/2025"
  homeroom_teacher_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Siswa per Kelas
CREATE TABLE class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Pengajaran Guru (guru mengajar mapel di kelas tertentu)
CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, class_id, academic_year)
);

-- Ujian
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(50) NOT NULL, -- UTS, UAS, UKK, dll
  academic_year VARCHAR(20) NOT NULL,
  grade_level INT NOT NULL, -- 10, 11, 12
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lembar Ketuntasan
CREATE TABLE completion_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  
  -- Status approval
  all_subjects_completed BOOLEAN DEFAULT FALSE,
  homeroom_approved BOOLEAN DEFAULT FALSE,
  homeroom_approved_by UUID REFERENCES profiles(id),
  homeroom_approved_at TIMESTAMPTZ,
  homeroom_notes TEXT,
  
  counselor_approved BOOLEAN DEFAULT FALSE,
  counselor_approved_by UUID REFERENCES profiles(id),
  counselor_approved_at TIMESTAMPTZ,
  counselor_notes TEXT,
  
  -- Status keseluruhan
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'HOMEROOM_REVIEW', 'COUNSELOR_REVIEW', 'APPROVED', 'REJECTED')),
  
  pdf_url TEXT,
  generated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(exam_id, student_id)
);

-- Detail Ketuntasan per Mata Pelajaran
CREATE TABLE completion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  completion_sheet_id UUID REFERENCES completion_sheets(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id), -- guru yang mengajar mapel ini
  
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(completion_sheet_id, subject_id)
);

-- Notifikasi
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- SUBJECT_COMPLETED, HOMEROOM_APPROVED, dll
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  metadata JSONB, -- data tambahan
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_class ON teacher_assignments(class_id);
CREATE INDEX idx_completion_sheets_student ON completion_sheets(student_id);
CREATE INDEX idx_completion_sheets_exam ON completion_sheets(exam_id);
CREATE INDEX idx_completion_sheets_status ON completion_sheets(status);
CREATE INDEX idx_completion_items_sheet ON completion_items(completion_sheet_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### 4.3 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies
-- Siswa hanya bisa melihat lembar ketuntasan sendiri
CREATE POLICY "Students can view own completion sheets"
ON completion_sheets FOR SELECT
USING (
  student_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'TEACHER', 'HOMEROOM', 'COUNSELOR')
  )
);

-- Guru hanya bisa update completion_items untuk mapel yang diajar
CREATE POLICY "Teachers can update their subject completions"
ON completion_items FOR UPDATE
USING (
  teacher_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'ADMIN'
  )
);
```

---

## 5. Business Logic & Flow

### 5.1 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN CREATES EXAM                           │
│              - Mengatur ujian dan periode                       │
│              - Generate lembar ketuntasan untuk siswa            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETION SHEET CREATED                           │
│        Status: PENDING → IN_PROGRESS                            │
│   - Auto-generate completion_items untuk semua mapel siswa      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           GURU MATA PELAJARAN MELAKUKAN CHECKLIST               │
│         - Centang completion_items untuk mapel yang diajar      │
│         - Sistem cek: Apakah semua mapel sudah tuntas?          │
│         - Jika YA → all_subjects_completed = TRUE               │
│         - Status berubah: IN_PROGRESS → HOMEROOM_REVIEW         │
│         - Notifikasi ke Wali Kelas                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              WALI KELAS MELAKUKAN APPROVAL                      │
│         - Review semua checklist dari guru mapel                │
│         - APPROVE: homeroom_approved = TRUE                     │
│         - Status: HOMEROOM_REVIEW → COUNSELOR_REVIEW            │
│         - Notifikasi ke Guru BK                                 │
│         - REJECT: Status kembali ke IN_PROGRESS                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               GURU BK MELAKUKAN APPROVAL FINAL                  │
│         - Review keseluruhan ketuntasan siswa                   │
│         - APPROVE: counselor_approved = TRUE                    │
│         - Status: COUNSELOR_REVIEW → APPROVED                   │
│         - Generate PDF                                          │
│         - Notifikasi ke Siswa                                   │
│         - REJECT: Status kembali ke IN_PROGRESS                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                SISWA DAPAT MENGIKUTI UJIAN                      │
│              - Download/Print lembar ketuntasan PDF             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Status Transitions

| From Status | Action | To Status | Actor |
|-------------|--------|-----------|-------|
| `PENDING` | Admin creates sheet | `IN_PROGRESS` | Admin |
| `IN_PROGRESS` | All subjects completed | `HOMEROOM_REVIEW` | System |
| `HOMEROOM_REVIEW` | Wali kelas approve | `COUNSELOR_REVIEW` | Homeroom |
| `HOMEROOM_REVIEW` | Wali kelas reject | `IN_PROGRESS` | Homeroom |
| `COUNSELOR_REVIEW` | Guru BK approve | `APPROVED` | Counselor |
| `COUNSELOR_REVIEW` | Guru BK reject | `IN_PROGRESS` | Counselor |

### 5.3 Business Rules

1. **Pembuatan Lembar Ketuntasan**
   - Admin membuat ujian dengan kriteria kelas/tingkat
   - Sistem auto-generate `completion_sheets` untuk semua siswa yang memenuhi kriteria
   - Sistem auto-generate `completion_items` berdasarkan `teacher_assignments` kelas siswa

2. **Checklist Guru Mata Pelajaran**
   - Guru hanya bisa mencentang mapel yang diajar (validasi via `teacher_assignments`)
   - Setelah centang, `is_completed = TRUE`, `completed_by` dan `completed_at` tercatat
   - Trigger: Jika semua `completion_items` completed → update `all_subjects_completed = TRUE`
   - Auto-change status ke `HOMEROOM_REVIEW`

3. **Approval Wali Kelas**
   - Wali kelas bisa approve hanya jika `all_subjects_completed = TRUE`
   - Bisa tambahkan catatan dalam `homeroom_notes`
   - Jika reject, status kembali ke `IN_PROGRESS`, notifikasi ke siswa

4. **Approval Guru BK**
   - Guru BK bisa approve hanya jika `homeroom_approved = TRUE`
   - Bisa tambahkan catatan dalam `counselor_notes`
   - Jika approve, trigger generate PDF
   - Jika reject, status kembali ke `IN_PROGRESS`

5. **PDF Generation**
   - Hanya bisa generate jika status = `APPROVED`
   - PDF disimpan di Supabase Storage
   - URL PDF disimpan di `pdf_url`

---

## 6. API Endpoints

### 6.1 Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### 6.2 Admin - Exams
```
GET    /api/admin/exams
POST   /api/admin/exams
GET    /api/admin/exams/:id
PATCH  /api/admin/exams/:id
DELETE /api/admin/exams/:id
POST   /api/admin/exams/:id/generate-sheets
```

### 6.3 Admin - Master Data
```
GET    /api/admin/subjects
POST   /api/admin/subjects
PATCH  /api/admin/subjects/:id
DELETE /api/admin/subjects/:id

GET    /api/admin/classes
POST   /api/admin/classes
PATCH  /api/admin/classes/:id
DELETE /api/admin/classes/:id

GET    /api/admin/teachers
POST   /api/admin/teacher-assignments
DELETE /api/admin/teacher-assignments/:id
```

### 6.4 Teacher - Completion Items
```
GET   /api/teacher/completion-sheets
GET   /api/teacher/completion-sheets/:id
PATCH /api/teacher/completion-items/:id/toggle
```

### 6.5 Homeroom - Approval
```
GET   /api/homeroom/completion-sheets
GET   /api/homeroom/completion-sheets/:id
POST  /api/homeroom/completion-sheets/:id/approve
POST  /api/homeroom/completion-sheets/:id/reject
```

### 6.6 Counselor - Approval
```
GET   /api/counselor/completion-sheets
GET   /api/counselor/completion-sheets/:id
POST  /api/counselor/completion-sheets/:id/approve
POST  /api/counselor/completion-sheets/:id/reject
```

### 6.7 Student
```
GET   /api/student/completion-sheets
GET   /api/student/completion-sheets/:id
GET   /api/student/completion-sheets/:id/pdf
```

### 6.8 Notifications
```
GET   /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

## 7. Real-time Features

### 7.1 Supabase Realtime Channels

```typescript
// Notifikasi real-time
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Show toast notification
      toast.info(payload.new.message)
    }
  )
  .subscribe()

// Status completion sheet real-time
const sheetChannel = supabase
  .channel(`completion-sheet-${sheetId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'completion_sheets',
      filter: `id=eq.${sheetId}`
    },
    (payload) => {
      // Update UI status
      updateSheetStatus(payload.new)
    }
  )
  .subscribe()
```

### 7.2 Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `SHEET_CREATED` | Admin creates completion sheet | Student |
| `SUBJECT_COMPLETED` | Teacher completes subject | Student |
| `ALL_SUBJECTS_COMPLETED` | All subjects done | Student, Homeroom |
| `HOMEROOM_APPROVED` | Homeroom approves | Student, Counselor |
| `HOMEROOM_REJECTED` | Homeroom rejects | Student |
| `COUNSELOR_APPROVED` | Counselor approves | Student |
| `COUNSELOR_REJECTED` | Counselor rejects | Student |
| `PDF_GENERATED` | PDF ready | Student |

---

## 8. UI/UX Components (shadcn/ui)

### 8.1 Core Components
- `Button` - Actions (approve, reject, submit)
- `Card` - Display completion sheets, student info
- `Badge` - Status indicators
- `Table` - List data (students, subjects, exams)
- `Dialog` - Confirm actions, add notes
- `Form` - Input data (create exam, subjects)
- `Checkbox` - Completion checklist
- `Toast` - Notifications
- `Avatar` - User profiles
- `Tabs` - Navigation (My sheets, All sheets)
- `Select` - Dropdowns (filter by class, status)
- `Sheet` - Side panel for details
- `Alert` - Important messages

### 8.2 Key Pages/Views

**Admin Dashboard**
- Exam management table
- Quick stats (total sheets, approved, pending)
- Generate completion sheets modal

**Teacher Dashboard**
- List completion sheets (filtered by subject taught)
- Completion checklist interface
- Student progress overview

**Homeroom Teacher Dashboard**
- List students in class
- Pending approval queue
- Approve/Reject modal with notes

**Counselor Dashboard**
- Final approval queue
- Student history view
- Approve/Reject modal with notes

**Student Dashboard**
- My completion status card
- Progress indicator (% completed)
- Download PDF button (if approved)
- Activity timeline

---

## 9. PDF Generation

### 9.1 PDF Content Structure
```
┌─────────────────────────────────────────────┐
│        LEMBAR KETUNTASAN SISWA              │
│              [Logo Sekolah]                 │
├─────────────────────────────────────────────┤
│ Nama Ujian: UAS Semester Genap 2024/2025   │
│ Nama Siswa: Ahmad Fauzi                     │
│ NISN: 1234567890                            │
│ Kelas: XII RPL 1                            │
│ Tanggal Generate: 15 Juni 2024              │
├─────────────────────────────────────────────┤
│ DAFTAR KETUNTASAN MATA PELAJARAN            │
├──┬───────────────┬──────────┬───────────────┤
│No│ Mata Pelajaran│ Guru     │ Status/Tgl    │
├──┼───────────────┼──────────┼───────────────┤
│1 │ Matematika    │ Bu Siti  │ ✓ 10/06/2024  │
│2 │ B. Indonesia  │ Pak Budi │ ✓ 11/06/2024  │
│...│              │          │               │
├─────────────────────────────────────────────┤
│ PERSETUJUAN                                 │
│                                             │
│ Wali Kelas: Pak Ahmad                       │
│ Tanda Tangan: [Digital Signature]           │
│ Tanggal: 13/06/2024                         │
│ Catatan: -                                  │
│                                             │
│ Guru BK: Bu Ratna                           │
│ Tanda Tangan: [Digital Signature]           │
│ Tanggal: 14/06/2024                         │
│ Catatan: Siswa layak mengikuti ujian        │
└─────────────────────────────────────────────┘
```

### 9.2 Implementation
```typescript
// Server Action untuk generate PDF
async function generateCompletionPDF(sheetId: string) {
  // 1. Fetch data lengkap
  const data = await fetchCompletionSheetData(sheetId)
  
  // 2. Generate PDF menggunakan jsPDF/react-pdf
  const pdf = await createPDF(data)
  
  // 3. Upload ke Supabase Storage
  const { data: uploadData } = await supabase.storage
    .from('completion-pdfs')
    .upload(`${sheetId}.pdf`, pdf)
  
  // 4. Update completion_sheet dengan URL
  await supabase
    .from('completion_sheets')
    .update({ 
      pdf_url: uploadData.path,
      generated_at: new Date()
    })
    .eq('id', sheetId)
  
  // 5. Send notification
  await createNotification({
    user_id: data.student_id,
    type: 'PDF_GENERATED',
    title: 'Lembar Ketuntasan Siap',
    message: 'Lembar ketuntasan Anda sudah dapat diunduh'
  })
}
```

---

## 10. MVP Feature Checklist

### 10.1 Phase 1 - Core Setup (Week 1-2)
- [ ] Setup Next.js + Supabase project
- [ ] Database schema implementation
- [ ] Authentication setup
- [ ] RLS policies implementation
- [ ] Basic role management

### 10.2 Phase 2 - Admin Features (Week 2-3)
- [ ] Create/manage exams
- [ ] Master data management (subjects, classes, teachers)
- [ ] Generate completion sheets for students
- [ ] Teacher assignment management

### 10.3 Phase 3 - Teacher Features (Week 3-4)
- [ ] View assigned completion sheets
- [ ] Toggle completion checklist
- [ ] View student progress
- [ ] Real-time status updates

### 10.4 Phase 4 - Approval Flow (Week 4-5)
- [ ] Homeroom teacher approval interface
- [ ] Counselor approval interface
- [ ] Rejection flow with notes
- [ ] Status transition logic

### 10.5 Phase 5 - Student & PDF (Week 5-6)
- [ ] Student dashboard
- [ ] Progress tracking
- [ ] PDF generation
- [ ] PDF download

### 10.6 Phase 6 - Notifications & Polish (Week 6-7)
- [ ] Real-time notifications
- [ ] Notification center
- [ ] Toast messages
- [ ] Email notifications (optional)
- [ ] Audit logging
- [ ] UI/UX refinement

---

## 11. Non-Functional Requirements

### 11.1 Performance
- Page load time < 2 seconds
- API response time < 500ms (95th percentile)
- Real-time notification latency < 5 seconds
- Support 1000+ concurrent users

### 11.2 Security
- All routes protected with authentication middleware
- RLS enabled on all sensitive tables
- Input validation on all forms
- SQL injection prevention (using Supabase query builder)
- XSS prevention (React default escaping)
- CSRF protection

### 11.3 Scalability Considerations
- Efficient database indexing
- Pagination for large datasets (100 items per page)
- Lazy loading for completion sheets
- Optimistic UI updates
- Server-side rendering untuk SEO

### 11.4 Monitoring & Logging
- Error tracking (Sentry recommended)
- Performance monitoring
- Audit logs untuk critical actions
- Database query monitoring

---

## 12. Future Enhancements (Post-MVP)

### 12.1 Phase 2 Features
- Bulk operations (approve multiple sheets)
- Advanced filtering & search
- Export data to Excel
- Analytics dashboard (completion rates, bottlenecks)
- Mobile app (React Native)

### 12.2 Phase 3 Features
- Integration dengan sistem akademik existing
- WhatsApp notifications
- E-signature untuk approval
- Multi-language support
- Parent portal (orang tua bisa melihat progress)

### 12.3 Advanced Features
- AI-powered anomaly detection (siswa sering terlambat checklist)
- Automated reminders
- Smart scheduling untuk deadline
- Predictive analytics

---

## 13. Testing Strategy

### 13.1 Testing Types
- **Unit Tests**: Utilities, helpers, business logic functions
- **Integration Tests**: API routes, Server Actions
- **E2E Tests**: Critical user flows (Playwright)
- **Manual Testing**: UI/UX, cross-browser

### 13.2 Critical Test Cases
1. Approval flow (semua path: approve, reject)
2. Permission enforcement (RLS)
3. Real-time notifications
4. PDF generation accuracy
5. Concurrent updates handling
6. Edge cases (partial completion, role changes)

---

## 14. Deployment Strategy

### 14.1 Environments
- **Development**: Local development
- **Staging**: Testing environment (Vercel preview)
- **Production**: Live environment (Vercel production)

### 14.2 CI/CD Pipeline
1. Code push to GitHub
2. Automated tests run
3. Build Next.js app
4. Deploy to Vercel
5. Run database migrations (Supabase)
6. Smoke tests

### 14.3 Rollback Plan
- Vercel instant rollback
- Database migration rollback scripts
- Backup strategy (daily snapshots)

---

## 15. Documentation Requirements

### 15.1 Technical Docs
- API documentation (OpenAPI/Swagger)
- Database schema documentation
- Deployment guide
- Environment variables guide

### 15.2 User Docs
- Admin user guide
- Teacher user guide
- Student user guide
- FAQ

---

## 16. Success Criteria

### MVP Success Metrics
- ✅ All user roles dapat login dan akses sesuai permission
- ✅ Admin dapat membuat ujian dan generate lembar ketuntasan
- ✅ Guru dapat checklist completion items
- ✅ Wali kelas dan Guru BK dapat approve/reject
- ✅ Siswa dapat download PDF setelah approved
- ✅ Notifikasi real-time berfungsi
- ✅ Tidak ada critical bugs dalam production

### Long-term Success Metrics
- 95% user adoption rate
- < 5% rejection rate di approval flow
- Average completion time < 7 hari
- User satisfaction score > 4/5

---

## 17. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Concurrent updates conflict | High | Optimistic locking, last-write-wins |
| Real-time connection drop | Medium | Reconnection logic, fallback polling |
| PDF generation failure | High | Retry mechanism, error logging |
| Role confusion (teacher+homeroom) | Medium | Clear UI indication of current role context |
| Database performance degradation | High | Proper indexing, query optimization |

---

## Appendix A: Example User Flows

### Flow 1: Admin Membuat Ujian dan Generate Sheets
1. Admin login → Dashboard
2. Klik "Buat Ujian Baru"
3. Isi form: Nama, Tipe, Periode, Tingkat Kelas
4. Submit → Ujian created
5. Klik "Generate Lembar Ketuntasan"
6. Pilih kelas yang akan ikut ujian
7. Confirm → Sistem generate sheets untuk semua siswa
8. Notifikasi terkirim ke semua siswa

### Flow 2: Guru Checklist Ketuntasan
1. Guru login → Dashboard
2. Tab "Lembar Ketuntasan" menampilkan list siswa di kelas yang diajar
3. Filter berdasarkan mata pelajaran yang diajar
4. Klik salah satu siswa → Detail lembar ketuntasan
5. Centang checkbox untuk mapel yang diajar
6. Tambahkan notes (optional)
7. Submit → completion_item updated
8. Sistem auto-cek: Jika semua mapel sudah tuntas → Status berubah ke HOMEROOM_REVIEW
9. Notifikasi terkirim ke Wali Kelas dan Siswa

### Flow 3: Wali Kelas Approval
1. Wali Kelas login → Dashboard
2. Notifikasi: "Ada 5 siswa menunggu approval"
3. Tab "Pending Approval" → List siswa dengan status HOMEROOM_REVIEW
4. Klik siswa → Review semua checklist dari guru mapel
5. Pilih action:
   - **Approve**: Isi notes → Confirm → Status → COUNSELOR_REVIEW → Notifikasi ke Guru BK
   - **Reject**: Isi alasan → Confirm → Status → IN_PROGRESS → Notifikasi ke Siswa

### Flow 4: Guru BK Final Approval
1. Guru BK login → Dashboard
2. Notifikasi: "Ada 3 siswa menunggu approval final"
3. Tab "Final Approval" → List siswa dengan status COUNSELOR_REVIEW
4. Klik siswa → Review lengkap (semua checklist + approval wali kelas)
5. Pilih action:
   - **Approve**: Isi notes → Confirm → Status → APPROVED → Trigger PDF generation → Notifikasi ke Siswa
   - **Reject**: Isi alasan → Confirm → Status → IN_PROGRESS → Notifikasi ke Siswa

### Flow 5: Siswa Download PDF
1. Siswa login → Dashboard
2. Card "Status Ketuntasan": Progress bar menunjukkan persentase
3. Jika status = APPROVED: Button "Download Lembar Ketuntasan" aktif
4. Klik download → PDF terbuka/terunduh
5. Siswa bisa print untuk diserahkan saat ujian

---

## Appendix B: Database Triggers & Functions

### Trigger: Auto-update status ketika semua mapel tuntas

```sql
CREATE OR REPLACE FUNCTION check_all_subjects_completed()
RETURNS TRIGGER AS $
BEGIN
  -- Cek apakah semua completion_items sudah completed
  IF NOT EXISTS (
    SELECT 1 FROM completion_items
    WHERE completion_sheet_id = NEW.completion_sheet_id
    AND is_completed = FALSE
  ) THEN
    -- Update completion_sheet
    UPDATE completion_sheets
    SET 
      all_subjects_completed = TRUE,
      status = 'HOMEROOM_REVIEW',
      updated_at = NOW()
    WHERE id = NEW.completion_sheet_id;
    
    -- Kirim notifikasi ke wali kelas
    INSERT INTO notifications (user_id, type, title, message, metadata)
    SELECT 
      c.homeroom_teacher_id,
      'ALL_SUBJECTS_COMPLETED',
      'Siswa Siap untuk Approval',
      'Siswa ' || p.full_name || ' telah menyelesaikan semua mata pelajaran',
      jsonb_build_object('completion_sheet_id', NEW.completion_sheet_id)
    FROM completion_sheets cs
    JOIN classes c ON cs.class_id = c.id
    JOIN profiles p ON cs.student_id = p.id
    WHERE cs.id = NEW.completion_sheet_id;
    
    -- Kirim notifikasi ke siswa
    INSERT INTO notifications (user_id, type, title, message, metadata)
    SELECT 
      cs.student_id,
      'ALL_SUBJECTS_COMPLETED',
      'Semua Mata Pelajaran Tuntas!',
      'Lembar ketuntasan Anda sedang menunggu approval dari wali kelas',
      jsonb_build_object('completion_sheet_id', NEW.completion_sheet_id)
    FROM completion_sheets cs
    WHERE cs.id = NEW.completion_sheet_id;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_all_subjects_completed
AFTER UPDATE OF is_completed ON completion_items
FOR EACH ROW
WHEN (NEW.is_completed = TRUE)
EXECUTE FUNCTION check_all_subjects_completed();
```

### Trigger: Auto-create audit log

```sql
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Apply ke tabel penting
CREATE TRIGGER audit_completion_sheets
AFTER INSERT OR UPDATE OR DELETE ON completion_sheets
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_completion_items
AFTER INSERT OR UPDATE OR DELETE ON completion_items
FOR EACH ROW EXECUTE FUNCTION create_audit_log();
```

### Function: Generate completion items saat sheet dibuat

```sql
CREATE OR REPLACE FUNCTION generate_completion_items(
  p_completion_sheet_id UUID,
  p_class_id UUID,
  p_academic_year VARCHAR
)
RETURNS VOID AS $
BEGIN
  -- Insert completion_items berdasarkan teacher_assignments
  INSERT INTO completion_items (
    completion_sheet_id,
    subject_id,
    teacher_id
  )
  SELECT 
    p_completion_sheet_id,
    ta.subject_id,
    ta.teacher_id
  FROM teacher_assignments ta
  WHERE 
    ta.class_id = p_class_id
    AND ta.academic_year = p_academic_year
    AND ta.is_active = TRUE;
END;
$ LANGUAGE plpgsql;
```

---

## Appendix C: Server Actions Examples

### Server Action: Toggle Completion Item

```typescript
// app/actions/completion-items.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCompletionItem(
  itemId: string,
  notes?: string
) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Get current item
  const { data: item } = await supabase
    .from('completion_items')
    .select('*, completion_sheets(student_id)')
    .eq('id', itemId)
    .single()
  
  // Check if user is the teacher for this subject
  if (item.teacher_id !== user.id) {
    throw new Error('Not authorized to update this item')
  }
  
  // Toggle completion
  const { data, error } = await supabase
    .from('completion_items')
    .update({
      is_completed: !item.is_completed,
      completed_by: !item.is_completed ? user.id : null,
      completed_at: !item.is_completed ? new Date().toISOString() : null,
      notes: notes || item.notes
    })
    .eq('id', itemId)
    .select()
    .single()
  
  if (error) throw error
  
  // Send notification to student
  if (data.is_completed) {
    await supabase
      .from('notifications')
      .insert({
        user_id: item.completion_sheets.student_id,
        type: 'SUBJECT_COMPLETED',
        title: 'Mata Pelajaran Tuntas',
        message: `Guru telah menandai ketuntasan mata pelajaran Anda`,
        metadata: { completion_item_id: itemId }
      })
  }
  
  revalidatePath('/teacher/completion-sheets')
  return data
}
```

### Server Action: Homeroom Approval

```typescript
// app/actions/homeroom.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveAsHomeroom(
  sheetId: string,
  notes?: string
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Verify user is homeroom teacher
  const { data: sheet } = await supabase
    .from('completion_sheets')
    .select('*, classes(homeroom_teacher_id)')
    .eq('id', sheetId)
    .single()
  
  if (sheet.classes.homeroom_teacher_id !== user.id) {
    throw new Error('Not authorized')
  }
  
  // Verify all subjects are completed
  if (!sheet.all_subjects_completed) {
    throw new Error('Not all subjects completed')
  }
  
  // Update approval
  const { error } = await supabase
    .from('completion_sheets')
    .update({
      homeroom_approved: true,
      homeroom_approved_by: user.id,
      homeroom_approved_at: new Date().toISOString(),
      homeroom_notes: notes,
      status: 'COUNSELOR_REVIEW'
    })
    .eq('id', sheetId)
  
  if (error) throw error
  
  // Get counselor for this class
  const { data: counselor } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'COUNSELOR')
    .limit(1)
    .single()
  
  // Send notifications
  await supabase.from('notifications').insert([
    {
      user_id: sheet.student_id,
      type: 'HOMEROOM_APPROVED',
      title: 'Wali Kelas Menyetujui',
      message: 'Lembar ketuntasan Anda telah disetujui wali kelas',
      metadata: { completion_sheet_id: sheetId }
    },
    {
      user_id: counselor.user_id,
      type: 'HOMEROOM_APPROVED',
      title: 'Menunggu Approval Final',
      message: 'Ada siswa yang memerlukan approval final dari Anda',
      metadata: { completion_sheet_id: sheetId }
    }
  ])
  
  revalidatePath('/homeroom/completion-sheets')
}

export async function rejectAsHomeroom(
  sheetId: string,
  reason: string
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: sheet } = await supabase
    .from('completion_sheets')
    .select('student_id')
    .eq('id', sheetId)
    .single()
  
  // Update status
  const { error } = await supabase
    .from('completion_sheets')
    .update({
      homeroom_approved: false,
      homeroom_notes: reason,
      status: 'IN_PROGRESS'
    })
    .eq('id', sheetId)
  
  if (error) throw error
  
  // Notify student
  await supabase
    .from('notifications')
    .insert({
      user_id: sheet.student_id,
      type: 'HOMEROOM_REJECTED',
      title: 'Lembar Ketuntasan Ditolak',
      message: `Wali kelas menolak lembar ketuntasan: ${reason}`,
      metadata: { completion_sheet_id: sheetId }
    })
  
  revalidatePath('/homeroom/completion-sheets')
}
```

### Server Action: Counselor Final Approval

```typescript
// app/actions/counselor.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generatePDF } from '@/lib/pdf-generator'

export async function approveAsCounselor(
  sheetId: string,
  notes?: string
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Verify homeroom already approved
  const { data: sheet } = await supabase
    .from('completion_sheets')
    .select('*')
    .eq('id', sheetId)
    .single()
  
  if (!sheet.homeroom_approved) {
    throw new Error('Homeroom not approved yet')
  }
  
  // Update approval
  const { error } = await supabase
    .from('completion_sheets')
    .update({
      counselor_approved: true,
      counselor_approved_by: user.id,
      counselor_approved_at: new Date().toISOString(),
      counselor_notes: notes,
      status: 'APPROVED'
    })
    .eq('id', sheetId)
  
  if (error) throw error
  
  // Generate PDF in background
  try {
    const pdfUrl = await generatePDF(sheetId)
    
    await supabase
      .from('completion_sheets')
      .update({
        pdf_url: pdfUrl,
        generated_at: new Date().toISOString()
      })
      .eq('id', sheetId)
  } catch (pdfError) {
    console.error('PDF generation failed:', pdfError)
    // Don't fail the approval, just log error
  }
  
  // Notify student
  await supabase
    .from('notifications')
    .insert({
      user_id: sheet.student_id,
      type: 'COUNSELOR_APPROVED',
      title: 'Lembar Ketuntasan Disetujui!',
      message: 'Selamat! Anda sudah dapat mengikuti ujian. Silakan download lembar ketuntasan.',
      metadata: { completion_sheet_id: sheetId }
    })
  
  revalidatePath('/counselor/completion-sheets')
}
```

---

## Appendix D: Component Examples

### Component: Completion Checklist

```typescript
// components/completion-checklist.tsx
'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toggleCompletionItem } from '@/app/actions/completion-items'
import { useState } from 'react'
import { toast } from 'sonner'

interface CompletionChecklistProps {
  items: CompletionItem[]
  canEdit: boolean
}

export function CompletionChecklist({ items, canEdit }: CompletionChecklistProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  
  const handleToggle = async (itemId: string) => {
    setLoading(itemId)
    try {
      await toggleCompletionItem(itemId, notes[itemId])
      toast.success('Ketuntasan diperbarui')
    } catch (error) {
      toast.error('Gagal memperbarui ketuntasan')
    } finally {
      setLoading(null)
    }
  }
  
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={item.is_completed}
              onCheckedChange={() => handleToggle(item.id)}
              disabled={!canEdit || loading === item.id}
            />
            <div className="flex-1">
              <div className="font-medium">{item.subject.name}</div>
              <div className="text-sm text-muted-foreground">
                Guru: {item.teacher.full_name}
              </div>
              {item.is_completed && (
                <div className="text-sm text-green-600 mt-1">
                  ✓ Tuntas pada {new Date(item.completed_at).toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
          </div>
          
          {canEdit && !item.is_completed && (
            <Textarea
              placeholder="Catatan (optional)"
              value={notes[item.id] || ''}
              onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
              className="mt-3"
            />
          )}
          
          {item.notes && (
            <div className="mt-3 p-3 bg-muted rounded text-sm">
              <strong>Catatan:</strong> {item.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Component: Status Badge

```typescript
// components/status-badge.tsx
import { Badge } from '@/components/ui/badge'

const statusConfig = {
  PENDING: { label: 'Menunggu', variant: 'secondary' },
  IN_PROGRESS: { label: 'Proses', variant: 'default' },
  HOMEROOM_REVIEW: { label: 'Review Wali Kelas', variant: 'warning' },
  COUNSELOR_REVIEW: { label: 'Review Guru BK', variant: 'warning' },
  APPROVED: { label: 'Disetujui', variant: 'success' },
  REJECTED: { label: 'Ditolak', variant: 'destructive' },
} as const

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig]
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}
```

### Component: Progress Indicator

```typescript
// components/progress-indicator.tsx
import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  total: number
  completed: number
}

export function ProgressIndicator({ total, completed }: ProgressIndicatorProps) {
  const percentage = (completed / total) * 100
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Ketuntasan Mata Pelajaran</span>
        <span className="font-medium">{completed}/{total}</span>
      </div>
      <Progress value={percentage} />
      <p className="text-xs text-muted-foreground">
        {percentage === 100 
          ? '🎉 Semua mata pelajaran tuntas!' 
          : `${total - completed} mata pelajaran tersisa`}
      </p>
    </div>
  )
}
```

---

## Appendix E: Realtime Hook Example

```typescript
// hooks/use-realtime-notifications.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()
  
  useEffect(() => {
    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications((prev) => [newNotif, ...prev])
          
          // Show toast
          toast(newNotif.title, {
            description: newNotif.message,
            action: newNotif.link ? {
              label: 'Lihat',
              onClick: () => window.location.href = newNotif.link
            } : undefined
          })
        }
      )
      .subscribe()
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) setNotifications(data)
    }
    
    fetchNotifications()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
  
  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
    
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    )
  }
  
  const unreadCount = notifications.filter((n) => !n.is_read).length
  
  return {
    notifications,
    unreadCount,
    markAsRead
  }
}
```

---

## Appendix F: Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# PDF Generation (optional cloud service)
PDF_API_KEY=your_pdf_api_key

# Email (optional for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

---

## Appendix G: Migration Strategy

### From Manual to Digital System

#### Phase 1: Data Preparation (Week 1)
1. Export existing data (siswa, guru, kelas, mapel)
2. Clean and normalize data
3. Prepare CSV/Excel templates for bulk import
4. Create seed scripts

#### Phase 2: Pilot Testing (Week 2-3)
1. Select 1-2 kelas untuk pilot
2. Train admin, guru, dan siswa
3. Run parallel (manual + digital)
4. Collect feedback

#### Phase 3: Gradual Rollout (Week 4-6)
1. Week 4: Kelas 12 (priority - ujian lebih dulu)
2. Week 5: Kelas 11
3. Week 6: Kelas 10
4. Monitor adoption dan support users

#### Phase 4: Full Migration (Week 7-8)
1. Stop manual process
2. 100% digital
3. Retrospective dan improvement

### Data Import Scripts

```typescript
// scripts/import-students.ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as Papa from 'papaparse'

async function importStudents() {
  const supabase = createClient(url, key)
  
  const csv = fs.readFileSync('data/students.csv', 'utf8')
  const { data } = Papa.parse(csv, { header: true })
  
  for (const row of data) {
    // Create auth user
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: row.email,
      password: row.nisn, // temporary password
      email_confirm: true
    })
    
    // Create profile
    await supabase.from('profiles').insert({
      id: authUser.user.id,
      full_name: row.full_name,
      nisn: row.nisn,
      email: row.email
    })
    
    // Assign role
    await supabase.from('user_roles').insert({
      user_id: authUser.user.id,
      role: 'STUDENT'
    })
    
    // Assign to class
    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('name', row.class_name)
      .single()
    
    await supabase.from('class_students').insert({
      class_id: classData.id,
      student_id: authUser.user.id
    })
  }
  
  console.log('Students imported successfully')
}

importStudents()
```

---

## Appendix H: Maintenance & Support Plan

### Regular Maintenance Tasks

#### Daily
- Monitor error logs (Sentry)
- Check real-time connection health
- Review notification delivery rates

#### Weekly
- Database performance review
- User feedback review
- Backup verification
- Security scan

#### Monthly
- Database optimization (vacuum, reindex)
- User analytics review
- Feature usage statistics
- Cost optimization review

### Support Tiers

#### Tier 1: Self-Service
- FAQ documentation
- Video tutorials
- In-app help tooltips

#### Tier 2: Admin Support
- Admin dashboard untuk handle common issues
- Bulk operations untuk fix data
- Manual approval override (emergency)

#### Tier 3: Developer Support
- Bug fixes
- Database issues
- Integration problems
- Critical incidents

### SLA (Service Level Agreement)

| Priority | Response Time | Resolution Time |
|----------|---------------|-----------------|
| P1 - Critical (system down) | 1 hour | 4 hours |
| P2 - High (feature broken) | 4 hours | 24 hours |
| P3 - Medium (minor issue) | 24 hours | 72 hours |
| P4 - Low (enhancement) | 1 week | As planned |

---

## Summary

PRD ini menyediakan blueprint lengkap untuk membangun **Sistem Ketuntasan Mata Pelajaran Siswa SMK** dengan fokus pada:

✅ **Skalabilitas** - Arsitektur yang bisa berkembang  
✅ **Keamanan** - RLS, authentication, audit logging  
✅ **User Experience** - Real-time updates, clear workflows  
✅ **Maintainability** - Clean code, documentation, testing  
✅ **MVP First** - Start small, iterate fast  

**Estimasi Timeline MVP**: 6-7 minggu  
**Estimasi Budget**: Rp 50-75 juta (tergantung tim)  
**Team Requirement**: 2 developers, 1 QA, 1 PM

---

**Document Version**: 1.0  
**Last Updated**: January 14, 2026  
**Author**: Product Team  
**Status**: Ready for Development