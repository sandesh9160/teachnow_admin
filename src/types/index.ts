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
  is_active?: boolean | number;
  is_custom?: boolean | number;
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
  price: number | string;
  actual_price?: number | string;
  offer_price?: number | string;
  job_posts_limit?: number;
  validity_days?: number;
  job_live_days?: number;
  featured_jobs_limit?: number;
  company_featured?: number | boolean;
  original_price?: number | string;
  sale_price?: number | string;
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

// ─── CV Template Types ───────────────────────────────────────────────────────

export interface CVTemplate {
  id: number;
  name: string;
  html_template: string;
  preview_image?: string;
  is_active: number | boolean;
  key_values?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  | "jobseekers"
  | "jobs"
  | "employers"
  | "cvs"
  | "testimonials"
  | "resumes";

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

export interface JobSeekerResume {
  id: number;
  job_seeker_id: number;
  file_name: string;
  file_url: string;
  is_default: number | boolean;
  created_at: string;
}

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
  portfolio_website?: string | null;
  bio?: string | null;
  is_active?: number | boolean;
  status?: any;
  is_verified?: number | boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
  };
  resumes?: JobSeekerResume[];
  job_applications?: Application[];
  skills?: any[];
}

export interface Recruiter {
  id: number;
  employer_id: number;
  name: string;
  email: string;
  is_active: number | boolean;
  status?: any;
  is_verified?: number | boolean;
  created_at: string;
  updated_at: string;
  employer?: {
    id: number;
    company_name: string;
  };
  jobs_count?: number;
  jobs?: Job[];
}

export interface Employer {
  id: number;
  company_name: string;
  company_description?: string;
  about_company?: string;
  industry: string;
  institution_type: string;
  website?: string;
  company_logo?: string;
  address: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  is_active?: number | boolean;
  status?: any;
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
  recruiters?: Recruiter[];
  jobs?: Job[];
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

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  notifiable_type?: string;  // e.g. "admin"
  notifiable_id?: number;
  read_at?: string | null;   // optional — admin API uses is_read only
  is_read: boolean;
  created_at: string;
  data?: any;
}

// ─── Sidebar Types ───────────────────────────────────────────────────────────

export interface SidebarItem {
  title: string;
  href: string;
  icon: any;
  badge?: number | string;
  children?: { title: string; href: string }[];
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

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "default" | "indigo" | "purple" | "rose" | "cyan";

export interface TeachingResource {
  id: number;
  title: string;
  slug: string;
  description: string;
  pdf: string;
  resource_photo: string;
  author_name: string;
  author_photo: string;
  total_pages: number;
  answer_include: string;
  read_time: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_visible: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
}
export interface EmailTemplate {
  id: number;
  name: string;
  slug: string;
  subject: string;
  body: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  designation: string;
  company: string | null;
  photo: string | null;
  message: string;
  display_order: number;
  is_active: number | boolean;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  rating: number | null;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  slug: string | null;
}

export interface PrivacyPolicyItem {
  id: number;
  parent_id: number | null;
  title: string;
  content: string;
  display_order: number;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
  children: PrivacyPolicyItem[];
}
