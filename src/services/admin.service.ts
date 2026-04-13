import { api } from "./api";
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
  PaginatedResponse,
} from "@/types";

/**
 * Admin Service — Prepared API endpoints for Phase 2 integration.
 * All methods are typed and ready to use once backend is connected.
 */

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = () =>
  api.get<DashboardStats>("/admin/dashboard");

// ─── Master Data (Categories, Locations, Skills, etc.) ──────────────────────

export const getCategories = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<MasterDataItem>>("/admin/categories", { params });

export const createCategory = (data: Partial<MasterDataItem>) =>
  api.post("/admin/categories", data);

export const updateCategory = (id: number, data: Partial<MasterDataItem>) =>
  api.put(`/admin/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  api.delete(`/admin/categories/${id}`);

export const getLocations = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<MasterDataItem>>("/admin/locations", { params });

export const createLocation = (data: Partial<MasterDataItem>) =>
  api.post("/admin/locations", data);

export const updateLocation = (id: number, data: Partial<MasterDataItem>) =>
  api.put(`/admin/locations/${id}`, data);

export const deleteLocation = (id: number) =>
  api.delete(`/admin/locations/${id}`);

export const getSkills = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<MasterDataItem>>("/admin/skills", { params });

export const createSkill = (data: Partial<MasterDataItem>) =>
  api.post("/admin/skills", data);

export const updateSkill = (id: number, data: Partial<MasterDataItem>) =>
  api.put(`/admin/skills/${id}`, data);

export const deleteSkill = (id: number) =>
  api.delete(`/admin/skills/${id}`);

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const getJobs = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Job>>("/admin/jobs", { params });

export const getJob = (id: number) => api.get<Job>(`/admin/jobs/${id}`);

export const updateJob = (id: number, data: Partial<Job>) =>
  api.put(`/admin/jobs/${id}`, data);

export const deleteJob = (id: number) => api.delete(`/admin/jobs/${id}`);

export const approveJob = (id: number) => api.patch(`/admin/jobs/${id}/approve`);

export const rejectJob = (id: number) => api.patch(`/admin/jobs/${id}/reject`);

export const featureJob = (id: number) => api.patch(`/admin/jobs/${id}/feature`);

// ─── Job Seekers ─────────────────────────────────────────────────────────────

export const getJobSeekers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<JobSeeker>>("/admin/jobseekers", { params });

export const updateJobSeeker = (id: number, data: Partial<JobSeeker>) =>
  api.put(`/admin/jobseekers/${id}`, data);

export const disableJobSeeker = (id: number) =>
  api.patch(`/admin/jobseekers/${id}/disable`);

export const deleteJobSeeker = (id: number) =>
  api.delete(`/admin/jobseekers/${id}`);

// ─── Recruiters ──────────────────────────────────────────────────────────────

export const getRecruiters = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Recruiter>>("/admin/recruiters", { params });

export const updateRecruiter = (id: number, data: Partial<Recruiter>) =>
  api.put(`/admin/recruiters/${id}`, data);

export const disableRecruiter = (id: number) =>
  api.patch(`/admin/recruiters/${id}/disable`);

export const deleteRecruiter = (id: number) =>
  api.delete(`/admin/recruiters/${id}`);

// ─── Employers ───────────────────────────────────────────────────────────────

export const getEmployers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Employer>>("/admin/employers", { params });

export const updateEmployer = (id: number, data: Partial<Employer>) =>
  api.put(`/admin/employers/${id}`, data);

export const deleteEmployer = (id: number) =>
  api.delete(`/admin/employers/${id}`);

export const verifyEmployer = (id: number) =>
  api.patch(`/admin/employers/${id}/verify`);

export const featureEmployer = (id: number) =>
  api.patch(`/admin/employers/${id}/feature`);

// ─── Applications ────────────────────────────────────────────────────────────

export const getApplications = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Application>>("/admin/applications", { params });

export const updateApplication = (id: number, data: Partial<Application>) =>
  api.put(`/admin/applications/${id}`, data);

// ─── Plans ───────────────────────────────────────────────────────────────────

export const getPlans = () => api.get<Plan[]>("/admin/plans");

export const createPlan = (data: Partial<Plan>) =>
  api.post<Plan>("/admin/plans", data);

export const updatePlan = (id: number, data: Partial<Plan>) =>
  api.put(`/admin/plans/${id}`, data);

export const patchPlan = (id: number, data: Partial<Plan>) =>
  api.patch(`/admin/plans/${id}`, data);

export const deletePlan = (id: number) => api.delete(`/admin/plans/${id}`);

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const getReviews = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Review>>("/admin/reviews", { params });

export const updateReview = (id: number, data: Partial<Review>) =>
  api.put(`/admin/reviews/${id}`, data);

// ─── CMS ─────────────────────────────────────────────────────────────────────

export const getCMSSections = () => api.get<CMSSection[]>("/admin/cms");

export const updateCMSSection = (id: number, data: Partial<CMSSection>) =>
  api.put(`/admin/cms/${id}`, data);

// Navigation
export const getCMSNavigations = () => api.get<any[]>("/admin/cms/navigation");
export const createCMSNavigation = (data: any) => api.post("/admin/cms/navigation", data);
export const updateCMSNavigation = (id: number, data: any) => api.put(`/admin/cms/navigation/${id}`, data);
export const deleteCMSNavigation = (id: number) => api.delete(`/admin/cms/navigation/${id}`);
export const toggleCMSNavigationActive = (id: number) => api.patch(`/admin/cms/navigation/${id}/toggle-active`);
export const toggleCMSNavigationNav = (id: number) => api.patch(`/admin/cms/navigation/${id}/toggle-nav`);

// Footer Links
export const getCMSFooterLinks = () => api.get<any[]>("/admin/cms/footer-links");
export const createCMSFooterLink = (data: any) => api.post("/admin/cms/footer-links", data);
export const updateCMSFooterLink = (id: number, data: any) => api.put(`/admin/cms/footer-links/${id}`, data);
export const deleteCMSFooterLink = (id: number) => api.delete(`/admin/cms/footer-links/${id}`);
export const toggleCMSFooterLink = (id: number) => api.patch(`/admin/cms/footer-links/${id}/toggle`);

// Company Logos / Branding
export const getCMSCompanyLogos = () => api.get<any[]>("/admin/cms/company-logos");
export const createCMSCompanyLogo = (data: any) => api.post("/admin/cms/company-logos", data);
export const updateCMSCompanyLogo = (id: number, data: any) => api.put(`/admin/cms/company-logos/${id}`, data);
export const deleteCMSCompanyLogo = (id: number) => api.delete(`/admin/cms/company-logos/${id}`);

// ─── SEO ─────────────────────────────────────────────────────────────────────

export const getSEOSettings = () => api.get<SEOSetting[]>("/admin/seo");

export const updateSEOSetting = (id: number, data: Partial<SEOSetting>) =>
  api.put(`/admin/seo/${id}`, data);

export const updateJobSEO = (id: number, data: any) =>
  api.put(`/admin/seo/job/${id}`, data);

export const updateCategorySEO = (id: number, data: any) =>
  api.put(`/admin/seo/category/${id}`, data);

export const updateLocationSEO = (id: number, data: any) =>
  api.put(`/admin/seo/location/${id}`, data);

export const updateEmployerSEO = (id: number, data: any) =>
  api.put(`/admin/seo/employer/${id}`, data);

// ─── Deleted Items ───────────────────────────────────────────────────────────

export const getDeletedItems = (type: string, params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<DeletedItem>>(`/admin/deleted/${type}`, { params });

export const restoreItem = (type: string, id: number) =>
  api.post(`/admin/deleted/${type}/${id}/restore`);

export const permanentDelete = (type: string, id: number) =>
  api.delete(`/admin/deleted/${type}/${id}`);

// ─── Document Verification ──────────────────────────────────────────────────

export const getVerificationRequests = (params?: Record<string, unknown>) =>
  api.get("/admin/verifications", { params });

export const approveVerification = (id: number) =>
  api.post(`/admin/verifications/${id}/approve`);

export const rejectVerification = (id: number, reason: string) =>
  api.post(`/admin/verifications/${id}/reject`, { reason });

// ─── Notifications ────────────────────────────────────────────────────────
export const getNotifications = () => 
  api.get("/admin/notifications");

export const readNotification = (id: number) => 
  api.post(`/admin/notifications/${id}/read`);

export const readAllNotifications = () => 
  api.post("/admin/notifications/read-all");

// ─── Settings ────────────────────────────────────────────────────────────────

export const getSettings = () => api.get("/admin/settings");

export const updateSettings = (data: Record<string, unknown>) =>
  api.put("/admin/settings", data);
