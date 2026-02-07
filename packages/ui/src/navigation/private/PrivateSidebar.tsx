"use client";

/**
 * PrivateSidebar - Sidebar navigation for authenticated web pages
 *
 * Features:
 * - Logo + App name
 * - TenantSwitcher (if multiple groups)
 * - Navigation items: Dashboard, Todos, Groups, Settings, Profile
 * - NotificationBell with dropdown
 * - Logout button at bottom
 *
 * Responsive behavior:
 * - Desktop (≥1024px): Full sidebar, expanded
 * - Tablet (768-1023px): Collapsed (icons only), expands on hover
 * - Mobile (<768px): Hidden, hamburger opens drawer
 *
 * THEME: Uses semantic Tailwind classes from @app/tailwind-config themes.
 */

import React, { useState, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Home,
  ListTodo,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { TenantSwitcher } from "../../components/TenantSwitcher";
import { useTenantStore, useTenantMemberships } from "../../stores/tenantStore";
import type { AuthenticatedNavProps, NavRoute } from "../types";
import { iconColors } from "../../constants/colors";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
      ${isActive ? "bg-primary-50 text-primary-600" : "text-typography-600 hover:bg-background-50 hover:text-typography-900"}
      ${isCollapsed ? "justify-center" : "justify-start"}
    `}
    title={isCollapsed ? label : undefined}
  >
    {icon}
    {!isCollapsed && <span className="font-medium">{label}</span>}
  </button>
);

export interface PrivateSidebarProps extends AuthenticatedNavProps {
  /** Logo text (single letter) */
  logoText?: string;
  /** Children content (main page content) */
  children?: React.ReactNode;
  /** Navigate to create group screen */
  onNavigateToCreateGroup?: () => void;
  /** Platform-specific switch tenant handler */
  switchTenant?: (tenantId: string) => Promise<void>;
}

export const PrivateSidebar: React.FC<PrivateSidebarProps> = ({
  session,
  activeRoute,
  isLoggingOut = false,
  NotificationComponent,
  logoText = "A",
  children,
  onNavigateToCreateGroup,
  onNavigateToDashboard,
  onNavigateToTodos,
  onNavigateToGroup,
  onNavigateToSettings,
  onNavigateToProfile,
  onLogout,
  switchTenant,
}) => {
  const { t } = useTranslation("common");
  const { width: screenWidth } = useWindowDimensions();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);

  // Tenant store hooks
  const { activeTenantId, setActiveTenant } = useTenantStore();
  const memberships = useTenantMemberships();
  const hasMultipleTenants = memberships.length > 1;

  // Use screen width for responsive behavior
  const windowWidth = screenWidth;

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet) {
      setIsCollapsed(true);
    }
  }, [isTablet]);

  const userName = session?.user?.name?.split(" ")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = session?.user?.email || "";

  const navItems: { key: NavRoute; icon: React.ReactNode; label: string; onClick?: () => void }[] =
    [
      {
        key: "dashboard",
        icon: <Home size={20} />,
        label: t("navigation.dashboard"),
        onClick: onNavigateToDashboard,
      },
      {
        key: "todos",
        icon: <ListTodo size={20} />,
        label: t("navigation.todos"),
        onClick: onNavigateToTodos,
      },
      {
        key: "group",
        icon: <Users size={20} />,
        label: t("navigation.groups"),
        onClick: onNavigateToGroup,
      },
      {
        key: "settings",
        icon: <Settings size={20} />,
        label: t("navigation.settings"),
        onClick: onNavigateToSettings,
      },
      {
        key: "profile",
        icon: <User size={20} />,
        label: t("navigation.profile"),
        onClick: onNavigateToProfile,
      },
    ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header: Logo + Collapse toggle */}
      <div className="p-4 border-b border-outline-100">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-typography-0 font-bold text-lg flex-shrink-0">
              {logoText}
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-typography-900">{t("app.name")}</span>
            )}
          </div>
          {!isMobile && !isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-background-100 text-typography-400 hover:text-typography-600"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {!isMobile && isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-background-100 text-typography-400 hover:text-typography-600 absolute right-2"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tenant Switcher */}
      {hasMultipleTenants && !isCollapsed && (
        <div className="p-4 border-b border-outline-100 relative">
          <button
            onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-background-50 hover:bg-background-100 transition-colors"
          >
            <Users size={16} color={iconColors.inactive} />
            <span className="flex-1 text-left text-sm font-medium text-typography-700 truncate">
              {memberships.find((m) => m.tenantId === activeTenantId)?.tenantName ||
                t("navigation.groups")}
            </span>
          </button>
          {showTenantSwitcher && (
            <div className="absolute left-4 right-4 top-full mt-1 z-50">
              <TenantSwitcher
                activeTenantId={activeTenantId}
                tenants={memberships}
                onSwitch={async (tenantId) => {
                  setActiveTenant(tenantId);
                  if (switchTenant) {
                    await switchTenant(tenantId);
                  }
                }}
                onCreateNew={() => {
                  setShowTenantSwitcher(false);
                  onNavigateToCreateGroup?.();
                }}
                onClose={() => setShowTenantSwitcher(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            isActive={activeRoute === item.key}
            isCollapsed={isCollapsed}
            onClick={() => {
              item.onClick?.();
              if (isMobile) setIsMobileOpen(false);
            }}
          />
        ))}
      </nav>

      {/* Bottom section: Notifications + User + Logout */}
      <div className="p-3 border-t border-outline-100 space-y-2">
        {/* Notifications */}
        {NotificationComponent && (
          <div className={`flex ${isCollapsed ? "justify-center" : "px-3 py-2"}`}>
            <NotificationComponent bellSize="md" />
          </div>
        )}

        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
            {userInitial}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-typography-900 truncate">{userName}</p>
              <p className="text-xs text-typography-500 truncate">{userEmail}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
            text-error-600 hover:bg-error-50
            ${isCollapsed ? "justify-center" : "justify-start"}
            ${isLoggingOut ? "opacity-50 cursor-not-allowed" : ""}
          `}
          title={isCollapsed ? t("actions.logout") : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">{t("actions.logout")}</span>}
        </button>
      </div>
    </div>
  );

  // Mobile: Show hamburger + drawer
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-background-0 border-b border-outline-200">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-background-100"
          >
            <Menu size={24} color={iconColors.inactive} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-typography-0 font-bold">
              {logoText}
            </div>
            <span className="font-bold text-typography-900">{t("app.name")}</span>
          </div>
          <div className="flex items-center gap-2">
            {NotificationComponent && <NotificationComponent bellSize="sm" />}
          </div>
        </header>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-background-950/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed left-0 top-0 bottom-0 w-72 bg-background-0 z-50 shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-outline-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-typography-0 font-bold">
                    {logoText}
                  </div>
                  <span className="text-xl font-bold text-typography-900">{t("app.name")}</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-background-100"
                >
                  <X size={20} color={iconColors.inactive} />
                </button>
              </div>
              {sidebarContent}
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background-50">{children}</main>
      </div>
    );
  }

  // Desktop/Tablet: Sidebar layout
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 bg-background-0 border-r border-outline-200 z-30
          transition-all duration-200 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-64"}
        `}
        onMouseEnter={() => isTablet && setIsCollapsed(false)}
        onMouseLeave={() => isTablet && setIsCollapsed(true)}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 min-h-screen bg-background-50 transition-all duration-200
          ${isCollapsed ? "ml-[72px]" : "ml-64"}
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default PrivateSidebar;
