// Core Enums
export type UserRole = 'landlord' | 'tenant' | 'guarantor' | 'insurer' | 'platform_admin';
export type ValidationStatus = 'pending' | 'approved' | 'rejected';
export type PropertyType = 'apartment' | 'house' | 'commercial';
export type PropertyStatus = 'available' | 'rented' | 'maintenance';
export type ContractStatus = 'draft' | 'active' | 'completed' | 'terminated';
export type AdjustmentIndex = 'IPCA' | 'IGP-M';
export type AdjustmentFrequency = 'annual' | 'semester';
export type SigningMethod = 'digital' | 'biometric';
export type InspectionType = 'move_in' | 'move_out' | 'periodic';
export type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor';
export type PaymentMethod = 'bank_transfer' | 'pix' | 'credit_card' | 'boleto';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'overdue';
export type InsuranceStatus = 'active' | 'expired' | 'cancelled';
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type DocumentType = 'id_photo' | 'proof_of_address' | 'income_proof' | 'property_deed' | 'iptu' | 'registration' | 'valuation_report';

// User & KYC Types
export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCProfile {
  id: string;
  userId: string;
  fullName: string;
  cpf: string;
  rg: string;
  dateOfBirth: Date;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  validationStatus: ValidationStatus;
  validatedAt?: Date;
  notes?: string;
}

export interface Document {
  id: string;
  userId: string;
  documentType: DocumentType;
  fileUrl: string;
  uploadDate: Date;
  expiryDate?: Date;
  verificationStatus: ValidationStatus;
}

// Property Types
export interface Property {
  id: string;
  address: string;
  propertyType: PropertyType;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  ownerId: string;
  status: PropertyStatus;
  description: string;
  rentAmount: number;
  condoFees: number;
  iptuTax: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  petFriendly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  documentType: DocumentType;
  fileUrl: string;
  uploadDate: Date;
  expiresAt?: Date;
}

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  photoUrl: string;
  roomType: string;
  caption?: string;
  displayOrder: number;
}

// Contract Types
export interface Contract {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  guarantorId?: string;
  insurerId?: string;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  depositAmount: number;
  adjustmentIndex: AdjustmentIndex;
  adjustmentFrequency: AdjustmentFrequency;
  platformFeePercent: number;
  insurancePremiumAmount?: number;
  additionalTerms?: string;
  createdAt: Date;
  signedAt?: Date;
  nftTokenHash?: string;
  blockchainNetwork?: string;
}

export interface ContractSignature {
  id: string;
  contractId: string;
  signerId: string;
  signerRole: UserRole;
  signatureDate?: Date;
  digitalSignatureHash?: string;
  signingMethod: SigningMethod;
  verificationStatus: ValidationStatus;
}

// Guarantor & Collateral Types
export interface GuarantorCollateral {
  id: string;
  guarantorId: string;
  propertyId: string;
  relationshipToGuarantor: string;
  valuationAmount: number;
  valuationDate: Date;
  lienFreeCertified: boolean;
  certificationDate?: Date;
  nftTokenHash?: string;
  blockchainNetwork?: string;
}

export interface CollateralDocument {
  id: string;
  collateralId: string;
  documentType: DocumentType;
  fileUrl: string;
  issueDate: Date;
  expiresAt?: Date;
}

// Inspection Types
export interface Inspection {
  id: string;
  contractId: string;
  inspectionType: InspectionType;
  inspectorName: string;
  inspectionDate: Date;
  inspectionNotes?: string;
  createdAt: Date;
}

export interface InspectionRoom {
  id: string;
  inspectionId: string;
  roomName: string;
  conditionRating: ConditionRating;
  notes?: string;
  photos: InspectionPhoto[];
}

export interface InspectionPhoto {
  id: string;
  roomId: string;
  photoUrl: string;
  caption?: string;
  uploadDate: Date;
}

export interface InspectionSignature {
  id: string;
  inspectionId: string;
  signerId: string;
  signatureDate: Date;
  digitalSignatureHash: string;
  signingMethod: SigningMethod;
}

// Financial Types
export interface Payment {
  id: string;
  contractId: string;
  payerId: string;
  paymentAmount: number;
  paymentDate?: Date;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  dueDate: Date;
  processedAt?: Date;
  referenceNumber?: string;
}

export interface Invoice {
  id: string;
  contractId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: PaymentStatus;
  recipientId: string;
  description: string;
  paymentUrl?: string;
}

export interface DelinquencyRecord {
  id: string;
  contractId: string;
  delinquentSince: Date;
  amountOwed: number;
  status: 'active' | 'resolved';
  resolutionDate?: Date;
  notes?: string;
}

export interface PlatformRevenue {
  id: string;
  contractId: string;
  feeAmount: number;
  feeType: 'platform_fee' | 'insurance_fee';
  collectedAt?: Date;
  status: PaymentStatus;
}

// Insurance Types
export interface InsurancePolicy {
  id: string;
  contractId: string;
  insurerId: string;
  policyNumber: string;
  riskScore: number;
  premiumAmount: number;
  policyStartDate: Date;
  policyEndDate: Date;
  status: InsuranceStatus;
  coverageDetails: string;
  createdAt: Date;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimDate: Date;
  claimType: 'damage' | 'theft' | 'liability' | 'loss_of_rent';
  claimedAmount: number;
  claimStatus: ClaimStatus;
  resolutionDate?: Date;
  description: string;
}

// Dashboard Analytics Types
export interface LandlordAnalytics {
  totalProperties: number;
  occupiedProperties: number;
  occupancyRate: number;
  totalMonthlyRevenue: number;
  netMonthlyRevenue: number;
  averageRent: number;
  delinquencyRate: number;
  totalDelinquentAmount: number;
}

export interface TenantAnalytics {
  activeContracts: number;
  totalPaid: number;
  upcomingPayments: Payment[];
  paymentHistory: Payment[];
  contractExpiringSoon: boolean;
}

export interface PlatformAnalytics {
  totalContracts: number;
  activeContracts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  usersByRole: Record<UserRole, number>;
  delinquencyRate: number;
  averageContractValue: number;
  popularLocations: Array<{ city: string; count: number }>;
}

// AI Risk Analysis Types
export interface RiskAnalysis {
  tenantId: string;
  creditScore: number;
  incomeVerified: boolean;
  employmentVerified: boolean;
  criminalRecordClean: boolean;
  civilRecordClean: boolean;
  incomeToRentRatio: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiresGuarantor: boolean;
  recommendedInsurancePremium: number;
  analysisDate: Date;
  aiRecommendations: string[];
}
