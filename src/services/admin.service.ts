import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type {
  DashboardStats,
  MasterDataItem,
  Plan,
  Job,
  JobSeeker,
  Recruiter,
  Employer,
  Application,
  Review,
  CMSSection,
  SEOSetting,
  DeletedItem,
  ApiResponse,
  PaginatedResponse,
  CVTemplate,
  TeachingResource,
  EmailTemplate,
} from "@/types";

/**
 * Admin Service — Using dashboardServerFetch for secure server-side requests.
 */

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = () =>
  dashboardServerFetch<DashboardStats>("/admin/dashboard");

// ─── Master Data (Categories, Locations, Skills, etc.) ──────────────────────

export const getCategories = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<MasterDataItem>>("/admin/categories", { params });

export const createCategory = (data: Partial<MasterDataItem>) =>
  dashboardServerFetch("/admin/categories", { method: "POST", data });

export const updateCategory = (id: number, data: Partial<MasterDataItem>) =>
  dashboardServerFetch(`/admin/categories/${id}`, { method: "PUT", data });

export const deleteCategory = (id: number) =>
  dashboardServerFetch(`/admin/categories/${id}`, { method: "DELETE" });

export const getLocations = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<MasterDataItem>>("/admin/locations", { params });

export const createLocation = (data: Partial<MasterDataItem>) =>
  dashboardServerFetch("/admin/locations", { method: "POST", data });

export const updateLocation = (id: number, data: Partial<MasterDataItem>) =>
  dashboardServerFetch(`/admin/locations/${id}`, { method: "PUT", data });

export const deleteLocation = (id: number) =>
  dashboardServerFetch(`/admin/locations/${id}`, { method: "DELETE" });

export const getSkills = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<MasterDataItem>>("/admin/skills", { params });

export const createSkill = (data: Partial<MasterDataItem>) =>
  dashboardServerFetch("/admin/skills", { method: "POST", data });

export const updateSkill = (id: number, data: Partial<MasterDataItem>) =>
  dashboardServerFetch(`/admin/skills/${id}`, { method: "PUT", data });

export const deleteSkill = (id: number) =>
  dashboardServerFetch(`/admin/skills/${id}`, { method: "DELETE" });

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const getJobs = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<Job>>("/admin/jobs", { params });

export const getJob = (id: number) => 
  dashboardServerFetch<ApiResponse<Job>>(`/admin/jobs/${id}`);

export const updateJob = (id: number, data: Partial<Job>) =>
  dashboardServerFetch(`/admin/jobs/${id}`, { method: "PUT", data });

export const deleteJob = (id: number) => 
  dashboardServerFetch(`/admin/jobs/${id}`, { method: "DELETE" });

export const approveJob = (id: number) => 
  dashboardServerFetch(`/admin/jobs/${id}/approve`, { method: "PATCH" });

export const rejectJob = (id: number) => 
  dashboardServerFetch(`/admin/jobs/${id}/reject`, { method: "PATCH" });

export const featureJob = (id: number) => 
  dashboardServerFetch(`/admin/jobs/${id}/feature`, { method: "PATCH" });

// ─── Job Seekers ─────────────────────────────────────────────────────────────

export const getJobSeekers = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<JobSeeker>>("/admin/jobseekers", { params });

export const getJobSeeker = (id: number) =>
  dashboardServerFetch<ApiResponse<JobSeeker>>(`/admin/jobseekers/${id}`);

export const updateJobSeeker = (id: number, data: Partial<JobSeeker>) =>
  dashboardServerFetch(`/admin/jobseekers/${id}`, { method: "PUT", data });

export const disableJobSeeker = (id: number) =>
  dashboardServerFetch(`/admin/jobseekers/${id}/disable`, { method: "PATCH" });

export const deleteJobSeeker = (id: number) =>
  dashboardServerFetch(`/admin/jobseekers/${id}`, { method: "DELETE" });

// ─── Recruiters ──────────────────────────────────────────────────────────────

export const getRecruiters = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<Recruiter>>("/admin/recruiters", { params });

export const getRecruiter = async (id: number) => {
  const res = await dashboardServerFetch<{ status: boolean; data: Recruiter }>(`/admin/recruiters/${id}`);
  return res.data;
};

export const updateRecruiter = (id: number, data: Partial<Recruiter>) =>
  dashboardServerFetch(`/admin/recruiters/${id}`, { method: "PUT", data });

export const disableRecruiter = (id: number) =>
  dashboardServerFetch(`/admin/recruiters/${id}/disable`, { method: "PATCH" });

export const deleteRecruiter = (id: number) =>
  dashboardServerFetch(`/admin/recruiters/${id}`, { method: "DELETE" });

// ─── Employers ───────────────────────────────────────────────────────────────

export const getEmployers = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<Employer>>("/admin/employers", { params });

export const getEmployer = (id: number) =>
  dashboardServerFetch<ApiResponse<Employer>>(`/admin/employers/${id}`);

