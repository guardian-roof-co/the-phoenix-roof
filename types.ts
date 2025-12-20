
declare global {
  interface Window {
    google: any;
    GOOGLE_MAPS_API_KEY: string;
    gm_authFailure: () => void;
  }
}

export type ViewState = 'home' | 'quote' | 'insurance' | 'maintenance' | 'schedule' | 'education' | 'profile' | 'self-inspection' | 'storm' | 'about' | 'signup';

export interface RoofMaterial {
  id: string;
  name: string;
  description: string;
  costPerSqFt: number;
  image: string;
  lifespan: string;
}

export interface QuoteData {
  id: string;
  date: string;
  address: string;
  zipCode: string;
  roofAreaSqFt: number;
  material: RoofMaterial | null;
  estimatedCost: number;
}

export interface Appointment {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  time: string;
  type: 'inspection' | 'repair' | 'maintenance';
  meetingType: 'in-person' | 'virtual';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  priceMonthly: number;
  features: string[];
  isPopular?: boolean;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

// Added missing CRM and User related types to fix import errors in ManagerDashboard.tsx and OutreachCRM.tsx
export type LeadStage = 'New' | 'Contacted' | 'Inspection' | 'Proposal' | 'Won' | 'Lost';

export interface CRMActivity {
  id: string;
  text: string;
  timestamp: string;
}

export interface CRMTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export type OutreachStatus = 'Not Contacted' | 'Sent' | 'Replied' | 'Booked' | 'Interested' | 'No Answer' | 'DNC';

export interface OutreachMessage {
  id: string;
  text: string;
  timestamp: string;
  direction: 'sent' | 'received';
}

export interface OutreachContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  normalizedAddress: string;
  status: OutreachStatus;
  notes: string;
  sourceFile: string;
  history: OutreachMessage[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  rewardsEarned: number;
  phone?: string;
  address?: string;
  // Added role and CRM fields to fix property access and object literal errors
  role?: string;
  crmStage?: LeadStage;
  lastContact?: string;
  location?: { lat: number, lng: number };
  activities?: CRMActivity[];
}

export interface StormEvent {
  date: string;
  type: 'Hail' | 'Wind';
  severity: string; 
  insurancePotential: boolean; 
}

export interface StormReport {
  riskLevel: 'Low' | 'Medium' | 'High';
  events: StormEvent[];
  lastStormDate: string | null;
  summary: string;
}
