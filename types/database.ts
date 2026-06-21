export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string;
          admin_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          action: string;
          admin_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
          updated_at?: string;
        };
        Update: {
          action?: string;
          admin_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_user_id_fkey";
            columns: ["admin_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          candidate_id: string | null;
          created_at: string;
          employer_id: string | null;
          event_data: Json;
          event_name: string;
          id: string;
          job_id: string | null;
          payment_id: string | null;
          session_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          candidate_id?: string | null;
          created_at?: string;
          employer_id?: string | null;
          event_data?: Json;
          event_name: string;
          id?: string;
          job_id?: string | null;
          payment_id?: string | null;
          session_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          candidate_id?: string | null;
          created_at?: string;
          employer_id?: string | null;
          event_data?: Json;
          event_name?: string;
          id?: string;
          job_id?: string | null;
          payment_id?: string | null;
          session_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_candidate_id_fkey";
            columns: ["candidate_id"];
            referencedRelation: "candidate_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_employer_id_fkey";
            columns: ["employer_id"];
            referencedRelation: "employer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_payment_id_fkey";
            columns: ["payment_id"];
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          applied_at: string;
          candidate_id: string;
          cover_letter: string | null;
          created_at: string;
          employer_notes: string | null;
          id: string;
          job_id: string;
          resume_id: string | null;
          resume_storage_path: string | null;
          resume_url: string | null;
          status: Database["public"]["Enums"]["application_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          applied_at?: string;
          candidate_id: string;
          cover_letter?: string | null;
          created_at?: string;
          employer_notes?: string | null;
          id?: string;
          job_id: string;
          resume_id?: string | null;
          resume_storage_path?: string | null;
          resume_url?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          applied_at?: string;
          candidate_id?: string;
          cover_letter?: string | null;
          created_at?: string;
          employer_notes?: string | null;
          id?: string;
          job_id?: string;
          resume_id?: string | null;
          resume_storage_path?: string | null;
          resume_url?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey";
            columns: ["candidate_id"];
            referencedRelation: "candidate_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          content: string;
          cover_image: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          keywords: string[];
          meta_description: string | null;
          meta_title: string | null;
          published_at: string | null;
          schema_type: string | null;
          slug: string;
          status: Database["public"]["Enums"]["job_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          keywords?: string[];
          meta_description?: string | null;
          meta_title?: string | null;
          published_at?: string | null;
          schema_type?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["job_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          keywords?: string[];
          meta_description?: string | null;
          meta_title?: string | null;
          published_at?: string | null;
          schema_type?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["job_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      candidate_profiles: {
        Row: {
          bio: string | null;
          city: string | null;
          created_at: string;
          education: string | null;
          expected_salary: number | null;
          experience: string | null;
          full_name: string | null;
          headline: string | null;
          id: string;
          language_preference: string | null;
          phone: string | null;
          preferred_job_types: string[];
          preferred_roles: string[];
          resume_url: string | null;
          skills: string[];
          state: string | null;
          updated_at: string;
          user_id: string;
          verification_requested_at: string | null;
          verification_status: Database["public"]["Enums"]["verification_status"];
          verified: boolean;
          verified_at: string | null;
        };
        Insert: {
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          education?: string | null;
          expected_salary?: number | null;
          experience?: string | null;
          full_name?: string | null;
          headline?: string | null;
          id?: string;
          language_preference?: string | null;
          phone?: string | null;
          preferred_job_types?: string[];
          preferred_roles?: string[];
          resume_url?: string | null;
          skills?: string[];
          state?: string | null;
          updated_at?: string;
          user_id: string;
          verification_requested_at?: string | null;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verified?: boolean;
          verified_at?: string | null;
        };
        Update: {
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          education?: string | null;
          expected_salary?: number | null;
          experience?: string | null;
          full_name?: string | null;
          headline?: string | null;
          id?: string;
          language_preference?: string | null;
          phone?: string | null;
          preferred_job_types?: string[];
          preferred_roles?: string[];
          resume_url?: string | null;
          skills?: string[];
          state?: string | null;
          updated_at?: string;
          user_id?: string;
          verification_requested_at?: string | null;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verified?: boolean;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          city: string | null;
          country: string;
          created_at: string;
          description: string | null;
          id: string;
          industry: string | null;
          logo_url: string | null;
          name: string;
          rating: number | null;
          size_range: string | null;
          slug: string;
          state: string | null;
          updated_at: string;
          verified: boolean;
          website: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          name: string;
          rating?: number | null;
          size_range?: string | null;
          slug: string;
          state?: string | null;
          updated_at?: string;
          verified?: boolean;
          website?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          name?: string;
          rating?: number | null;
          size_range?: string | null;
          slug?: string;
          state?: string | null;
          updated_at?: string;
          verified?: boolean;
          website?: string | null;
        };
        Relationships: [];
      };
      company_reviews: {
        Row: {
          company_id: string;
          cons: string | null;
          created_at: string;
          id: string;
          pros: string | null;
          rating: number;
          review: string | null;
          status: Database["public"]["Enums"]["review_status"];
          title: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          company_id: string;
          cons?: string | null;
          created_at?: string;
          id?: string;
          pros?: string | null;
          rating: number;
          review?: string | null;
          status?: Database["public"]["Enums"]["review_status"];
          title?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          company_id?: string;
          cons?: string | null;
          created_at?: string;
          id?: string;
          pros?: string | null;
          rating?: number;
          review?: string | null;
          status?: Database["public"]["Enums"]["review_status"];
          title?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_reviews_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_reviews_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      employer_profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"];
          city: string | null;
          company_email: string | null;
          company_email_verified: boolean;
          company_id: string | null;
          company_name: string;
          created_at: string;
          description: string | null;
          domain_verification_status: string;
          id: string;
          industry: string | null;
          logo_url: string | null;
          recruiter_name: string | null;
          recruiter_phone: string | null;
          state: string | null;
          updated_at: string;
          user_id: string;
          verified: boolean;
          website: string | null;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"];
          city?: string | null;
          company_email?: string | null;
          company_email_verified?: boolean;
          company_id?: string | null;
          company_name: string;
          created_at?: string;
          description?: string | null;
          domain_verification_status?: string;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          recruiter_name?: string | null;
          recruiter_phone?: string | null;
          state?: string | null;
          updated_at?: string;
          user_id: string;
          verified?: boolean;
          website?: string | null;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"];
          city?: string | null;
          company_email?: string | null;
          company_email_verified?: boolean;
          company_id?: string | null;
          company_name?: string;
          created_at?: string;
          description?: string | null;
          domain_verification_status?: string;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          recruiter_name?: string | null;
          recruiter_phone?: string | null;
          state?: string | null;
          updated_at?: string;
          user_id?: string;
          verified?: boolean;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employer_profiles_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employer_profiles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      government_jobs: {
        Row: {
          age_limit: string | null;
          category: string;
          category_slug: string | null;
          created_at: string;
          department: string;
          eligibility: string | null;
          fees: string | null;
          id: string;
          last_date: string | null;
          notification_url: string | null;
          official_last_checked_at: string | null;
          official_url: string | null;
          slug: string;
          state: string | null;
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          age_limit?: string | null;
          category: string;
          category_slug?: string | null;
          created_at?: string;
          department: string;
          eligibility?: string | null;
          fees?: string | null;
          id?: string;
          last_date?: string | null;
          notification_url?: string | null;
          official_last_checked_at?: string | null;
          official_url?: string | null;
          slug: string;
          state?: string | null;
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          age_limit?: string | null;
          category?: string;
          category_slug?: string | null;
          created_at?: string;
          department?: string;
          eligibility?: string | null;
          fees?: string | null;
          id?: string;
          last_date?: string | null;
          notification_url?: string | null;
          official_last_checked_at?: string | null;
          official_url?: string | null;
          slug?: string;
          state?: string | null;
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      internships: {
        Row: {
          apply_url: string | null;
          category_slug: string | null;
          company: string;
          company_id: string | null;
          created_at: string;
          deadline: string | null;
          duration: string | null;
          id: string;
          is_paid: boolean;
          location: string | null;
          skills: string[];
          slug: string;
          stipend: string | null;
          title: string;
          updated_at: string;
          work_mode: Database["public"]["Enums"]["work_mode"] | null;
        };
        Insert: {
          apply_url?: string | null;
          category_slug?: string | null;
          company: string;
          company_id?: string | null;
          created_at?: string;
          deadline?: string | null;
          duration?: string | null;
          id?: string;
          is_paid?: boolean;
          location?: string | null;
          skills?: string[];
          slug: string;
          stipend?: string | null;
          title: string;
          updated_at?: string;
          work_mode?: Database["public"]["Enums"]["work_mode"] | null;
        };
        Update: {
          apply_url?: string | null;
          category_slug?: string | null;
          company?: string;
          company_id?: string | null;
          created_at?: string;
          deadline?: string | null;
          duration?: string | null;
          id?: string;
          is_paid?: boolean;
          location?: string | null;
          skills?: string[];
          slug?: string;
          stipend?: string | null;
          title?: string;
          updated_at?: string;
          work_mode?: Database["public"]["Enums"]["work_mode"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "internships_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      interview_sessions: {
        Row: {
          answers_json: Json;
          created_at: string;
          feedback: string | null;
          id: string;
          mode: string;
          questions_json: Json;
          report_json: Json;
          role: string;
          score: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answers_json?: Json;
          created_at?: string;
          feedback?: string | null;
          id?: string;
          mode: string;
          questions_json?: Json;
          report_json?: Json;
          role: string;
          score?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answers_json?: Json;
          created_at?: string;
          feedback?: string | null;
          id?: string;
          mode?: string;
          questions_json?: Json;
          report_json?: Json;
          role?: string;
          score?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interview_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      job_reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          job_id: string;
          reason: string;
          reported_by: string | null;
          resolution_notes: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["report_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          job_id: string;
          reason: string;
          reported_by?: string | null;
          resolution_notes?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          job_id?: string;
          reason?: string;
          reported_by?: string | null;
          resolution_notes?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_reports_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_reports_reported_by_fkey";
            columns: ["reported_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_reports_reviewed_by_fkey";
            columns: ["reviewed_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          application_url: string | null;
          approval_status: Database["public"]["Enums"]["approval_status"];
          category_slug: string | null;
          city: string | null;
          company_id: string | null;
          company_name: string;
          country: string;
          created_at: string;
          deadline: string | null;
          description: string;
          education_required: string | null;
          employer_id: string | null;
          experience_required: string | null;
          government_source_verified: boolean;
          id: string;
          industry: string | null;
          is_suspicious: boolean;
          is_featured: boolean;
          job_type: Database["public"]["Enums"]["job_type"] | null;
          location: string | null;
          moderation_notes: string | null;
          no_candidate_payment: boolean;
          openings: number;
          recruiter_contact: string | null;
          requirements: string[];
          responsibilities: string[];
          salary_disclosed: boolean;
          salary_max: number | null;
          salary_min: number | null;
          salary_type: Database["public"]["Enums"]["salary_type"];
          search_vector: unknown | null;
          skills: string[];
          slug: string;
          source_type: Database["public"]["Enums"]["source_type"] | null;
          source_url: string | null;
          state: string | null;
          status: Database["public"]["Enums"]["job_status"];
          suspicious_flags: string[];
          title: string;
          updated_at: string;
          work_mode: Database["public"]["Enums"]["work_mode"] | null;
        };
        Insert: {
          application_url?: string | null;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          category_slug?: string | null;
          city?: string | null;
          company_id?: string | null;
          company_name: string;
          country?: string;
          created_at?: string;
          deadline?: string | null;
          description: string;
          education_required?: string | null;
          employer_id?: string | null;
          experience_required?: string | null;
          government_source_verified?: boolean;
          id?: string;
          industry?: string | null;
          is_suspicious?: boolean;
          is_featured?: boolean;
          job_type?: Database["public"]["Enums"]["job_type"] | null;
          location?: string | null;
          moderation_notes?: string | null;
          no_candidate_payment?: boolean;
          openings?: number;
          recruiter_contact?: string | null;
          requirements?: string[];
          responsibilities?: string[];
          salary_disclosed?: boolean;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_type?: Database["public"]["Enums"]["salary_type"];
          search_vector?: unknown | null;
          skills?: string[];
          slug: string;
          source_type?: Database["public"]["Enums"]["source_type"] | null;
          source_url?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          suspicious_flags?: string[];
          title: string;
          updated_at?: string;
          work_mode?: Database["public"]["Enums"]["work_mode"] | null;
        };
        Update: {
          application_url?: string | null;
          approval_status?: Database["public"]["Enums"]["approval_status"];
          category_slug?: string | null;
          city?: string | null;
          company_id?: string | null;
          company_name?: string;
          country?: string;
          created_at?: string;
          deadline?: string | null;
          description?: string;
          education_required?: string | null;
          employer_id?: string | null;
          experience_required?: string | null;
          government_source_verified?: boolean;
          id?: string;
          industry?: string | null;
          is_suspicious?: boolean;
          is_featured?: boolean;
          job_type?: Database["public"]["Enums"]["job_type"] | null;
          location?: string | null;
          moderation_notes?: string | null;
          no_candidate_payment?: boolean;
          openings?: number;
          recruiter_contact?: string | null;
          requirements?: string[];
          responsibilities?: string[];
          salary_disclosed?: boolean;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_type?: Database["public"]["Enums"]["salary_type"];
          search_vector?: unknown | null;
          skills?: string[];
          slug?: string;
          source_type?: Database["public"]["Enums"]["source_type"] | null;
          source_url?: string | null;
          state?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          suspicious_flags?: string[];
          title?: string;
          updated_at?: string;
          work_mode?: Database["public"]["Enums"]["work_mode"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_employer_id_fkey";
            columns: ["employer_id"];
            referencedRelation: "employer_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          id: string;
          is_read: boolean;
          message: string;
          metadata: Json;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message: string;
          metadata?: Json;
          title: string;
          type?: Database["public"]["Enums"]["notification_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          metadata?: Json;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          notes: Json;
          plan: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          subscription_type: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          notes?: Json;
          plan: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          subscription_type?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          notes?: Json;
          plan?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          subscription_type?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      resume_analyses: {
        Row: {
          created_at: string;
          id: string;
          job_description_text: string | null;
          match_score: number | null;
          missing_keywords: string[];
          resume_id: string | null;
          score: number | null;
          suggestions: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          job_description_text?: string | null;
          match_score?: number | null;
          missing_keywords?: string[];
          resume_id?: string | null;
          score?: number | null;
          suggestions?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          job_description_text?: string | null;
          match_score?: number | null;
          missing_keywords?: string[];
          resume_id?: string | null;
          score?: number | null;
          suggestions?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resume_analyses_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_analyses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      resumes: {
        Row: {
          ats_score: number | null;
          content_json: Json;
          created_at: string;
          file_url: string | null;
          id: string;
          storage_path: string | null;
          template_key: string | null;
          title: string;
          updated_at: string;
          user_id: string;
          version: number;
        };
        Insert: {
          ats_score?: number | null;
          content_json?: Json;
          created_at?: string;
          file_url?: string | null;
          id?: string;
          storage_path?: string | null;
          template_key?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: {
          ats_score?: number | null;
          content_json?: Json;
          created_at?: string;
          file_url?: string | null;
          id?: string;
          storage_path?: string | null;
          template_key?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      salary_data: {
        Row: {
          city: string | null;
          company_id: string | null;
          created_at: string;
          experience_range: string | null;
          id: string;
          job_title: string;
          salary_max: number | null;
          salary_min: number | null;
          salary_type: Database["public"]["Enums"]["salary_type"];
          source: string | null;
          state: string | null;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          company_id?: string | null;
          created_at?: string;
          experience_range?: string | null;
          id?: string;
          job_title: string;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_type?: Database["public"]["Enums"]["salary_type"];
          source?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Update: {
          city?: string | null;
          company_id?: string | null;
          created_at?: string;
          experience_range?: string | null;
          id?: string;
          job_title?: string;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_type?: Database["public"]["Enums"]["salary_type"];
          source?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "salary_data_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_jobs: {
        Row: {
          created_at: string;
          id: string;
          job_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          job_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          job_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      job_match_scores: {
        Row: {
          candidate_id: string;
          candidate_updated_at: string | null;
          created_at: string;
          id: string;
          job_id: string;
          job_updated_at: string | null;
          match_score: number;
          matching_skills: string[];
          missing_skills: string[];
          reason: string;
          recommendation: string;
          updated_at: string;
        };
        Insert: {
          candidate_id: string;
          candidate_updated_at?: string | null;
          created_at?: string;
          id?: string;
          job_id: string;
          job_updated_at?: string | null;
          match_score: number;
          matching_skills?: string[];
          missing_skills?: string[];
          reason: string;
          recommendation: string;
          updated_at?: string;
        };
        Update: {
          candidate_id?: string;
          candidate_updated_at?: string | null;
          created_at?: string;
          id?: string;
          job_id?: string;
          job_updated_at?: string | null;
          match_score?: number;
          matching_skills?: string[];
          missing_skills?: string[];
          reason?: string;
          recommendation?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_match_scores_candidate_id_fkey";
            columns: ["candidate_id"];
            referencedRelation: "candidate_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_match_scores_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_pages: {
        Row: {
          category: string | null;
          city: string | null;
          content: string | null;
          created_at: string;
          faq_json: Json;
          id: string;
          indexable: boolean;
          meta_description: string | null;
          meta_title: string | null;
          page_type: string;
          slug: string;
          state: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          city?: string | null;
          content?: string | null;
          created_at?: string;
          faq_json?: Json;
          id?: string;
          indexable?: boolean;
          meta_description?: string | null;
          meta_title?: string | null;
          page_type: string;
          slug: string;
          state?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          city?: string | null;
          content?: string | null;
          created_at?: string;
          faq_json?: Json;
          id?: string;
          indexable?: boolean;
          meta_description?: string | null;
          meta_title?: string | null;
          page_type?: string;
          slug?: string;
          state?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          current_plan: string;
          email: string;
          id: string;
          is_banned: boolean;
          last_seen_at: string | null;
          name: string;
          phone: string | null;
          role: Database["public"]["Enums"]["app_role"];
          subscription_expires_at: string | null;
          subscription_started_at: string | null;
          subscription_status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_plan?: string;
          email: string;
          id?: string;
          is_banned?: boolean;
          last_seen_at?: string | null;
          name: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          subscription_expires_at?: string | null;
          subscription_started_at?: string | null;
          subscription_status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_plan?: string;
          email?: string;
          id?: string;
          is_banned?: boolean;
          last_seen_at?: string | null;
          name?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          subscription_expires_at?: string | null;
          subscription_started_at?: string | null;
          subscription_status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      whatsapp_subscriptions: {
        Row: {
          category_slug: string | null;
          city: string | null;
          created_at: string;
          id: string;
          is_opted_in: boolean;
          metadata: Json;
          phone_number: string;
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          category_slug?: string | null;
          city?: string | null;
          created_at?: string;
          id?: string;
          is_opted_in?: boolean;
          metadata?: Json;
          phone_number: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          category_slug?: string | null;
          city?: string | null;
          created_at?: string;
          id?: string;
          is_opted_in?: boolean;
          metadata?: Json;
          phone_number?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_candidate: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_employer: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "candidate" | "employer" | "admin";
      application_status: "applied" | "viewed" | "shortlisted" | "interview" | "rejected" | "offered";
      approval_status: "pending" | "approved" | "rejected";
      job_status: "draft" | "pending" | "active" | "expired" | "rejected";
      job_type: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "walk-in";
      notification_channel: "in_app" | "email" | "whatsapp";
      notification_type: "system" | "job_alert" | "application" | "payment" | "admin";
      payment_status: "created" | "paid" | "failed" | "refunded" | "cancelled";
      report_status: "open" | "reviewing" | "resolved" | "dismissed";
      review_status: "pending" | "published" | "rejected";
      salary_type: "monthly" | "yearly" | "stipend";
      source_type: "employer" | "admin" | "official" | "partner";
      subscription_status: "active" | "paused" | "unsubscribed";
      verification_status: "draft" | "pending" | "verified" | "rejected";
      work_mode: "remote" | "hybrid" | "onsite";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
