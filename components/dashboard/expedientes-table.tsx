import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  ChevronRight,
  User,
  Phone,
  Mail,
  Building2,
  Car,
  FileSpreadsheet,
  Briefcase,
  Receipt,
  Home,
  CreditCard,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Expediente, TipoPersona, TipoProductoFinanciero } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExpedientesTableProps {
  expedientes: Expediente[];
  onSelectExpediente: (expediente: Expediente) => void;
  onOpenClientPortal: (expediente: Expediente) => void;
}

export function getProductBadgeInfo(tipo?: TipoProductoFinanciero) {
  switch (tipo) {
    case 'automotriz':
      return {
        label: 'Automotriz',
        icon: Car,
        className: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    case 'arrendamiento':
      return {
        label: 'Leasing',
        icon: FileSpreadsheet,
        className: 'bg-teal-50 text-teal-800 border-teal-200',
      };
    case 'capital_trabajo':
      return {
        label: 'Cap. Trabajo',
        icon: Briefcase,
        className: 'bg-amber-50 text-amber-900 border-amber-200',
      };
    case 'personal':
      return {
        label: 'Personal',
        icon: User,
        className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      };
    case 'factoraje':
      return {
        label: 'Factoraje',
        icon: Receipt,
        className: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    case 'hipotecario':
      return {
        label: 'Hipotecario',
        icon: Home,
        className: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    default:
      return {
        label: 'Crédito',
        icon: CreditCard,
        className: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      };
  }
}

export function getAIApprovalStatus(exp: Expediente): 'aprobado' | 'rechazado' | 'pendiente' {
  if (exp.resumen?.scoreSolvencia !== undefined) {
    return exp.resumen.scoreSolvencia >= 700 ? 'aprobado' : 'rechazado';
  }
  if (exp.estado === 'aprobado_ia') return 'aprobado';
  if (exp.estado === 'rechazado_ia') return 'rechazado';
  return 'pendiente';
}

export function AIApprovalBadge({ status }: { status: 'aprobado' | 'rechazado' | 'pendiente' }) {
  if (status === 'aprobado') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 tracking-tight shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>Aprobado</span>
      </span>
    );
  }

  if (status === 'rechazado') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 tracking-tight">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Rechazado</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-normal text-zinc-400 bg-zinc-50 border border-zinc-200/70 tracking-tight">
      <span>Pendiente</span>
    </span>
  );
}

