'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-200 to-purple-100 flex items-center justify-center overflow-hidden relative">
      {/* Floating hearts background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-400/20 text-4xl"
          initial={{ 
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
            rotate: Math.random() * 360
          }}
          animate={{ 
            y: [-20, 20],
            x: [-10, 10],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 360],
          }}
          transition={{ 
            repeat: Infinity,
            duration: Math.random() * 4 + 3,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          ❤️
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 1,
          ease: "easeOut",
          staggerChildren: 0.2
        }}
        className="text-center p-12 backdrop-blur-md bg-white/40 rounded-3xl shadow-2xl
        border border-white/50 relative z-10 max-w-xl mx-4"
      >
        {/* Decorative corner hearts */}
        <motion.div 
          className="absolute -top-4 -left-4 text-pink-500 text-4xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >❤️</motion.div>
        <motion.div 
          className="absolute -top-4 -right-4 text-pink-500 text-4xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >❤️</motion.div>
        <motion.div 
          className="absolute -bottom-4 -left-4 text-pink-500 text-4xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >❤️</motion.div>
        <motion.div 
          className="absolute -bottom-4 -right-4 text-pink-500 text-4xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >❤️</motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-8 drop-shadow-sm"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          For My Special One ❤️
        </motion.h1>
        <Link
          href="/countdown"
          className="inline-block px-8 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full
          font-semibold shadow-lg hover:from-rose-500 hover:to-pink-600 transform hover:scale-105 hover:rotate-1
          transition duration-300 ease-in-out border border-white/20 relative overflow-hidden group"
        >
          Click to Begin Our Journey
        </Link>
      </motion.div>
    </main>
  );
}
