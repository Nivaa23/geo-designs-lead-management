import React, { useState, useEffect } from 'react';
import Sidebar, { SidebarProvider, SidebarInset } from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import DashboardOverview from './components/DashboardOverview';
import AttentionRequiredScreen from './components/AttentionRequiredScreen';
import LeadForm from './components/LeadForm';
import LeadsTable from './components/LeadsTable';
import EditLeadModal from './components/EditLeadModal';
import DeleteConfirmation from './components/DeleteConfirmation';
import ViewLeadModal from './components/ViewLeadModal';
import ProfileSettings from './components/ProfileSettings';
import {
  fetchLeadsFromSupabase,
  insertLeadToSupabase,
  updateLeadInSupabase,
  deleteLeadFromSupabase
} from './lib/supabaseService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('gdr_signed_in') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [authScreen, setAuthScreen] = useState(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (
        hash.includes('forgot') ||
        path.includes('forgot-password') ||
        params.get('screen') === 'forgot-password'
      ) {
        return 'forgot-password';
      }
    } catch (e) {}
    return 'login';
  });

  useEffect(() => {
    const handleRouteChange = () => {
      try {
        const hash = window.location.hash.toLowerCase();
        const path = window.location.pathname.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        if (
          hash.includes('forgot') ||
          path.includes('forgot-password') ||
          params.get('screen') === 'forgot-password'
        ) {
          setAuthScreen('forgot-password');
        } else {
          setAuthScreen('login');
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const handleNavigateToForgot = () => {
    setAuthScreen('forgot-password');
    try {
      window.location.hash = 'forgot-password';
    } catch (e) {}
  };

  const handleNavigateToLogin = () => {
    setAuthScreen('login');
    try {
      if (window.location.hash.includes('forgot')) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    } catch (e) {}
  };

  const [activeScreen, setActiveScreen] = useState(() => {
    try {
      return localStorage.getItem('gdr_default_screen_v1') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });
  const [leads, setLeads] = useState([]); // Authoritative live Supabase data source across portal
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [tableAlert, setTableAlert] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('gdr_sidebar_collapsed_v1') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gdr_sidebar_collapsed_v1', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Fetch actual records from public.leads on mount and on screen change
  const loadSupabaseLeads = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetchLeadsFromSupabase();
      if (!res.success) {
        setFetchError(res.error);
        setLeads([]);
      } else {
        setLeads(res.data || []);
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to connect to Supabase database');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseLeads();
  }, []);

  // Compute next sequential Sr. No. dynamically from actual Supabase dataset
  const nextSrNo =
    leads.length > 0
      ? Math.max(...leads.map((l) => Number(l.srNo) || 0)) + 1
      : 1;

  // Clear table alert when switching away from the view screen and refresh Supabase records
  const handleSelectScreen = (screen) => {
    setActiveScreen(screen);
    if (screen !== 'view') {
      setTableAlert(null);
    }
    if (screen === 'dashboard' || screen === 'view' || screen === 'add') {
      loadSupabaseLeads();
    }
  };

  const handleAddLead = async (newLead) => {
    const res = await insertLeadToSupabase(newLead);
    if (res.success) {
      await loadSupabaseLeads();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error };
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
  };

  const handleSaveEdit = async (updatedLead) => {
    const res = await updateLeadInSupabase(updatedLead);
    if (res.success) {
      await loadSupabaseLeads();
      setEditingLead(null);
      setTableAlert({
        type: 'success',
        message: `Lead #${updatedLead.srNo} updated successfully.`
      });
    } else {
      setTableAlert({
        type: 'error',
        message: `Failed to update lead: ${res.error}`
      });
    }
  };

  const handleOpenDelete = (lead) => {
    setDeletingLead(lead);
  };

  const handleConfirmDelete = async (leadId) => {
    const targetLead = leads.find((item) => item.id === leadId);
    const deletedSrNo = targetLead ? targetLead.srNo : '';

    const res = await deleteLeadFromSupabase(leadId);
    if (res.success) {
      await loadSupabaseLeads();
      setDeletingLead(null);
      setTableAlert({
        type: 'success',
        message: `Lead #${deletedSrNo} deleted successfully.`
      });
    } else {
      setDeletingLead(null);
      setTableAlert({
        type: 'error',
        message: `Failed to delete lead: ${res.error}`
      });
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('gdr_signed_in', 'true');
      localStorage.setItem('gdr_signed_in', 'true');
    } catch (e) {}
    setActiveScreen('dashboard');
    loadSupabaseLeads();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('gdr_signed_in');
      localStorage.removeItem('gdr_signed_in');
    } catch (e) {}
  };

  if (!isAuthenticated) {
    if (authScreen === 'forgot-password') {
      return (
        <ForgotPasswordScreen
          onBackToLogin={handleNavigateToLogin}
        />
      );
    }

    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={handleNavigateToForgot}
      />
    );
  }

  return (
    <SidebarProvider
      defaultOpen={!isSidebarCollapsed}
      open={!isSidebarCollapsed}
      onOpenChange={(open) => setIsSidebarCollapsed(!open)}
    >
      <div className="app-layout">
        {/* Sidebar Navigation */}
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={handleSelectScreen}
          onLogout={handleLogout}
        />

        {/* Main Content Area with Top Bar */}
        <SidebarInset className="main-viewport-area">
          <TopBar
            activeScreen={activeScreen}
            onNavigate={handleSelectScreen}
          />

          <div className="main-content" id="main-content">
            {activeScreen === 'dashboard' && (
              <DashboardOverview
                leads={leads}
                isLoading={isLoading}
                fetchError={fetchError}
                onNavigate={handleSelectScreen}
                onViewLead={(lead) => setViewingLead(lead)}
              />
            )}
            {activeScreen === 'add' && (
              <LeadForm
                nextSrNo={nextSrNo}
                onAddLead={handleAddLead}
              />
            )}
            {activeScreen === 'view' && (
              <LeadsTable
                leads={leads}
                isLoading={isLoading}
                fetchError={fetchError}
                onView={(lead) => setViewingLead(lead)}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                tableAlert={tableAlert}
              />
            )}
            {activeScreen === 'attention' && (
              <AttentionRequiredScreen
                leads={leads}
                isLoading={isLoading}
                onNavigate={handleSelectScreen}
                onViewLead={(lead) => setViewingLead(lead)}
              />
            )}
            {activeScreen === 'settings' && (
              <ProfileSettings
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
              />
            )}
          </div>
        </SidebarInset>
      </div>

      {/* Read-Only Lead Details Modal */}
      <ViewLeadModal
        lead={viewingLead}
        onClose={() => setViewingLead(null)}
        onEdit={(lead) => {
          setViewingLead(null);
          handleOpenEdit(lead);
        }}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={editingLead}
        onSave={handleSaveEdit}
        onClose={() => setEditingLead(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        lead={deletingLead}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLead(null)}
      />
    </SidebarProvider>
  );
}
