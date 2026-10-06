'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Send,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  CreditCard,
  Briefcase,
  DollarSign,
  Fingerprint,
  Car,
  FileSpreadsheet,
  Coins,
  Receipt,
  Home,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Expediente, ExtractionSource, TipoPersona, TipoProductoFinanciero } from '@/lib/types';

interface CreateExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newExpediente: Expediente) => void;
}

const tactileEase = [0.16, 1, 0.3, 1] as const;

const PRODUCTOS_CONFIG: {
  id: TipoProductoFinanciero;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  color: string;
  descripcion: string;
}[] = [
  {
    id: 'automotriz',
    label: 'Crédito Automotriz',
    icon: Car,
    badge: 'Vehicular',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    descripcion: 'Adquisición de autos nuevos/seminuevos con garantía prendaria y LTV.',
  },
  {
    id: 'arrendamiento',
    label: 'Arrendamiento (Leasing)',
    icon: FileSpreadsheet,
    badge: 'Deducible 100%',
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    descripcion: 'Flotillas y maquinaria pesada con deducción fiscal de rentas.',
  },
  {
    id: 'capital_trabajo',
    label: 'Capital de Trabajo',
    icon: Briefcase,
    badge: 'PYME / Corporativo',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    descripcion: 'Liquidez para inventarios, nómina o proveedores vía SAT.',
  },
  {
    id: 'personal',
    label: 'Crédito Personal',
    icon: User,
    badge: 'Quirografario',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    descripcion: 'Préstamo individual basado en capacidad de pago y score Buró.',
  },
  {
    id: 'factoraje',
    label: 'Factoraje Financiero',
    icon: Receipt,
    badge: 'Cesión de Cartera',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    descripcion: 'Anticipo inmediato de cuentas por cobrar y facturas PPD.',
  },
  {
    id: 'hipotecario',
    label: 'Garantía Hipotecaria',
    icon: Home,
    badge: 'Inmobiliario',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    descripcion: 'Línea de liquidez o crédito respaldado por bien raíz.',
  },
];

