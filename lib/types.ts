export type ExpedienteStatus = 
  | 'pendiente_envio'
  | 'enlace_enviado'
  | 'esperando_credenciales'
  | 'extrayendo'
  | 'esperando_aprobacion'
  | 'aprobado_ia'
  | 'rechazado_ia'
  | 'credito_aprobado'
  | 'credito_rechazado'
  | 'requiere_atencion'
  | 'completado';

export type TipoPersona = 'persona_moral' | 'persona_fisica';

export type TipoProductoFinanciero = 
  | 'automotriz'       // Crédito Automotriz (Vehicular)
  | 'capital_trabajo'  // Capital de Trabajo PYME / Revolvente
  | 'arrendamiento'    // Arrendamiento Puro / Financiero (Leasing)
  | 'personal'         // Crédito Personal / Nómina / Liquidez
  | 'factoraje'        // Factoraje Financiero / Anticipo de Facturas
  | 'hipotecario'      // Garantía Inmobiliaria / Liquidez
  | 'otro';            // Propósito General / Libre

export interface DictamenInfo {
  resultado: 'aprobado' | 'rechazado' | 'condicionado';
  fechaDictamen: string;
  autorizadoPor: string;
  montoAutorizado?: string;
  tasaAutorizada?: string;
  plazoAutorizado?: string;
  tipoProducto?: TipoProductoFinanciero;
  condiciones?: string[];
  motivoRechazo?: string;
  notas?: string;
}

export type ExtractionSource = 'sat_ciec' | 'sat_opinion' | 'buro_credito' | 'estados_financieros';

export interface ContactInfo {
  nombre: string;
  puesto?: string;
  email: string;
  telefono: string;
  metodoNotificacion: 'whatsapp' | 'email' | 'manual';
}

export interface CompanyInfo {
  tipoPersona?: TipoPersona; // 'persona_moral' (Empresa) | 'persona_fisica' (Persona Individual)
  razonSocial: string; // Razón Social en PM, o Nombre Completo del solicitante en PF
  rfc: string; // 12 caracteres para PM, 13 para PF
  curp?: string; // Exclusivo de Persona Física
  sector: string; // Giro comercial en PM, u Ocupación/Profesión en PF
  ocupacion?: string;
  ingresoMensual?: string; // Para PF
  montoSolicitado?: string;
  tipoProducto?: TipoProductoFinanciero; // Automotriz, Capital de Trabajo, Leasing, Personal, etc.
  destinoDetalle?: string; // Ej: "Adquisición de SUV Volvo XC60 2026", "Compra de maquinaria CNC"
  valorActivo?: string; // Valor total del bien o vehículo
  enganchePorcentaje?: number; // % de enganche aportado
  plazoMeses?: number; // Plazo solicitado en meses (12, 24, 36, 48, 60)
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  titulo: string;
  descripcion: string;
  estado: 'done' | 'active' | 'pending';
}

export interface ScrapedDataSummary {
  cfdiEmitidos?: number;
  cfdiRecibidos?: number;
  totalFacturado?: string; // Facturación total PM o Ingresos totales PF
  ingresoPromedioMensual?: string;
  opinionCumplimiento?: 'POSITIVA' | 'NEGATIVA' | 'NO_DISPONIBLE';
  scoreSolvencia?: number; // 300 - 850
  categoriaRiesgo?: 'Bajo Riesgo (AAA)' | 'Riesgo Moderado (A)' | 'Riesgo Alto (C)';
  inconsistenciasDetectadas?: number;
  fechaExtraccion?: string;
}

export interface OnboardingDocInfo {
  cargado: boolean;
  nombre?: string;
  tamano?: string;
  actualizadoEn?: string;
  status?: 'valido' | 'en_revision' | 'requiere_reemplazo';
}

export interface OnboardingStepsProgress {
  pasoActual: number; // 0 = Bienvenida, 1 = INE, 2 = Domicilio, 3 = Bancos, 4 = Financieros/Ingresos, 5 = Completado
  totalPasos: number; // 4 pasos de captura
  porcentaje: number; // 0 - 100
  ultimoAcceso?: string;
  dispositivo?: 'Móvil' | 'Escritorio';
  pasos: {
    identificacion: {
      completado: boolean;
      ineAnverso?: OnboardingDocInfo;
      ineReverso?: OnboardingDocInfo;
      tipoDocumento?: string;
      validadoOcr?: boolean;
    };
    domicilio: {
      completado: boolean;
      tipo?: 'CFE' | 'Telmex' | 'Agua' | 'Otro';
      comprobante?: OnboardingDocInfo;
      antiguedadMeses?: number;
    };
    estadosCuenta: {
      completado: boolean;
      mesesCargados: number;
      totalRequeridos: number;
      archivos: Array<{
        mes: string;
        banco: string;
        doc?: OnboardingDocInfo;
      }>;
    };
    estadosFinancieros: {
      completado: boolean;
      archivoFinanciero?: OnboardingDocInfo;
      tipoDocumentoIngresos?: 'balance_general' | 'declaracion_anual' | 'recibos_nomina' | 'constancia_fiscal';
      ejercicioFiscal?: string;
      cedulaContador?: string;
      autorizacionBuro: boolean;
      firmaBuroTimestamp?: string;
    };
  };
}

export interface Expediente {
  id: string;
  folio: string;
  empresa: CompanyInfo;
  contacto: ContactInfo;
  fuentes: ExtractionSource[];
  estado: ExpedienteStatus;
  creadoEn: string;
  actualizadoEn: string;
  tokenAcceso: string;
  resumen?: ScrapedDataSummary;
  timeline: TimelineEvent[];
  onboardingProgress?: OnboardingStepsProgress;
  dictamen?: DictamenInfo;
  notasInternas?: string;
}
