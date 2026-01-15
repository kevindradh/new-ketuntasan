export type UserRole = 'ADMIN' | 'TEACHER' | 'HOMEROOM' | 'COUNSELOR' | 'STUDENT'

export type CompletionStatus = 'PENDING' | 'IN_PROGRESS' | 'HOMEROOM_REVIEW' | 'COUNSELOR_REVIEW' | 'APPROVED' | 'REJECTED'

export interface Profile {
    id: string
    full_name: string
    nip?: string
    nisn?: string
    email: string
    phone?: string
    avatar_url?: string
    created_at: string
    updated_at: string
}

export interface UserRoleRecord {
    id: string
    user_id: string
    role: UserRole
    metadata?: Record<string, unknown>
    created_at: string
}

export interface Subject {
    id: string
    code: string
    name: string
    description?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Class {
    id: string
    name: string
    grade_level: number
    major?: string
    academic_year: string
    homeroom_teacher_id?: string
    homeroom_teacher?: Profile
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ClassStudent {
    id: string
    class_id: string
    student_id: string
    enrollment_date: string
    created_at: string
    class?: Class
    student?: Profile
}

export interface TeacherAssignment {
    id: string
    teacher_id: string
    subject_id: string
    class_id: string
    academic_year: string
    is_active: boolean
    created_at: string
    teacher?: Profile
    subject?: Subject
    class?: Class
}

export interface Exam {
    id: string
    name: string
    exam_type: string
    academic_year: string
    grade_level: number
    start_date: string
    end_date: string
    created_by?: string
    created_at: string
    updated_at: string
}

export interface CompletionSheet {
    id: string
    exam_id: string
    student_id: string
    class_id: string
    all_subjects_completed: boolean
    homeroom_approved: boolean
    homeroom_approved_by?: string
    homeroom_approved_at?: string
    homeroom_notes?: string
    counselor_approved: boolean
    counselor_approved_by?: string
    counselor_approved_at?: string
    counselor_notes?: string
    status: CompletionStatus
    pdf_url?: string
    generated_at?: string
    created_at: string
    updated_at: string
    // Joined data
    exam?: Exam
    student?: Profile
    class?: Class
    completion_items?: CompletionItem[]
}

export interface CompletionItem {
    id: string
    completion_sheet_id: string
    subject_id: string
    teacher_id?: string
    is_completed: boolean
    completed_by?: string
    completed_at?: string
    notes?: string
    created_at: string
    updated_at: string
    // Joined data
    subject?: Subject
    teacher?: Profile
}

export interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    message: string
    link?: string
    is_read: boolean
    read_at?: string
    metadata?: Record<string, unknown>
    created_at: string
}

export interface AuditLog {
    id: string
    user_id?: string
    action: string
    entity_type: string
    entity_id?: string
    old_data?: Record<string, unknown>
    new_data?: Record<string, unknown>
    ip_address?: string
    user_agent?: string
    created_at: string
}

// Dashboard stats
export interface DashboardStats {
    totalSheets: number
    pendingSheets: number
    approvedSheets: number
    rejectedSheets: number
    inProgressSheets: number
}

// User with roles
export interface UserWithRoles extends Profile {
    roles: UserRole[]
}
