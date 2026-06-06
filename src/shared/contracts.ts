export type UserRole = 'owner' | 'admin' | 'teacher' | 'student';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface CourseSummary {
  id: number;
  title: string;
  slug: string;
  status: ContentStatus;
  visibility: 'public' | 'private';
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BootstrapResponse {
  app: {
    name: string;
    version: string;
  };
  settings: Record<string, unknown>;
}

export interface CoursesResponse {
  courses: CourseSummary[];
}
