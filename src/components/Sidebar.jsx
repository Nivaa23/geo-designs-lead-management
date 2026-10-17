import React from 'react';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
  SidebarProvider,
  SidebarInset,
} from './ui/sidebar';

export default function AppSidebar({
  activeScreen,
  onSelectScreen,
  onLogout,
  className,
}) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    try {
      const demoKeys = ['gdr_auth_user', 'gdr_signed_in', 'is_logged_in', 'auth_token'];
      demoKeys.forEach((key) => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className={className}
      id="sidebar"
      aria-label="Application Sidebar"
    >
      {/* Sidebar Header with Brand Identity */}
      <SidebarHeader className="brand-container">
        <div className="brand-identity">
          <div
            className="brand-logo-mark"
            aria-hidden="true"
            title="Geo Designs & Research"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="brand-info">
              <h1 className="brand-title">Geo Designs &amp; Research</h1>
              <span className="brand-subtitle">Lead Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation Menu */}
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="sidebar-group-label">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="nav-menu">
            {/* 1. Dashboard Overview */}
            <SidebarMenuItem>
              <SidebarMenuButton
                id="nav-dashboard"
                isActive={activeScreen === 'dashboard'}
                onClick={() => onSelectScreen('dashboard')}
                title="Dashboard Overview"
                className="nav-item"
              >
                <svg
                  className="nav-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                {!isCollapsed && (
                  <span className="nav-label">Dashboard Overview</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* 2. Add New Lead */}
            <SidebarMenuItem>
              <SidebarMenuButton
                id="nav-add-lead"
                isActive={activeScreen === 'add'}
                onClick={() => onSelectScreen('add')}
                title="Add New Lead"
                className="nav-item"
              >
                <svg
                  className="nav-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                {!isCollapsed && (
                  <span className="nav-label">Add New Lead</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* 3. View Previous Leads */}
            <SidebarMenuItem>
              <SidebarMenuButton
                id="nav-view-leads"
                isActive={activeScreen === 'view'}
                onClick={() => onSelectScreen('view')}
                title="View Previous Leads"
                className="nav-item"
              >
                <svg
                  className="nav-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                {!isCollapsed && (
                  <span className="nav-label">View Previous Leads</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* 4. Profile & Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton
                id="nav-settings"
                isActive={activeScreen === 'settings'}
                onClick={() => onSelectScreen('settings')}
                title="Profile & Settings"
                className="nav-item"
              >
                <svg
                  className="nav-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {!isCollapsed && (
                  <span className="nav-label">Profile &amp; Settings</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="sidebar-footer">
        {/* Collapse Sidebar Button */}
        <button
          type="button"
          id="btn-sidebar-collapse"
          className="sidebar-collapse-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Collapse Sidebar' : undefined}
          data-tooltip={isCollapsed ? 'Collapse Sidebar' : undefined}
          aria-label="Collapse Sidebar"
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <svg
              className="sidebar-collapse-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="13 15 16 12 13 9"></polyline>
            </svg>
          ) : (
            <svg
              className="sidebar-collapse-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="15 9 12 12 15 15"></polyline>
            </svg>
          )}
          {!isCollapsed && (
            <span className="sidebar-collapse-label">Collapse Sidebar</span>
          )}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          id="btn-sidebar-logout"
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          data-tooltip={isCollapsed ? 'Logout' : undefined}
          aria-label="Logout"
        >
          <LogOut
            className="sidebar-logout-icon"
            size={18}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="sidebar-logout-label">Logout</span>
          )}
        </button>

        {/* Subtle status/corporate label */}
        {!isCollapsed && (
          <div className="sidebar-footer-inner">
            <span className="sidebar-version-badge">Portal v1.0</span>
          </div>
        )}
      </SidebarFooter>

      {/* Interactive Expand/Collapse Rail */}
      <SidebarRail />
    </Sidebar>
  );
}

// Re-export all Shadcn / Animate UI sidebar primitives
export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
};
