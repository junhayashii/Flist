import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import flistIcon from '../assets/flist-icon.png';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data) {
        // Backend error messages
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(errorData);
        }
      } else {
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Large Logo Overlapping Card */}
        <div className="absolute left-1/2 -top-16 transform -translate-x-1/2 z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl border-4 border-white">
            <img src={flistIcon} alt="Flist Logo" className="w-14 h-14" />
          </div>
        </div>
        {/* Login Form Card */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-10 border border-blue-100 pt-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Sign in</h1>
            <p className="text-gray-500">Access your Flist account</p>
          </div>
          {/* Google Sign In */}
          <button type="button" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg shadow-sm hover:bg-blue-50 transition mb-6">
            <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">G</span>
            Sign in with Google
          </button>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm mb-2">
                {error}
              </div>
            )}
            <div>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium transition-colors">Forgot password?</Link>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-cyan-700 transition-all text-lg"
            >
              Sign in
            </button>
          </form>
          <div className="my-8 border-t border-blue-100"></div>
          <div className="text-center">
            <button
              type="button"
              className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-full font-semibold bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 mb-4"
              onClick={async () => {
                try {
                  await login('guest@email.com', 'guest123');
                  navigate('/');
                } catch (err) {
                  setError('Guest login failed.');
                }
              }}
            >
              Continue as Guest
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:underline font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 