export const updateEmployer = (id: number, data: Partial<Employer>) =>
  dashboardServerFetch(`/admin/employers/${id}`, { method: "PUT", data });

export const deleteEmployer = (id: number) =>
  dashboardServerFetch(`/admin/employers/${id}`, { method: "DELETE" });

export const verifyEmployer = (id: number) =>
  dashboardServerFetch(`/admin/employers/${id}/verify`, { method: "PATCH" });

export const featureEmployer = (id: number) =>
  dashboardServerFetch(`/admin/employers/${id}/feature`, { method: "PATCH" });

// ─── Applications ────────────────────────────────────────────────────────────

export const getApplications = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<Application>>("/admin/applications", { params });

export const updateApplication = (id: number, data: Partial<Application>) =>
  dashboardServerFetch(`/admin/applications/${id}`, { method: "PUT", data });

// ─── Plans ───────────────────────────────────────────────────────────────────

export const getPlans = () => 
  dashboardServerFetch<ApiResponse<Plan[]>>("/admin/plans");

export const createPlan = (data: Partial<Plan>) =>
  dashboardServerFetch<Plan>("/admin/plans", { method: "POST", data });

export const updatePlan = (id: number, data: Partial<Plan>) =>
  dashboardServerFetch(`/admin/plans/${id}`, { method: "PUT", data });

export const patchPlan = (id: number, data: Partial<Plan>) =>
  dashboardServerFetch(`/admin/plans/${id}`, { method: "PATCH", data });

export const deletePlan = (id: number) => 
  dashboardServerFetch(`/admin/plans/${id}`, { method: "DELETE" });

// ─── CV Templates ────────────────────────────────────────────────────────────

export const getCVTemplates = (params?: Record<string, unknown>) =>
  dashboardServerFetch<CVTemplate[]>("/admin/cms/cv-templates", { params });

export const getCVTemplate = (id: number) =>
  dashboardServerFetch<CVTemplate>(`/admin/cms/cv-templates/${id}`);

export const createCVTemplate = (data: FormData | Partial<CVTemplate>) =>
  dashboardServerFetch<CVTemplate>("/admin/cms/cv-templates", { 
    method: "POST", 
    data,
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });

export const updateCVTemplate = (id: number, data: FormData | Partial<CVTemplate>) =>
  dashboardServerFetch<CVTemplate>(`/admin/cms/cv-templates/${id}`, { 
    method: "POST", 
    data,
    params: { _method: "PUT" },
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });

