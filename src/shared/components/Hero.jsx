import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="pt-20 pb-12 bg-gradient-to-br from-blue-400 to-indigo-600 text-white relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center px-6"
      >
        <h1 className="text-5xl font-extrabold leading-tight mb-4">
          Empowering Learning Experiences
        </h1>
        <p className="text-lg mb-8">
          Find the best tutors, track tuition progress, and create dynamic learning paths.
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg shadow-lg"
        >
          Get Started
        </motion.button>
      </motion.div>

      {/* Optional floating images or shapes */}
      <motion.div
        className="absolute inset-0 mix-blend-overlay pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
      />
    </section>
  );
}
