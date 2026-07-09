import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-8xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-dark-900 dark:text-white mb-2">Page not found</h2>
        <p className="text-dark-500 dark:text-dark-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary">
          <Home size={18} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
