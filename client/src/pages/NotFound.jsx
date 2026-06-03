import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="text-center animate-scale-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6 shadow-xl shadow-primary-500/25">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-surface-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all-300 shadow-lg shadow-primary-500/25"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
