'use client';

import * as React from 'react';
import { Send, RotateCcw } from 'lucide-react';
import { Expediente } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CreditExpertChatProps {
  expediente: Expediente;
}

const AUTO_SUGGESTED_QUESTIONS = [
  '¿Cuál es el LTV y enganche mínimo para este crédito automotriz?',
  '¿La cuota mensual cumple el DTI máximo del 30%?',
  '¿Qué requisitos de seguro y garantía prendaria aplican?',
  '¿Recomiendas autorizar la adquisición de esta unidad?',
  'Redacta un dictamen ejecutivo para el comité',
];

const LEASING_SUGGESTED_QUESTIONS = [
  '¿Qué cobertura de EBITDA vs canon de arrendamiento exige la política?',
  '¿Cuáles son los beneficios de deducción fiscal del 100% de rentas?',
  '¿Cómo se estructura el valor residual al término del contrato?',
  '¿Recomiendas autorizar este arrendamiento de flota/maquinaria?',
  'Redacta un dictamen ejecutivo para el comité',
];

const FACTORAJE_SUGGESTED_QUESTIONS = [
  '¿Cuál es el aforo y calidad crediticia de los deudores cedidos?',
  '¿Cómo se valida la cobranza y los CFDIs PPD en el SAT?',
  '¿Qué rotación de cartera (DSO) presenta el cliente?',
  '¿Recomiendas autorizar la línea de factoraje revolvente?',
  'Redacta un dictamen ejecutivo para el comité',
];

const PM_SUGGESTED_QUESTIONS = [
  '¿En qué criterios se fija Apoyando Ideas para este crédito de capital de trabajo?',
  '¿Recomiendas aprobar la línea comercial solicitada?',
  '¿Cómo evalúa el modelo la facturación SAT y la concentración de clientes?',
  '¿Qué garantías y avales exige la política?',
  'Redacta un dictamen ejecutivo para el comité',
];

const PF_SUGGESTED_QUESTIONS = [
  '¿Cómo evalúa el modelo la capacidad de pago y el DTI mensual individual?',
  '¿Recomiendas aprobar este crédito personal?',
  '¿Qué score y comportamiento en Buró de Crédito presenta?',
  '¿Requiere aval o pagaré con firma digital?',
  'Redacta un dictamen ejecutivo para el comité',
];

export function CreditExpertChat({ expediente }: CreditExpertChatProps) {
  const isPF = (expediente.empresa.tipoPersona || (expediente.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
  const tipoProducto = expediente.empresa.tipoProducto || (isPF ? 'personal' : 'capital_trabajo');

  const suggestedQuestions =
    tipoProducto === 'automotriz'
      ? AUTO_SUGGESTED_QUESTIONS
      : tipoProducto === 'arrendamiento'
      ? LEASING_SUGGESTED_QUESTIONS
      : tipoProducto === 'factoraje'
      ? FACTORAJE_SUGGESTED_QUESTIONS
      : isPF
      ? PF_SUGGESTED_QUESTIONS
      : PM_SUGGESTED_QUESTIONS;

  // Starts completely empty: no message from the beginning
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom on message
  React.useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/expedientes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          expediente,
        }),
      });

      if (!res.ok) throw new Error('Error al consultar el experto');
      const data = await res.json();

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.content || 'Sin respuesta',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'No fue posible completar la consulta en este momento. Por favor intenta de nuevo.',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputValue('');
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col h-[640px] lg:h-[740px] overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            AI
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-950 text-sm truncate">
                Experto Apoyando Ideas
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                En línea
              </span>
            </div>
            <p className="text-xs text-zinc-500 truncate">
              {isPF ? `Análisis de crédito personal: ${expediente.empresa.razonSocial}` : `Análisis de crédito para ${expediente.empresa.razonSocial}`}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            title="Limpiar chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        )}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Empty state: No initial message from assistant */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              AI
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-900">
                Experto Apoyando Ideas
              </h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Evaluación crediticia de <span className="font-medium text-zinc-800">{expediente.empresa.razonSocial}</span> ({isPF ? 'Persona Física' : 'Persona Moral'}). Consulta sobre capacidad de pago, métricas fiscales o garantías recomendadas.
              </p>
            </div>

            {/* Suggested Question Pills */}
            <div className="w-full pt-2">
              <p className="text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider font-mono">
                Preguntas sugeridas
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="text-left text-xs bg-white hover:bg-teal-50 border border-zinc-200 hover:border-teal-300 text-zinc-700 hover:text-teal-900 px-3 py-1.5 rounded-full transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                  isUser
                    ? 'bg-zinc-900 text-white rounded-tr-xs'
                    : 'bg-zinc-50 border border-zinc-200/80 text-zinc-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line font-sans">
                  {msg.content}
                </div>

                <div
                  className={`text-[9px] mt-1 font-mono ${
                    isUser ? 'text-zinc-400 text-right' : 'text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
              AI
            </div>
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-zinc-500 ml-1.5 font-sans">
                  Analizando expediente...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at bottom */}
      <div className="p-4 border-t border-zinc-200 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregunta a Experto Apoyando Ideas sobre este crédito..."
            disabled={isLoading}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white disabled:text-zinc-500 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-zinc-500 font-mono">
            Apoyando Ideas • Modelo de evaluación crediticia
          </span>
        </div>
      </div>
    </div>
  );
}
