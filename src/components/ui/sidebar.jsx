import * as React from 'react';
import { cva } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '240px';
const SIDEBAR_WIDTH_MOBILE = '280px';
const SIDEBAR_WIDTH_ICON = '68px';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

const SidebarContext = React.createContext(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Maintain fixed collapsible sidebar across all viewport sizes
  React.useEffect(() => {
    setIsMobile(false);
  }, []);

  // Internal state of the sidebar
  const [_open, _setOpen] = React.useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COOKIE_NAME);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (e) {}
    return defaultOpen;
  });

  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      try {
        localStorage.setItem(SIDEBAR_COOKIE_NAME, String(openState));
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      } catch (e) {}
    },
    [setOpenProp, open]
  );

  // Helper to toggle the sidebar
  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((curr) => !curr)
      : setOpen((curr) => !curr);
  }, [isMobile, setOpen, setOpenMobile]);

  // Keyboard shortcut (Cmd/Ctrl + B)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={{
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          ...style,
        }}
        className={cn('sidebar-wrapper', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  className,
  children,
  animateOnHover = true,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn('sidebar-base', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Mobile drawer view
  if (isMobile) {
    if (!openMobile) return null;
    return (
      <div className="sidebar-mobile-backdrop" onClick={() => setOpenMobile(false)}>
        <div
          data-slot="sidebar"
          data-mobile="true"
          className={cn('sidebar-mobile-drawer', className)}
          onClick={(e) => e.stopPropagation()}
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE }}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div
      className="sidebar-desktop-peer"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Gap spacer for layout flow */}
      <div data-slot="sidebar-gap" className="sidebar-gap" />

      {/* Main sidebar container */}
      <div
        data-slot="sidebar-container"
        className={cn('sidebar-container', className)}
        {...props}
      >
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className="sidebar-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({ className, onClick, children, ...props }) {
  const { toggleSidebar, state } = useSidebar();

  return (
    <button
      type="button"
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      className={cn('sidebar-trigger-btn', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      title={state === 'collapsed' ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
      aria-label={state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'}
      {...props}
    >
      {children || <PanelLeft size={16} />}
    </button>
  );
}

export function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Click or drag to toggle sidebar"
      className={cn('sidebar-rail', className)}
      {...props}
    />
  );
}

export function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn('sidebar-inset', className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('sidebar-header', className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('sidebar-footer', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn('sidebar-content', className)}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('sidebar-group', className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, children, ...props }) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn('sidebar-group-label', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarGroupAction({ className, ...props }) {
  return (
    <button
      type="button"
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn('sidebar-group-action', className)}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('sidebar-group-content', className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('sidebar-menu', className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('sidebar-menu-item', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva('sidebar-menu-button', {
  variants: {
    variant: {
      default: '',
      outline: 'sidebar-menu-button-outline',
    },
    size: {
      default: '',
      sm: 'sidebar-menu-button-sm',
      lg: 'sidebar-menu-button-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export function SidebarMenuButton({
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  children,
  ...props
}) {
  const { state } = useSidebar();
  const tooltipText = typeof tooltip === 'string' ? tooltip : tooltip?.children;

  return (
    <button
      type="button"
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        isActive && 'active',
        className
      )}
      {...props}
    >
      {children}
      {tooltipText && state === 'collapsed' && (
        <span className="sidebar-floating-tooltip" role="tooltip">
          {tooltipText}
        </span>
      )}
    </button>
  );
}

export function SidebarMenuAction({ className, showOnHover = false, ...props }) {
  return (
    <button
      type="button"
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'sidebar-menu-action',
        showOnHover && 'sidebar-menu-action-hover',
        className
      )}
      {...props}
    />
  );
}

export function SidebarMenuBadge({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn('sidebar-menu-badge', className)}
      {...props}
    />
  );
}

export function SidebarMenuSkeleton({ className, showIcon = false, ...props }) {
  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('sidebar-menu-skeleton', className)}
      {...props}
    >
      {showIcon && <div className="sidebar-skeleton-icon" />}
      <div className="sidebar-skeleton-text" />
    </div>
  );
}

export function SidebarMenuSub({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn('sidebar-menu-sub', className)}
      {...props}
    />
  );
}

export function SidebarMenuSubItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('sidebar-menu-sub-item', className)}
      {...props}
    />
  );
}

export function SidebarMenuSubButton({
  size = 'md',
  isActive = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'sidebar-menu-sub-button',
        isActive && 'active',
        className
      )}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }) {
  return (
    <hr
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('sidebar-separator', className)}
      {...props}
    />
  );
}

export function SidebarInput({ className, ...props }) {
  return (
    <input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('sidebar-input', className)}
      {...props}
    />
  );
}