export function ExpedientesTable({
  expedientes,
  onSelectExpediente,
  onOpenClientPortal,
}: ExpedientesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoPersonaFilter, setTipoPersonaFilter] = useState<'all' | TipoPersona>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'aprobado_ia' | 'rechazado_ia' | 'credito_aprobado' | 'credito_rechazado' | 'en_curso'
  >('all');

  const filteredExpedientes = expedientes.filter((exp) => {
    // Tipo de persona filter
    if (tipoPersonaFilter !== 'all') {
      const expTipo = exp.empresa.tipoPersona || (exp.empresa.rfc.length === 12 ? 'persona_moral' : 'persona_fisica');
      if (expTipo !== tipoPersonaFilter) return false;
    }

    // Text search filter
    const matchesSearch =
      exp.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.empresa.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.empresa.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.empresa.curp && exp.empresa.curp.toLowerCase().includes(searchTerm.toLowerCase())) ||
      exp.contacto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.contacto.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    const aiStatus = getAIApprovalStatus(exp);
    if (statusFilter === 'all') return true;
    if (statusFilter === 'aprobado_ia') return aiStatus === 'aprobado';
    if (statusFilter === 'rechazado_ia') return aiStatus === 'rechazado';
    if (statusFilter === 'credito_aprobado') {
      return exp.estado === 'credito_aprobado' || exp.estado === 'completado';
    }
    if (statusFilter === 'credito_rechazado') {
      return exp.estado === 'credito_rechazado';
    }
    if (statusFilter === 'en_curso') {
      return ['enlace_enviado', 'esperando_credenciales', 'extrayendo', 'pendiente_envio'].includes(
        exp.estado
      );
    }
    return true;
  });

  const countMorales = expedientes.filter(
    (e) => (e.empresa.tipoPersona || (e.empresa.rfc.length === 12 ? 'persona_moral' : 'persona_fisica')) === 'persona_moral'
  ).length;
  const countFisicas = expedientes.filter(
    (e) => (e.empresa.tipoPersona || (e.empresa.rfc.length === 12 ? 'persona_moral' : 'persona_fisica')) === 'persona_fisica'
  ).length;

  const countAprobadosIA = expedientes.filter((e) => getAIApprovalStatus(e) === 'aprobado').length;
  const countRechazadosIA = expedientes.filter((e) => getAIApprovalStatus(e) === 'rechazado').length;
  const countAprobados = expedientes.filter(
    (e) => e.estado === 'credito_aprobado' || e.estado === 'completado'
  ).length;
  const countRechazados = expedientes.filter((e) => e.estado === 'credito_rechazado').length;
  const countEnCurso = expedientes.filter((e) =>
    ['enlace_enviado', 'esperando_credenciales', 'extrayendo', 'pendiente_envio'].includes(e.estado)
  ).length;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/70 rounded-2xl shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 md:p-5 border-b border-zinc-200/60 flex flex-col gap-3 bg-zinc-50/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por RFC, Empresa, Nombre, Folio..."
              className="pl-9 bg-white text-xs h-9"
            />
          </div>

          {/* Tipo de Persona Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-zinc-400 text-[11px] font-mono mr-1 hidden sm:inline">ENTIDAD:</span>
            <button
              onClick={() => setTipoPersonaFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                tipoPersonaFilter === 'all'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              Todas ({expedientes.length})
            </button>
            <button
              onClick={() => setTipoPersonaFilter('persona_moral')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                tipoPersonaFilter === 'persona_moral'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'bg-white border border-teal-200/80 text-teal-800 hover:bg-teal-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Empresas PM ({countMorales})</span>
            </button>
            <button
              onClick={() => setTipoPersonaFilter('persona_fisica')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                tipoPersonaFilter === 'persona_fisica'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white border border-amber-200/80 text-amber-900 hover:bg-amber-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personas PF ({countFisicas})</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs border-t border-zinc-200/40 pt-2.5 flex-wrap">
          <span className="text-zinc-400 text-[11px] font-mono mr-1 hidden sm:inline">FILTRAR:</span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            Todos ({expedientes.length})
          </button>

          <button
            onClick={() => setStatusFilter('aprobado_ia')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              statusFilter === 'aprobado_ia'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Aprobado por IA ({countAprobadosIA})</span>
          </button>

          <button
            onClick={() => setStatusFilter('rechazado_ia')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              statusFilter === 'rechazado_ia'
                ? 'bg-rose-800 text-white shadow-xs'
                : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rechazado por IA ({countRechazadosIA})</span>
          </button>

          <button
            onClick={() => setStatusFilter('credito_aprobado')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              statusFilter === 'credito_aprobado'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Aprobados ({countAprobados})</span>
          </button>

          <button
            onClick={() => setStatusFilter('credito_rechazado')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              statusFilter === 'credito_rechazado'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <span>Rechazados ({countRechazados})</span>
          </button>

          <button
            onClick={() => setStatusFilter('en_curso')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs ${
              statusFilter === 'en_curso'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            En Captura ({countEnCurso})
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/70 bg-zinc-50/60 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Folio / Solicitante</th>
              <th className="py-3 px-4 font-semibold">Contacto Destinatario</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 font-semibold">Aprobación IA</th>
              <th className="py-3 px-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs">
            {filteredExpedientes.map((exp) => {
              const isPF = (exp.empresa.tipoPersona || (exp.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
              const aiApproval = getAIApprovalStatus(exp);

              return (
                <tr
                  key={exp.id}
                  onClick={() => onSelectExpediente(exp)}
                  className="hover:bg-zinc-50/70 cursor-pointer transition-colors group"
                >
                  {/* Folio & Empresa / Persona */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {exp.folio}
                      </span>
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isPF ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-teal-50 text-teal-900 border-teal-200'
                      }`}>
                        {isPF ? <User className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                        {isPF ? 'PF' : 'PM'}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-700 bg-zinc-100/80 px-1.5 py-0.5 rounded border border-zinc-200">
                        {exp.empresa.rfc}
                      </span>
                    </div>
                    <div className="font-semibold text-zinc-950 mt-1 text-xs group-hover:text-teal-700 transition-colors">
                      {exp.empresa.razonSocial}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <span>{exp.empresa.sector}</span>
                      {isPF && exp.empresa.ocupacion && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-600 font-medium">{exp.empresa.ocupacion}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{exp.contacto.nombre}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      <span className="truncate max-w-[150px]">{exp.contacto.email}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{exp.contacto.telefono}</span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={exp.estado} />
                    <div className="text-[10px] font-mono text-zinc-400 mt-1">
                      Act: {exp.actualizadoEn.split(',')[0]}
                    </div>
                  </td>

                  {/* Aprobación IA */}
                  <td className="py-3.5 px-4">
                    <AIApprovalBadge status={aiApproval} />
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="Probar portal del cliente"
                        onClick={() => onOpenClientPortal(exp)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Cliente</span>
                      </button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectExpediente(exp)}
                        className="h-7 text-xs px-2.5 cursor-pointer hover:bg-zinc-100"
                      >
                        <span>Ver</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-zinc-100">
        {filteredExpedientes.map((exp) => {
          const isPF = (exp.empresa.tipoPersona || (exp.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
          const aiApproval = getAIApprovalStatus(exp);

          return (
            <div
              key={exp.id}
              onClick={() => onSelectExpediente(exp)}
              className="p-4 space-y-3 hover:bg-zinc-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                    {exp.folio}
                  </span>
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    isPF ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-teal-50 text-teal-900 border-teal-200'
                  }`}>
                    {isPF ? <User className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                    {isPF ? 'PF' : 'PM'}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-700 bg-zinc-100/80 px-1.5 py-0.5 rounded border border-zinc-200">
                    {exp.empresa.rfc}
                  </span>
                </div>
                <StatusBadge status={exp.estado} />
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div>
                  <h4 className="font-semibold text-zinc-950 text-xs">{exp.empresa.razonSocial}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    <span>{exp.contacto.nombre} ({exp.contacto.telefono})</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-0.5">IA:</span>
                  <AIApprovalBadge status={aiApproval} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenClientPortal(exp)}
                  className="h-7 text-xs text-teal-700 cursor-pointer"
                >
                  Probar Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectExpediente(exp)}
                  className="h-7 text-xs cursor-pointer hover:bg-zinc-100"
                >
                  Ver
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredExpedientes.length === 0 && (
        <div className="p-12 text-center space-y-2">
          <p className="text-sm font-medium text-zinc-900">No se encontraron expedientes</p>
          <p className="text-xs text-zinc-500">
            Intenta con otro término de búsqueda o cambia los filtros de estado.
          </p>
        </div>
      )}
    </div>
  );
}