export const deleteCVTemplate = (id: number) =>
  dashboardServerFetch(`/admin/cms/cv-templates/${id}`, { method: "DELETE" });

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const getReviews = (params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<Review>>("/admin/reviews", { params });

export const updateReview = (id: number, data: Partial<Review>) =>
  dashboardServerFetch(`/admin/reviews/${id}`, { method: "PUT", data });

// ─── CMS ─────────────────────────────────────────────────────────────────────

export const getCMSSections = () => 
  dashboardServerFetch<CMSSection[]>("/admin/cms");

export const updateCMSSection = (id: number, data: Partial<CMSSection>) =>
  dashboardServerFetch(`/admin/cms/${id}`, { method: "PUT", data });

// Navigation
export const getCMSNavigations = () => 
  dashboardServerFetch<any[]>("/admin/cms/navigation");

export const createCMSNavigation = (data: any) => 
  dashboardServerFetch("/admin/cms/navigation", { method: "POST", data });

export const updateCMSNavigation = (id: number, data: any) => 
  dashboardServerFetch(`/admin/cms/navigation/${id}`, { method: "PUT", data });

export const deleteCMSNavigation = (id: number) => 
  dashboardServerFetch(`/admin/cms/navigation/${id}`, { method: "DELETE" });

export const toggleCMSNavigationActive = (id: number) => 
  dashboardServerFetch(`/admin/cms/navigation/${id}/toggle-active`, { method: "PATCH" });

export const toggleCMSNavigationNav = (id: number) => 
  dashboardServerFetch(`/admin/cms/navigation/${id}/toggle-nav`, { method: "PATCH" });

// Footer Links
export const getCMSFooterLinks = () => 
  dashboardServerFetch<any[]>("/admin/cms/footer-links");

export const createCMSFooterLink = (data: any) => 
  dashboardServerFetch("/admin/cms/footer-links", { method: "POST", data });

export const updateCMSFooterLink = (id: number, data: any) => 
  dashboardServerFetch(`/admin/cms/footer-links/${id}`, { method: "PUT", data });

export const deleteCMSFooterLink = (id: number) => 
  dashboardServerFetch(`/admin/cms/footer-links/${id}`, { method: "DELETE" });

export const toggleCMSFooterLink = (id: number) => 
  dashboardServerFetch(`/admin/cms/footer-links/${id}/toggle`, { method: "PATCH" });

// Company Logos / Branding
export const getCMSCompanyLogos = () => 
  dashboardServerFetch<any[]>("/admin/cms/company-logos");

export const createCMSCompanyLogo = (data: any) => 
  dashboardServerFetch("/admin/cms/company-logos", { method: "POST", data });

export const updateCMSCompanyLogo = (id: number, data: any) => 
  dashboardServerFetch(`/admin/cms/company-logos/${id}`, { method: "PUT", data });

export const deleteCMSCompanyLogo = (id: number) => 
  dashboardServerFetch(`/admin/cms/company-logos/${id}`, { method: "DELETE" });

// ─── SEO ─────────────────────────────────────────────────────────────────────

export const getSEOSettings = () => 
  dashboardServerFetch<SEOSetting[]>("/admin/seo");

export const updateSEOSetting = (id: number, data: Partial<SEOSetting>) =>
  dashboardServerFetch(`/admin/seo/${id}`, { method: "PUT", data });

export const updateJobSEO = (id: number, data: any) =>
  dashboardServerFetch(`/admin/seo/job/${id}`, { method: "PUT", data });

export const updateCategorySEO = (id: number, data: any) =>
  dashboardServerFetch(`/admin/seo/category/${id}`, { method: "PUT", data });

export const updateLocationSEO = (id: number, data: any) =>
  dashboardServerFetch(`/admin/seo/location/${id}`, { method: "PUT", data });

export const updateEmployerSEO = (id: number, data: any) =>
  dashboardServerFetch(`/admin/seo/employer/${id}`, { method: "PUT", data });

// ─── Deleted Items ───────────────────────────────────────────────────────────

export const getDeletedItems = (type: string, params?: Record<string, unknown>) =>
  dashboardServerFetch<PaginatedResponse<DeletedItem>>(`/admin/deleted/${type}`, { params });

export const restoreItem = (type: string, id: number) =>
  dashboardServerFetch(`/admin/deleted/${type}/${id}/restore`, { method: "POST" });

export const permanentDelete = (type: string, id: number) =>
  dashboardServerFetch(`/admin/deleted/${type}/${id}`, { method: "DELETE" });

// ─── Document Verification ──────────────────────────────────────────────────

export const getVerificationRequests = (params?: Record<string, unknown>) =>
  dashboardServerFetch("/admin/verifications", { params });

export const approveVerification = (id: number) =>
  dashboardServerFetch(`/admin/verifications/${id}/approve`, { method: "POST" });

export const rejectVerification = (id: number, reason: string) =>
  dashboardServerFetch(`/admin/verifications/${id}/reject`, { method: "POST", data: { reason } });

// ─── Notifications ────────────────────────────────────────────────────────
export const getNotifications = () => 
  dashboardServerFetch("/admin/notifications");

export const readNotification = (id: number) => 
  dashboardServerFetch(`/admin/notifications/${id}/read`, { method: "POST" });

export const readAllNotifications = () => 
  dashboardServerFetch("/admin/notifications/read-all", { method: "POST" });

// ─── Settings ────────────────────────────────────────────────────────────────

export const getSettings = () => 
  dashboardServerFetch("/admin/settings");

export const updateSettings = (data: Record<string, unknown>) =>
  dashboardServerFetch("/admin/settings", { method: "PUT", data });

// ─── Resources ───────────────────────────────────────────────────────────────

export const getResources = () =>
  dashboardServerFetch<ApiResponse<TeachingResource[]>>("/admin/cms/resources");

export const createResource = (data: FormData) =>
  dashboardServerFetch<ApiResponse<TeachingResource>>("/admin/cms/resources", { method: "POST", data });

export const updateResource = (id: number, data: FormData) =>
  dashboardServerFetch<ApiResponse<TeachingResource>>(`/admin/cms/resources/${id}`, { method: "POST", data });

export const deleteResource = (id: number) =>
  dashboardServerFetch(`/admin/cms/resources/${id}`, { method: "DELETE" });

// ─── Email Templates ─────────────────────────────────────────────────────────

export const getEmailTemplates = () =>
  dashboardServerFetch<ApiResponse<EmailTemplate[]>>("/admin/cms/email-templates");

export const createEmailTemplate = (data: Partial<EmailTemplate>) =>
  dashboardServerFetch<ApiResponse<EmailTemplate>>("/admin/cms/email-templates", { method: "POST", data });

export const updateEmailTemplate = (id: number, data: Partial<EmailTemplate>) =>
  dashboardServerFetch<ApiResponse<EmailTemplate>>(`/admin/cms/email-templates/${id}`, { method: "PUT", data });

export const deleteEmailTemplate = (id: number) =>
  dashboardServerFetch(`/admin/cms/email-templates/${id}`, { method: "DELETE" });

export const toggleEmailTemplateStatus = (id: number) =>
  dashboardServerFetch<ApiResponse<EmailTemplate>>(`/admin/cms/email-templates/${id}/toggle`, { method: "POST" });


