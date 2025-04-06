import React from "react";
import { motion } from "framer-motion";
import { SatelliteDish } from "lucide-react";

export default function SatelliteScannerScreen() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      <div className="relative w-[320px] h-[320px] border-4 border-green-400 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_60px_10px_rgba(0,255,0,0.3)]">
        {/* Scanning Pulse Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-full h-full bg-green-400 rounded-full opacity-10"
        />

        {/* Satellite Icon */}
        <SatelliteDish className="text-white z-10 drop-shadow-xl" size={72} />

        {/* Rotating scanner line */}
        <motion.div
          className="absolute w-1 h-[160px] bg-green-400 top-[0px] left-1/2 origin-bottom"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />

        {/* Data signal rings */}
        <motion.div
          className="absolute w-full h-full rounded-full border border-green-300"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          className="absolute w-[90%] h-[90%] rounded-full border border-green-500"
          initial={{ scale: 1, opacity: 0.2 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Splash Scanning Label */}
        <div className="absolute top-full mt-6 text-green-300 font-mono text-xl tracking-wide animate-pulse">
          Initializing satellite systems...
        </div>
      </div>
    </div>
  );
}
