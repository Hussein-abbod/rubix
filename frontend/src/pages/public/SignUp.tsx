import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { Button } from "../../components/ui/Button";
import axios from "axios";
import { Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, { name, email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="From Guideline Chaos to Automated Execution in One Click.">
      {error && <div className="mt-4 p-3 bg-error/10 text-error rounded-xl text-sm font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
          <input
            className="glass-input"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
          <input
            className="glass-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
          <input
            className="glass-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Get Started
        </Button>
        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary-container font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
