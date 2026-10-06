"use client"

import { motion } from "framer-motion"

interface PipelineLoaderProps {
  message?: string
}

const tactileEase = [0.16, 1, 0.3, 1] as const

export function PipelineLoader({ message = "Procesando extracción..." }: PipelineLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-5">
      {/* Indicador de Precisión Técnica */}
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Anillo exterior sutil */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
        
        {/* Anillo de escaneo técnico con acento ámbar/naranja */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-orange-500"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Núcleo de estado táctil */}
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50"
          animate={{
            scale: [0.9, 1.15, 0.9],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: tactileEase,
          }}
        />
      </div>

      {/* Estado transaccional */}
      <div className="text-center space-y-1.5">
        <motion.p
          className="text-sm font-medium tracking-tight text-zinc-900"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: tactileEase }}
        >
          {message}
        </motion.p>
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>SOCKET_ACTIVE // HANDSHAKE_SAT</span>
        </div>
      </div>
    </div>
  )
}
