// client/src/types/index.ts

export type UserRole = 'admin' | 'donor' | 'recipient' | 'ngo' | 'volunteer';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  fullName: string;
  phone?: string;
  organizationName?: string;
  accountType?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  unreadNotifications?: number;
}

export interface FoodCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: number;
  listing_count?: number;
}

export interface FoodListing {
  id: number;
  donor_id: number;
  category_id: number;
  title: string;
  description: string;
  initial_quantity: number;
  remaining_quantity: number;
  unit: string;
  estimated_servings: number;
  prep_time?: string;
  expiry_time?: string;
  pickup_deadline: string;
  storage_instructions: string;
  allergens?: string;
  pickup_address: string;
  city: string;
  postal_code?: string;
  contact_phone: string;
  primary_image_url?: string;
  status: 'available' | 'partially_claimed' | 'fully_claimed' | 'closed' | 'expired' | 'paused' | 'rejected';
  moderation_status: 'approved' | 'pending_review' | 'rejected';
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  donor_name?: string;
  donor_phone?: string;
  organization_name?: string;
  org_verified?: number;
  total_requests?: number;
  pending_requests?: number;
  images?: Array<{ id: number; image_url: string; is_primary: number; caption?: string }>;
}

export interface FoodRequest {
  id: number;
  listing_id: number;
  recipient_id: number;
  requested_quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'rejected' | 'ready_for_pickup' | 'collected' | 'completed' | 'cancelled' | 'expired';
  recipient_notes?: string;
  donor_notes?: string;
  pickup_time?: string;
  verification_code?: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  pickup_address?: string;
  city?: string;
  pickup_deadline?: string;
  storage_instructions?: string;
  primary_image_url?: string;
  donor_name?: string;
  donor_phone?: string;
  donor_org?: string;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_org?: string;
  recipient_role?: string;
  remaining_quantity?: number;
}

export interface PlatformStats {
  mealsRescued: number;
  foodDonors: number;
  successfulDonations: number;
  participatingNgos: number;
  foodWastePreventedKg: number;
  estimatedCo2SavedKg: number;
  activeListingsCount: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_name?: string;
  admin_email?: string;
  action: string;
  target_type: string;
  target_id?: number;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface Organization {
  id: number;
  user_id: number;
  org_name: string;
  org_type: string;
  registration_number?: string;
  tax_id?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_verified: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'unsubmitted';
  verified_at?: string;
  verification_notes?: string;
  created_at: string;
  user_email?: string;
  user_status?: string;
  full_name?: string;
  city?: string;
}