export function CreateExpedienteModal({ isOpen, onClose, onCreate }: CreateExpedienteModalProps) {
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>('persona_moral');
  const [tipoProducto, setTipoProducto] = useState<TipoProductoFinanciero>('capital_trabajo');

  // Product Specific Attributes
  const [valorActivo, setValorActivo] = useState('');
  const [enganchePorcentaje, setEnganchePorcentaje] = useState<number>(20);
  const [plazoMeses, setPlazoMeses] = useState<number>(36);
  const [destinoDetalle, setDestinoDetalle] = useState('');

  // Fields for Persona Moral
  const [razonSocial, setRazonSocial] = useState('');
  const [rfcMoral, setRfcMoral] = useState('');
  const [sectorMoral, setSectorMoral] = useState('Servicios & Comercio Mayorista');
  const [montoSolicitadoMoral, setMontoSolicitadoMoral] = useState('$2,000,000 MXN');
  const [nombreContacto, setNombreContacto] = useState('');
  const [puestoContacto, setPuestoContacto] = useState('Director General / Representante Legal');
  const [emailContacto, setEmailContacto] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');

  // Fields for Persona Física
  const [nombreCompletoFisica, setNombreCompletoFisica] = useState('');
  const [rfcFisica, setRfcFisica] = useState('');
  const [curpFisica, setCurpFisica] = useState('');
  const [ocupacionFisica, setOcupacionFisica] = useState('Servicios Médicos / Práctica Privada');
  const [ingresoMensualFisica, setIngresoMensualFisica] = useState('$185,000 MXN');
  const [montoSolicitadoFisica, setMontoSolicitadoFisica] = useState('$850,000 MXN');
  const [emailFisica, setEmailFisica] = useState('');
  const [telefonoFisica, setTelefonoFisica] = useState('');

  // Notification method
  const [metodoNotificacion, setMetodoNotificacion] = useState<'whatsapp' | 'email' | 'manual'>('whatsapp');

  // Extraction Sources
  const [fuentes, setFuentes] = useState<ExtractionSource[]>(['sat_ciec', 'sat_opinion', 'buro_credito']);
  const [notas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFuente = (source: ExtractionSource) => {
    if (fuentes.includes(source)) {
      if (fuentes.length === 1) return;
      setFuentes(fuentes.filter((s) => s !== source));
    } else {
      setFuentes([...fuentes, source]);
    }
  };

  // Demo 1: Auto Crédito PF
  const handleFillDemoAutoPF = () => {
    setTipoPersona('persona_fisica');
    setTipoProducto('automotriz');
    setNombreCompletoFisica('Dra. Sofía Mendoza Galindo');
    setRfcFisica('MEGS860412TK9');
    setCurpFisica('MEGS860412MDFNLF08');
    setOcupacionFisica('Médico Especialista en Cirugía / PFAE');
    setIngresoMensualFisica('$195,000 MXN');
    setValorActivo('$1,350,000 MXN');
    setEnganchePorcentaje(45);
    setMontoSolicitadoFisica('$750,000 MXN');
    setPlazoMeses(48);
    setDestinoDetalle('SUV Volvo XC60 Ultimate Recharge 2026');
    setEmailFisica('sofia.mendoza@clinicamedica.com');
    setTelefonoFisica('+52 55 3829 1044');
    setMetodoNotificacion('whatsapp');
    setFuentes(['sat_ciec', 'sat_opinion', 'buro_credito', 'estados_financieros']);
    setNotas('Crédito automotriz premium. Enganche del 45% ($600,000 MXN). Solicitud con endoso de factura y seguro de cobertura amplia.');
  };

  // Demo 2: Leasing PM (Tractocamiones)
  const handleFillDemoLeasingPM = () => {
    setTipoPersona('persona_moral');
    setTipoProducto('arrendamiento');
    setRazonSocial('Transportes y Carga Especializada del Norte S.A. de C.V.');
    setRfcMoral('TCE190822LP3');
    setSectorMoral('Autotransporte Federal & Logística');
    setValorActivo('$4,100,000 MXN');
    setEnganchePorcentaje(15);
    setMontoSolicitadoMoral('$3,500,000 MXN');
    setPlazoMeses(36);
    setDestinoDetalle('4 Tractocamiones Kenworth T680 Modelo 2026');
    setNombreContacto('Ing. Héctor Garza Villarreal');
    setPuestoContacto('Director General');
    setEmailContacto('hgarza@transportesnorte.mx');
    setTelefonoContacto('+52 81 8329 9900');
    setMetodoNotificacion('whatsapp');
    setFuentes(['sat_ciec', 'sat_opinion', 'buro_credito', 'estados_financieros']);
    setNotas('Arrendamiento puro de tractocamiones con valor residual pactado al 15% al término del contrato.');
  };

  // Demo 3: Capital de Trabajo PM
  const handleFillDemoCapitalPM = () => {
    setTipoPersona('persona_moral');
    setTipoProducto('capital_trabajo');
    setRazonSocial('Distribuidora Farmacéutica & Hospitalaria S.A. de C.V.');
    setRfcMoral('DFH180612KP8');
    setSectorMoral('Comercialización de Medicamentos');
    setMontoSolicitadoMoral('$5,000,000 MXN');
    setPlazoMeses(24);
    setDestinoDetalle('Adquisición de inventario para licitación hospitalaria');
    setNombreContacto('Dra. Elena Ramos Garza');
    setPuestoContacto('Directora de Finanzas');
    setEmailContacto('eramos@distribuidorafarma.mx');
    setTelefonoContacto('+52 55 5812 4300');
    setMetodoNotificacion('whatsapp');
    setFuentes(['sat_ciec', 'sat_opinion', 'buro_credito']);
    setNotas('Línea de capital de trabajo para suministro y cobertura de órdenes de compra con IMSS / Sedena.');
  };

  // Update calculated financing when asset value or down payment changes
  const handleValorActivoChange = (val: string) => {
    setValorActivo(val);
    const numericVal = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericVal) && numericVal > 0) {
      const financiado = numericVal * (1 - enganchePorcentaje / 100);
      const formatted = `$${financiado.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;
      if (tipoPersona === 'persona_moral') {
        setMontoSolicitadoMoral(formatted);
      } else {
        setMontoSolicitadoFisica(formatted);
      }
    }
  };

  const handleEngancheChange = (pct: number) => {
    setEnganchePorcentaje(pct);
    const numericVal = parseFloat(valorActivo.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericVal) && numericVal > 0) {
      const financiado = numericVal * (1 - pct / 100);
      const formatted = `$${financiado.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;
      if (tipoPersona === 'persona_moral') {
        setMontoSolicitadoMoral(formatted);
      } else {
        setMontoSolicitadoFisica(formatted);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isMoral = tipoPersona === 'persona_moral';

    if (isMoral) {
      if (!razonSocial || !rfcMoral || !nombreContacto || !emailContacto || !telefonoContacto) return;
    } else {
      if (!nombreCompletoFisica || !rfcFisica || !emailFisica || !telefonoFisica) return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const folioNum = Math.floor(1000 + Math.random() * 9000);
    const id = `exp-${Date.now()}`;
    const rfcClean = isMoral ? rfcMoral.toUpperCase().trim() : rfcFisica.toUpperCase().trim();
    const token = `lucas-tok-${folioNum}-${rfcClean.substring(0, 3).toLowerCase()}`;

    const displayName = isMoral ? razonSocial : nombreCompletoFisica;
    const finalEmail = isMoral ? emailContacto : emailFisica;
    const finalPhone = isMoral ? telefonoContacto : telefonoFisica;
    const finalContactName = isMoral ? nombreContacto : nombreCompletoFisica;
    const finalPuesto = isMoral ? (puestoContacto || 'Representante Autorizado') : 'Titular Solicitante';
    const finalMonto = isMoral ? montoSolicitadoMoral : montoSolicitadoFisica;

    const newExp: Expediente = {
      id,
      folio: `EXP-${folioNum}`,
      empresa: {
        tipoPersona,
        tipoProducto,
        razonSocial: displayName,
        rfc: rfcClean,
        curp: !isMoral ? curpFisica.toUpperCase().trim() : undefined,
        sector: isMoral ? sectorMoral : ocupacionFisica,
        ocupacion: !isMoral ? ocupacionFisica : undefined,
        ingresoMensual: !isMoral ? ingresoMensualFisica : undefined,
        montoSolicitado: finalMonto,
        valorActivo: valorActivo || undefined,
        enganchePorcentaje: enganchePorcentaje || undefined,
        plazoMeses: plazoMeses || undefined,
        destinoDetalle: destinoDetalle || undefined,
      },
      contacto: {
        nombre: finalContactName,
        puesto: finalPuesto,
        email: finalEmail,
        telefono: finalPhone,
        metodoNotificacion,
      },
      fuentes,
      estado: 'enlace_enviado',
      creadoEn: formattedDate,
      actualizadoEn: formattedDate,
      tokenAcceso: token,
      notasInternas: notas,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          timestamp: formattedDate,
          titulo: isMoral ? 'Expediente empresarial registrado' : 'Expediente individual registrado',
          descripcion: `Se configuró solicitud de ${tipoProducto.toUpperCase()} para ${displayName} (${isMoral ? 'Persona Moral' : 'Persona Física'}).`,
          estado: 'done',
        },
        {
          id: `t-${Date.now()}-2`,
          timestamp: formattedDate,
          titulo: `Invitación enviada vía ${metodoNotificacion.toUpperCase()}`,
          descripcion: `Enlace de extracción entregado a ${finalContactName} (${finalEmail}).`,
          estado: 'active',
        },
        {
          id: `t-${Date.now()}-3`,
          timestamp: 'Pendiente',
          titulo: 'Autenticación CIEC en portal SAT',
          descripcion: 'El solicitante ingresará sus credenciales para autorizar lectura fiscal.',
          estado: 'pending',
        },
      ],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onCreate(newExp);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: tactileEase }}
          className="relative w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center justify-between bg-zinc-50/60">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Nuevo Expediente de Evaluación
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configura la persona, tipo de producto financiero y montos para detonar la extracción.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemoAutoPF}
                  className="text-[11px] h-7 gap-1 text-blue-800 border-blue-200 hover:bg-blue-50"
                  title="Demo Auto PF"
                >
                  <Car className="w-3 h-3 text-blue-600" />
                  <span>Demo Auto</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemoLeasingPM}
                  className="text-[11px] h-7 gap-1 text-teal-800 border-teal-200 hover:bg-teal-50"
                  title="Demo Leasing PM"
                >
                  <FileSpreadsheet className="w-3 h-3 text-teal-600" />
                  <span>Demo Leasing</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemoCapitalPM}
                  className="text-[11px] h-7 gap-1 text-amber-800 border-amber-200 hover:bg-amber-50"
                  title="Demo PYME PM"
                >
                  <Briefcase className="w-3 h-3 text-amber-600" />
                  <span>Demo PYME</span>
                </Button>
              </div>

              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* TIPO DE SOLICITANTE SELECTOR TABS */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block font-mono">
                1. Tipo de Solicitante
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => setTipoPersona('persona_moral')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    tipoPersona === 'persona_moral'
                      ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/90'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${tipoPersona === 'persona_moral' ? 'text-teal-700' : 'text-zinc-500'}`} />
                  <span>Persona Moral (Empresa)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPersona('persona_fisica')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    tipoPersona === 'persona_fisica'
                      ? 'bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/90'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                  }`}
                >
                  <User className={`w-4 h-4 ${tipoPersona === 'persona_fisica' ? 'text-indigo-700' : 'text-zinc-500'}`} />
                  <span>Persona Individual (Física / PFAE)</span>
                </button>
              </div>
            </div>

            {/* TIPO DE PRODUCTO FINANCIERO */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block font-mono">
                2. Producto Financiero a Evaluar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRODUCTOS_CONFIG.map((prod) => {
                  const Icon = prod.icon;
                  const isSelected = tipoProducto === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setTipoProducto(prod.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-teal-50/50 border-teal-500 text-teal-950 shadow-xs ring-1 ring-teal-400/40'
                          : 'bg-white border-zinc-200/80 hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-800">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100/90 text-zinc-600">
                          {prod.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{prod.label}</div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{prod.descripcion}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 3: DATOS DEL SOLICITANTE */}
            {tipoPersona === 'persona_moral' ? (
              /* PERSONA MORAL FIELDS */
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 tracking-tight uppercase border-b border-zinc-100 pb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. Información de la Empresa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Razón Social <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Ej. Distribuidora Industrial Monterrey S.A. de C.V."
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      RFC de la Empresa (12 caracteres) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      maxLength={12}
                      placeholder="DIM180410XX1"
                      value={rfcMoral}
                      onChange={(e) => setRfcMoral(e.target.value.toUpperCase())}
                      className="font-mono uppercase text-xs tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Sector / Giro Comercial
                    </label>
                    <Input
                      placeholder="Ej. Logística, Autotransporte, Comercio"
                      value={sectorMoral}
                      onChange={(e) => setSectorMoral(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* PRODUCT SPECIFIC PARAMS (VEHICULAR / LEASING / MONTOS) */}
                {(tipoProducto === 'automotriz' || tipoProducto === 'arrendamiento') ? (
                  <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-teal-700" />
                        Parámetros del Bien / Flota ({tipoProducto === 'automotriz' ? 'Automotriz' : 'Leasing'})
                      </span>
                      <span className="text-[10px] font-mono text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                        Financiamiento Automático
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-3">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Descripción de la Unidad o Activo
                        </label>
                        <Input
                          placeholder="Ej. SUV Volvo XC60 Recharge 2026 / 4 Kenworth T680"
                          value={destinoDetalle}
                          onChange={(e) => setDestinoDetalle(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Valor Total del Activo
                        </label>
                        <Input
                          placeholder="$1,350,000 MXN"
                          value={valorActivo}
                          onChange={(e) => handleValorActivoChange(e.target.value)}
                          className="text-xs font-mono bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          % Enganche / Depósito ({enganchePorcentaje}%)
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[15, 20, 30, 45].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleEngancheChange(pct)}
                              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                                enganchePorcentaje === pct
                                  ? 'bg-teal-700 text-white shadow-2xs'
                                  : 'bg-white border border-teal-200 text-teal-800 hover:bg-teal-100/50'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Plazo en Meses
                        </label>
                        <select
                          value={plazoMeses}
                          onChange={(e) => setPlazoMeses(Number(e.target.value))}
                          className="w-full text-xs font-mono p-1.5 rounded-md border border-zinc-200 bg-white"
                        >
                          <option value={12}>12 meses (1 año)</option>
                          <option value={24}>24 meses (2 años)</option>
                          <option value={36}>36 meses (3 años)</option>
                          <option value={48}>48 meses (4 años)</option>
                          <option value={60}>60 meses (5 años)</option>
                          <option value={72}>72 meses (6 años)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Monto Neto Solicitado / Financiado
                        </label>
                        <Input
                          value={montoSolicitadoMoral}
                          onChange={(e) => setMontoSolicitadoMoral(e.target.value)}
                          className="text-xs font-mono bg-white font-bold text-teal-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Monto de Crédito Solicitado
                      </label>
                      <Input
                        placeholder="$2,000,000 MXN"
                        value={montoSolicitadoMoral}
                        onChange={(e) => setMontoSolicitadoMoral(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Plazo Solicitado
                      </label>
                      <select
                        value={plazoMeses}
                        onChange={(e) => setPlazoMeses(Number(e.target.value))}
                        className="w-full text-xs font-mono p-2 rounded-md border border-zinc-200 bg-white"
                      >
                        <option value={12}>12 meses</option>
                        <option value={18}>18 meses</option>
                        <option value={24}>24 meses</option>
                        <option value={36}>36 meses</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Destino Específico del Crédito
                      </label>
                      <Input
                        placeholder="Ej. Compra de inventario, cobertura de cuentas por cobrar, etc."
                        value={destinoDetalle}
                        onChange={(e) => setDestinoDetalle(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* SECCIÓN CONTACTO PM */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 tracking-tight uppercase border-b border-zinc-100 pb-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>4. Representante Legal &amp; Contacto Autorizado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Nombre del Representante <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="Ej. Lic. Carlos Aréchiga"
                        value={nombreContacto}
                        onChange={(e) => setNombreContacto(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Cargo o Función
                      </label>
                      <Input
                        placeholder="Ej. Director General, Contralor"
                        value={puestoContacto}
                        onChange={(e) => setPuestoContacto(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="contacto@empresa.com"
                        value={emailContacto}
                        onChange={(e) => setEmailContacto(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        Teléfono / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="+52 55 1234 5678"
                        value={telefonoContacto}
                        onChange={(e) => setTelefonoContacto(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PERSONA FÍSICA FIELDS */
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 tracking-tight uppercase border-b border-zinc-100 pb-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Información del Solicitante (Persona Individual)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Ej. Dra. Sofía Mendoza Galindo"
                      value={nombreCompletoFisica}
                      onChange={(e) => setNombreCompletoFisica(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      RFC de Persona Física (13 caracteres) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      maxLength={13}
                      placeholder="MEGS860412TK9"
                      value={rfcFisica}
                      onChange={(e) => setRfcFisica(e.target.value.toUpperCase())}
                      className="font-mono uppercase text-xs tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-zinc-400" />
                      CURP (18 caracteres)
                    </label>
                    <Input
                      maxLength={18}
                      placeholder="MEGS860412MDFNLF08"
                      value={curpFisica}
                      onChange={(e) => setCurpFisica(e.target.value.toUpperCase())}
                      className="font-mono uppercase text-xs tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-zinc-400" />
                      Ocupación / Actividad Económica
                    </label>
                    <Input
                      placeholder="Ej. Médico Especialista, Consultor TI, PFAE"
                      value={ocupacionFisica}
                      onChange={(e) => setOcupacionFisica(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-zinc-400" />
                      Ingreso Mensual Estimado
                    </label>
                    <Input
                      placeholder="Ej. $185,000 MXN"
                      value={ingresoMensualFisica}
                      onChange={(e) => setIngresoMensualFisica(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                {/* PRODUCT SPECIFIC PARAMS (AUTO PF / PERSONAL PF) */}
                {tipoProducto === 'automotriz' ? (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-blue-700" />
                        Parámetros de Crédito Automotriz
                      </span>
                      <span className="text-[10px] font-mono text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded">
                        LTV &amp; Enganche
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-3">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Vehículo / Modelo Solicitado
                        </label>
                        <Input
                          placeholder="Ej. Volvo XC60 Ultimate Recharge 2026"
                          value={destinoDetalle}
                          onChange={(e) => setDestinoDetalle(e.target.value)}
                          className="text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Precio Total del Auto
                        </label>
                        <Input
                          placeholder="$1,350,000 MXN"
                          value={valorActivo}
                          onChange={(e) => handleValorActivoChange(e.target.value)}
                          className="text-xs font-mono bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          % Enganche ({enganchePorcentaje}%)
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[20, 30, 45, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleEngancheChange(pct)}
                              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                                enganchePorcentaje === pct
                                  ? 'bg-blue-700 text-white shadow-2xs'
                                  : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/50'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Plazo en Meses
                        </label>
                        <select
                          value={plazoMeses}
                          onChange={(e) => setPlazoMeses(Number(e.target.value))}
                          className="w-full text-xs font-mono p-1.5 rounded-md border border-zinc-200 bg-white"
                        >
                          <option value={24}>24 meses (2 años)</option>
                          <option value={36}>36 meses (3 años)</option>
                          <option value={48}>48 meses (4 años)</option>
                          <option value={60}>60 meses (5 años)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Monto a Financiar (Línea Solicitada)
                        </label>
                        <Input
                          value={montoSolicitadoFisica}
                          onChange={(e) => setMontoSolicitadoFisica(e.target.value)}
                          className="text-xs font-mono bg-white font-bold text-blue-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Monto de Crédito Solicitado
                      </label>
                      <Input
                        placeholder="$850,000 MXN"
                        value={montoSolicitadoFisica}
                        onChange={(e) => setMontoSolicitadoFisica(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Plazo Solicitado
                      </label>
                      <select
                        value={plazoMeses}
                        onChange={(e) => setPlazoMeses(Number(e.target.value))}
                        className="w-full text-xs font-mono p-2 rounded-md border border-zinc-200 bg-white"
                      >
                        <option value={12}>12 meses</option>
                        <option value={18}>18 meses</option>
                        <option value={24}>24 meses</option>
                        <option value={36}>36 meses</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Destino Específico del Crédito
                      </label>
                      <Input
                        placeholder="Ej. Remodelación de consultorio, liquidez de capital de trabajo personal, etc."
                        value={destinoDetalle}
                        onChange={(e) => setDestinoDetalle(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* SECCIÓN 4 PF: CONTACTO */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 tracking-tight uppercase border-b border-zinc-100 pb-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>4. Datos de Contacto Directo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="nombre@correo.com"
                        value={emailFisica}
                        onChange={(e) => setEmailFisica(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        Teléfono / WhatsApp Directo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="+52 55 1234 5678"
                        value={telefonoFisica}
                        onChange={(e) => setTelefonoFisica(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN NOTIFICACIÓN */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-zinc-700">
                Canal para enviar la solicitud de extracción:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoNotificacion('whatsapp')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    metodoNotificacion === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-400/30'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp Directo
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoNotificacion('email')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    metodoNotificacion === 'email'
                      ? 'border-teal-500 bg-teal-50/60 text-teal-950 font-semibold shadow-xs ring-1 ring-teal-400/30'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  Correo Mágico
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoNotificacion('manual')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    metodoNotificacion === 'manual'
                      ? 'border-zinc-600 bg-zinc-100 text-zinc-950 font-semibold shadow-xs ring-1 ring-zinc-400/30'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-zinc-600" />
                  Enlace Manual
                </button>
              </div>
            </div>

            {/* SECCIÓN FUENTES DE EXTRACCIÓN */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 tracking-tight uppercase border-b border-zinc-100 pb-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>5. Módulos &amp; Fuentes Requeridas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* SAT CIEC */}
                <div
                  onClick={() => toggleFuente('sat_ciec')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    fuentes.includes('sat_ciec')
                      ? 'border-teal-500 bg-teal-50/40 text-teal-950'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fuentes.includes('sat_ciec')}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-medium text-xs text-zinc-950">
                      Portal SAT (CIEC / Facturas)
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {tipoPersona === 'persona_moral'
                        ? 'CFDIs emitidos/recibidos y facturación corporativa.'
                        : 'CFDIs de honorarios, nómina o actividad económica personal.'}
                    </p>
                  </div>
                </div>

                {/* Opinión 32-D */}
                <div
                  onClick={() => toggleFuente('sat_opinion')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    fuentes.includes('sat_opinion')
                      ? 'border-teal-500 bg-teal-50/40 text-teal-950'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fuentes.includes('sat_opinion')}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-medium text-xs text-zinc-950">
                      Opinión 32-D SAT
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Constancia de obligaciones fiscales al corriente (Positiva).
                    </p>
                  </div>
                </div>

                {/* Buró */}
                <div
                  onClick={() => toggleFuente('buro_credito')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    fuentes.includes('buro_credito')
                      ? 'border-teal-500 bg-teal-50/40 text-teal-950'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fuentes.includes('buro_credito')}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-medium text-xs text-zinc-950">
                      {tipoPersona === 'persona_moral' ? 'Buró de Crédito PM' : 'Buró de Crédito PF'}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {tipoPersona === 'persona_moral'
                        ? 'Historial financiero corporativo de la empresa.'
                        : 'Historial crediticio y score personal del titular.'}
                    </p>
                  </div>
                </div>

                {/* Balances / Ingresos */}
                <div
                  onClick={() => toggleFuente('estados_financieros')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    fuentes.includes('estados_financieros')
                      ? 'border-teal-500 bg-teal-50/40 text-teal-950'
                      : 'border-zinc-200/80 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fuentes.includes('estados_financieros')}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-medium text-xs text-zinc-950">
                      {tipoPersona === 'persona_moral' ? 'Balances & Resultados' : 'Declaración Anual / Ingresos'}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {tipoPersona === 'persona_moral'
                        ? 'Balance general con cédula de contador.'
                        : 'Declaración anual SAT o recibos de ingresos comprobables.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTAS */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-zinc-700">
                Notas internas o instrucciones para el analista
              </label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Línea solicitada para adquisición de equipo..."
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            {/* FOOTER */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs gap-1.5 font-semibold"
              >
                <span>Generar Expediente y Enviar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
