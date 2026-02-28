import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowLeft } from "lucide-react";

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "student";
  const [role, setRole] = useState<"student" | "staff" | "librarian">(initialRole as any);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // roll number or staff id
  const [department, setDepartment] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Login Successful", description: `Welcome back!` });
      if (role === "librarian") {
        navigate("/librarian");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, identifier, department },
        },
      });
      if (error) throw error;
      toast({ title: "Registration Successful", description: "You can now login." });
      setIsRegister(false);
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = { student: "Student", staff: "Staff", librarian: "Librarian" };
  const idLabel = role === "student" ? "Roll Number" : "Staff ID";

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="text-center">
            <BookOpen className="h-10 w-10 mx-auto text-primary mb-2" />
            <CardTitle className="text-2xl">{roleLabels[role]} {isRegister ? "Registration" : "Login"}</CardTitle>
            <CardDescription>YGRCAS Library Management</CardDescription>
            {role !== "librarian" && (
              <div className="flex gap-2 justify-center mt-4">
                <Button size="sm" variant={role === "student" ? "default" : "outline"} onClick={() => setRole("student")}>Student</Button>
                <Button size="sm" variant={role === "staff" ? "default" : "outline"} onClick={() => setRole("staff")}>Staff</Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
              {isRegister && role !== "librarian" && (
                <>
                  <div>
                    <Label>Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label>{idLabel}</Label>
                    <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
                  </div>
                </>
              )}
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
  <Label>Password</Label>
  <div className="relative">
    <Input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-10"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {showPassword ? "👁️" : "🙈"}
    </button>
  </div>
</div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
              </Button>
            </form>
            {role !== "librarian" && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button className="text-primary font-medium hover:underline" onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? "Login" : "Register"}
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
