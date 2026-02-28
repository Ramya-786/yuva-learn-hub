import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Users, ShieldCheck, MapPin, Phone, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-library.jpg";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About Us", href: "#about" },
  { label: "Contact Us", href: "#contact" },
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <a href="https://www.ygrcas.edu.in" target="_blank" rel="noopener noreferrer">
                <h1 className="text-lg md:text-xl font-bold leading-tight hover:underline cursor-pointer">
                 Yuvaguru College of Arts and Science
                   </h1>
                    </a>
              <p className="text-xs opacity-80 hidden sm:block">Approved by Govt of Tamilnadu | Affiliated to Bharathiar University</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium hover:opacity-80 transition-opacity">
                {l.label}
              </a>
            ))}
            <Link to="/login">
              <Button variant="secondary" size="sm">Login</Button>
            </Link>
          </nav>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-primary-foreground/20 px-4 pb-4 space-y-2">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full">Login</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="YGRCAS College Library"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/40" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
      
                 YGRCAS Library Management System
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Manage your library books digitally — Students, Staff & Librarian portal
          </p>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Select Your Role</h3>
          <p className="text-muted-foreground mb-10">Choose your role to login or register</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link to="/login?role=student">
              <div className="group bg-card rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-border hover:border-primary cursor-pointer">
                <GraduationCap className="h-14 w-14 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-foreground">Student</h4>
                <p className="text-sm text-muted-foreground mt-2">Register & submit book entries</p>
              </div>
            </Link>
            <Link to="/login?role=staff">
              <div className="group bg-card rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-border hover:border-primary cursor-pointer">
                <Users className="h-14 w-14 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-foreground">Staff</h4>
                <p className="text-sm text-muted-foreground mt-2">Register & submit book entries</p>
              </div>
            </Link>
            <Link to="/login?role=librarian">
              <div className="group bg-card rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-border hover:border-primary cursor-pointer">
                <ShieldCheck className="h-14 w-14 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-foreground">Librarian</h4>
                <p className="text-sm text-muted-foreground mt-2">View & manage all entries</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">About YGRCAS</h3>
          <p className="text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto">
            Yuvaguru College of Arts and Science (YGRCAS) is a premier educational institution approved by the Government of Tamil Nadu and affiliated to Bharathiar University, Coimbatore. The college is dedicated to providing quality education and nurturing students to become responsible citizens and leaders of tomorrow.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-secondary/50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Contact Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Sulakkal Road, S. Mettupalayam, Kovilpalayam, Pollachi – 642110</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Phone className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">04254-233299<br />+91-8072034299</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">ygrcas@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-semibold mb-2">Yuvaguru College of Arts and Science</p>
          <p className="text-xs opacity-80">Sulakkal Road, S. Mettupalayam, Kovilpalayam, Pollachi – 642110 | 04254-233299 | ygrcas@gmail.com</p>
          <p className="text-xs opacity-60 mt-4">© 2026 YGRCAS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
