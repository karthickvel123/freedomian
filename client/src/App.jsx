import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AuthModal } from "./components/AuthModal";

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState("home"); // 'home' | 'dashboard' | 'admin'
  const [authModalTab, setAuthModalTab] = useState(null); // 'login' | 'register' | null

  const handleOpenAuth = (tab = "login") => {
    setAuthModalTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <Navbar
        onOpenAuth={handleOpenAuth}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="flex-grow">
        {activePage === "home" && (
          <HomePage
            onOpenAuth={handleOpenAuth}
            onNavigateDashboard={() => {
              if (user) {
                setActivePage("dashboard");
              } else {
                handleOpenAuth("register");
              }
            }}
          />
        )}

        {activePage === "dashboard" && (
          user ? (
            <UserDashboardPage onGoSearch={() => setActivePage("home")} />
          ) : (
            <div className="text-center py-24 space-y-4">
              <h2 className="text-xl font-bold text-white">Sign In Required</h2>
              <p className="text-xs text-slate-400">Please sign in to view your dashboard and manage domains.</p>
              <button
                onClick={() => handleOpenAuth("login")}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Sign In
              </button>
            </div>
          )
        )}

        {activePage === "admin" && (
          isAdmin ? (
            <AdminDashboardPage />
          ) : (
            <div className="text-center py-24 space-y-4">
              <h2 className="text-xl font-bold text-red-400">Access Restricted</h2>
              <p className="text-xs text-slate-400">You must be logged in as an administrator to access this area.</p>
              <button
                onClick={() => handleOpenAuth("login")}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      <Footer />

      {authModalTab && (
        <AuthModal
          initialTab={authModalTab}
          onClose={() => setAuthModalTab(null)}
          onSuccess={() => {
            setAuthModalTab(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
