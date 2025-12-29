import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowOrb } from "@/components/GlowOrb";
import { Shield, Lock, Mail, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(true); // default true

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:3000/admin/check");
        setAdminExists(res.data.exists);
      } catch (err) {
        console.error(err);
        toast.error("Failed to check admin status");
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!adminExists && !name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (!adminExists) {
        // Register first admin
        await axios.post("http://localhost:3000/admin/register", { name, email, password });
        toast.success("Admin registered successfully! Please log in.");
        setAdminExists(true); // switch to login form
        setName("");
        setPassword("");
      } else {
        // Login
        const res = await axios.post("http://localhost:3000/admin/login", { email, password });
        sessionStorage.setItem("isAdmin", "true");
        sessionStorage.setItem("adminToken", res.data.token);
        toast.success("Welcome back, Admin!");
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      <GlowOrb className="-top-32 -left-32" size="lg" />
      <GlowOrb className="bottom-20 right-20" size="md" />

      <div className="w-full max-w-md animate-fade-up">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="glass-card p-8 md:p-10 shadow-card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{adminExists ? "Admin Login" : "Register Admin"}</h1>
            <p className="text-muted-foreground text-sm">
              Secure access for platform administrators
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!adminExists && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Admin Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  {adminExists ? "Signing in..." : "Registering..."}
                </>
              ) : adminExists ? "Sign In" : "Register"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
