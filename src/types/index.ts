// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface AdminUser {
  user_id: number;
  f_name: string;
  email: string;
  profile_pic?: string;
  user_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
  message?: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  total_employers: number;
  total_recruiters: number;
  total_jobs: number;
  active_jobs: number;
  jobs_filled: number;
  total_job_seekers: number;
  total_applications: number;
  shortlisted_candidates: number;
  recent_jobs: any[];
  recent_applications: any[];
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  color: string;
}

export interface ActivityItem {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}

// ─── Table Types ─────────────────────────────────────────────────────────────

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

// ─── Master Data Types ───────────────────────────────────────────────────────

export interface MasterDataItem {
  id: number;
  name: string;
  slug: string;
  count?: number;
  is_visible: boolean | number;
  is_featured?: boolean | number;
  icon?: string;
  image?: string;
  country?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  isNew?: boolean;
  icon_preview?: any;
  icon_file?: File;
}

export type MasterDataTab =
  | "categories"
  | "locations"
  | "skills"
  | "institutes"
  | "recruiters"
  | "jobs"
  | "jobseekers";

// ─── Plan Types ──────────────────────────────────────────────────────────────

export interface Plan {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  duration: string;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
  subscribers?: number;
}

export interface PlanCardProps {
  plan: Plan;
  onEdit?: (plan: Plan) => void;
  onToggle?: (plan: Plan) => void;
}

// ─── Deleted Items Types ─────────────────────────────────────────────────────

export interface DeletedItem {
  id: number;
  name: string;
  email?: string;
  type: string;
  deleted_at: string;
  deleted_by?: string;
}


export type DeletedItemTab =
  | "users"
  | "jobs"
  | "employers"
  | "cvs"
  | "applications"
  | "institutes";

// ─── CMS Types ───────────────────────────────────────────────────────────────

export interface CMSSection {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  last_updated: string;
  icon: string;
}

// ─── SEO Types ───────────────────────────────────────────────────────────────

export interface SEOSetting {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string;
  og_image?: string;
}

// ─── Job Types ───────────────────────────────────────────────────────────────

export interface Job {
  id: number;
  employer_id: number;
  category_id: number;
  title: string;
  description: string;
  salary_min: string | number;
  salary_max: string | number;
  vacancies: number;
  location: string;
  experience_required: number;
  experience_type: string;
  job_type: string;
  job_status: string;
  status: "pending" | "approved" | "rejected";
  featured: number | boolean;
  admin_featured: number | boolean;
  application_deadline: string | null;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  is_active: number | boolean;
  employer?: {
    id: number;
    company_name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

// ─── User Types ──────────────────────────────────────────────────────────────

export interface JobSeeker {
  id: number;
  user_id: number;
  title?: string | null;
  phone: string;
  location: string;
  experience_years: number;
  availability: string;
  dob?: string;
  profile_photo?: string;
  is_active?: number | boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Recruiter {
  id: number;
  employer_id: number;
  name: string;
  email: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
  employer?: {
    id: number;
    company_name: string;
  };
  jobs_count?: number;
}

export interface Employer {
  id: number;
  company_name: string;
  company_description?: string;
  industry: string;
  institution_type: string;
  website?: string;
  company_logo?: string;
  address: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  is_profile_verified: number | boolean;
  is_verified: number | boolean;
  is_featured: number | boolean;
  company_featured: number | boolean;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  created_at: string;
  updated_at: string;
  jobs_count?: number;
}

// ─── Application Types ──────────────────────────────────────────────────────

export interface Application {
  id: number;
  job_id: number;
  job_seeker_id: number;
  resume_id?: number;
  resume_type?: string;
  cover_letter?: string | null;
  status: "applied" | "shortlisted" | "interviewed" | "hired" | "rejected";
  contact_status?: string | null;
  created_at: string;
  updated_at: string;
  job?: {
    id: number;
    title: string;
  };
  job_seeker?: JobSeeker;
}

// ─── Review Types ────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

// ─── Notification Types ────────────────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
  data?: any;
}

// ─── Sidebar Types ───────────────────────────────────────────────────────────

export interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: SidebarItem[];
}

// ─── Common Types ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number | boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";
