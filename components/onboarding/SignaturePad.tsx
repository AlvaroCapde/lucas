'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, Type, ShieldCheck } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null, type: 'draw' | 'type') => void;
  defaultName?: string;
}

export function SignaturePad({ onSignatureChange, defaultName }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(defaultName || '');

  // Setup canvas with correct DPI
  useEffect(() => {
    if (mode !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a'; // dark slate

    // Redraw if already had content
    const timeout = setTimeout(() => {
      // Allow DOM to layout first
    }, 50);

    return () => clearTimeout(timeout);
  }, [mode]);

  // Touch & Mouse coordinates
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl, 'draw');
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null, 'draw');
  };

  const handleTypedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedName(val);
    if (val.trim().length > 3) {
      onSignatureChange(val.trim(), 'type');
    } else {
      onSignatureChange(null, 'type');
    }
  };

  // Sample signature helper for demo
  const handleAutoSignDemo = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      clearCanvas();
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.6);
      ctx.bezierCurveTo(w * 0.25, h * 0.2, w * 0.35, h * 0.8, w * 0.45, h * 0.4);
      ctx.bezierCurveTo(w * 0.55, h * 0.1, w * 0.65, h * 0.7, w * 0.85, h * 0.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.75);
      ctx.lineTo(w * 0.78, h * 0.72);
      ctx.stroke();

      setHasDrawn(true);
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl, 'draw');
    } else {
      const name = defaultName || 'Fernando Mendoza Villalobos';
      setTypedName(name);
      onSignatureChange(name, 'type');
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
          <button
            type="button"
            onClick={() => {
              setMode('draw');
              onSignatureChange(hasDrawn && canvasRef.current ? canvasRef.current.toDataURL() : null, 'draw');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'draw'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-teal-700" />
            Trazo digital
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('type');
              onSignatureChange(typedName.trim().length > 3 ? typedName : null, 'type');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'type'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-teal-700" />
            Escribir nombre
          </button>
        </div>

        {/* Sample helper */}
        <button
          type="button"
          onClick={handleAutoSignDemo}
          className="text-[11px] text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1 rounded-md transition-colors"
        >
          Firma de muestra
        </button>
      </div>

      {mode === 'draw' ? (
        <div className="relative border border-zinc-300 rounded-xl bg-white overflow-hidden touch-none hover:border-zinc-400 transition-colors">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-36 cursor-crosshair bg-white"
          />

          {/* Signature Guide */}
          <div className="pointer-events-none absolute bottom-5 inset-x-6 border-b border-zinc-200 flex items-center justify-between text-[11px] text-zinc-400">
            <span>X</span>
            <span>Línea de firma</span>
          </div>

          {!hasDrawn && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-zinc-400 text-xs gap-1">
              <PenTool className="w-4 h-4 text-zinc-300 stroke-[1.5]" />
              <span>Dibuja tu firma aquí con el dedo o mouse</span>
            </div>
          )}

          {/* Clear Button */}
          {hasDrawn && (
            <button
              type="button"
              onClick={clearCanvas}
              className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg shadow-xs hover:bg-zinc-50 transition-colors"
            >
              <Eraser className="w-3.5 h-3.5 text-zinc-500" />
              Limpiar
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={handleTypedChange}
            placeholder="Nombre completo del representante legal"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-950 font-serif text-base italic shadow-xs focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <p className="text-[11px] text-zinc-500 leading-normal">
            Al escribir tu nombre completo, declaras bajo protesta de decir verdad que cuentas con facultades legales suficientes para autorizar la consulta.
          </p>
        </div>
      )}

      {/* Legal validation label */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
        <span className="truncate">
          Firma electrónica con validez legal bajo la Norma Oficial Mexicana NOM-151.
        </span>
      </div>
    </div>
  );
}
