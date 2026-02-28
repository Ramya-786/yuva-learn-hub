import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogOut, Search, BookCheck, BookX, Library } from "lucide-react";

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, issued: 0, returned: 0, overdue: 0 });
  const [highlightOverdue, setHighlightOverdue] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    // Fetch entries
    const { data: entriesData, error } = await supabase
      .from("book_entries")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch all profiles for name lookup
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, name, user_type");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (entriesData) {
      // Merge profile names into entries
      const profileMap = new Map(profilesData?.map((p: any) => [p.user_id, p]) || []);
      const merged = entriesData.map((e: any) => ({
        ...e,
        profiles: profileMap.get(e.user_id) || null,
      }));
      setEntries(merged);
      const today = new Date().toISOString().split("T")[0];
      setStats({
        total: merged.length,
        issued: merged.filter((e: any) => e.return_status === "Issued").length,
        returned: merged.filter((e: any) => e.return_status === "Returned").length,
        overdue: merged.filter((e: any) => e.return_status === "Issued" && e.last_date < today).length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login?role=librarian"); return; }
      // Check librarian role
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isLibrarian = roles?.some((r: any) => r.role === "librarian");
      if (!isLibrarian) { navigate("/"); return; }
      fetchEntries();
    };
    checkAuth();
  }, [navigate]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("book_entries")
      .update({ return_status: status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated" });
      fetchEntries();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged Out Successfully" });
    navigate("/");
  };

  const filtered = entries.filter((e) =>
    [e.book_name, e.serial_number, e.author, e.profiles?.name]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="h-6 w-6" />
          <span className="font-bold">YGRCAS Librarian Dashboard</span>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Books", value: stats.total, icon: BookOpen, color: "text-primary" },
            { label: "Issued", value: stats.issued, icon: BookX, color: "text-amber-600" },
            { label: "Returned", value: stats.returned, icon: BookCheck, color: "text-green-600" },
            { label: "Overdue", value: stats.overdue, icon: BookX, color: "text-destructive" },
          ].map((s) => (
            <Card 
              key={s.label} 
                    onClick={() => setSelectedFilter(selectedFilter === s.label ? null : s.label)}
                     className={`cursor-pointer transition-all ${selectedFilter === s.label ? 'ring-2 ring-primary shadow-md scale-105' : ''}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>All Book Entries</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by book, author, name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No entries found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Name</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Entered By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow 
                         key={e.id}
                               style={{ 
                                    backgroundColor: highlightOverdue && e.return_status === "Issued" ? "#fee2e2" : "inherit",
                borderLeft: highlightOverdue && e.return_status === "Issued" ? "6px solid #dc2626" : "none"
                             }}>
                        <TableCell className="font-medium">{e.book_name}</TableCell>
                        <TableCell>{e.serial_number}</TableCell>
                        <TableCell>{e.author}</TableCell>
                        <TableCell>{e.published_year}</TableCell>
                        <TableCell>{e.issue_date}</TableCell>
                        <TableCell>{e.last_date}</TableCell>
                        <TableCell>
                          <span>{e.profiles?.name || "—"}</span>
                          <Badge variant="outline" className="ml-1 text-xs">{e.user_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={e.return_status === "Returned" ? "default" : "secondary"}>
                            {e.return_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {e.return_status === "Issued" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(e.id, "Returned")}>
                              Mark Returned
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
