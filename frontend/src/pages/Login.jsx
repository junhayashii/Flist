import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

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
      navigate("/success");
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
    <div className="min-h-screen bg-[var(--color-flist-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-flist-primary)] rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-flist-text-primary)] mb-2">Welcome back</h1>
          <p className="text-[var(--color-flist-text-muted)]">Sign in to your Flist account</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-[var(--color-flist-error-light)] border border-[var(--color-flist-error)] text-[var(--color-flist-error)] text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-flist-text-primary)] mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-flist-text-primary)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-flist-text-muted)]">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-[var(--color-flist-primary)] hover:text-[var(--color-flist-primary-hover)] font-medium transition-colors"
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