import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Book entry form
  const [bookName, setBookName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [lastDate, setLastDate] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(profileData);
    };
    getUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("book_entries").insert({
        user_id: user.id,
        user_type: profile.user_type,
        book_name: bookName,
        serial_number: serialNumber,
        author,
        published_year: parseInt(publishedYear),
        issue_date: issueDate,
        last_date: lastDate,
      });
      if (error) throw error;
      toast({ title: "Book Entry Submitted", description: "Your book entry has been recorded." });
      setBookName(""); setSerialNumber(""); setAuthor("");
      setPublishedYear(""); setIssueDate(""); setLastDate("");
    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged Out Successfully" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">YGRCAS Library</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:block">{profile?.name || user?.email}</span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Submit Book Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Book Name</Label>
                  <Input value={bookName} onChange={(e) => setBookName(e.target.value)} required />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </div>
                <div>
                  <Label>Published Year</Label>
                  <Input type="number" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} required min="1900" max="2099" />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
                </div>
                <div>
                  <Label>Last Return Date</Label>
                  <Input type="date" value={lastDate} onChange={(e) => setLastDate(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Book Entry"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
