export interface UploadedDoc {
  name: string;
  size: string;
  type?: string;
  previewUrl?: string;
  uploadedAt: string;
  verified?: boolean;
  status?: string;
  metadata?: Record<string, string>;
}

export interface OnboardingState {
  // Step index: 0 = Welcome, 1 = INE, 2 = Domicilio, 3 = SAT SIEC, 4 = Estados de cuenta bancarios, 5 = Comprobante Financiero / Ingresos, 6 = Éxito
  currentStep: number;
  
  // Consentimiento Buró
  buroConsent: boolean;
  buroSignature: string | null;
  signatureType: 'draw' | 'type';
  typedSignatureName: string;
  buroConsentDate: string | null;

  // Paso 1: Identidad INE
  ineFront: UploadedDoc | null;
  ineBack: UploadedDoc | null;

  // Paso 2: Domicilio
  addressDoc: UploadedDoc | null;
  addressType: 'cfe' | 'telmex' | 'otro';

  // Paso 3: SAT SIEC
  siecKey: string;
  satValidated: boolean;

  // Paso 4: Estados de cuenta bancarios (3 meses)
  bankStatements: {
    month1: UploadedDoc | null;
    month2: UploadedDoc | null;
    month3: UploadedDoc | null;
  };

  // Paso 5: Estados financieros internos (PM) / Comprobantes de Ingresos (PF)
  internalFinancialsDoc: UploadedDoc | null;
  financialDocType?: 'balance_general' | 'declaracion_anual' | 'recibos_nomina' | 'constancia_fiscal';
  hasCertifiedAccountant: boolean;
  accountantCedula?: string;
  fiscalYear: string;
}
