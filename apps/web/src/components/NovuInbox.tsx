"use client";

/**
 * Novu Inbox Component for Next.js
 *
 * Uses @novu/nextjs package which is specifically designed for Next.js
 * and handles server/client rendering properly.
 */

import type { CSSProperties } from "react";
import { Inbox } from "@novu/nextjs";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@app/ui";
import { useSession } from "@app/auth";

const NOVU_APP_ID = process.env.NEXT_PUBLIC_NOVU_APP_ID || "";

/**
 * Novu element styles support CSS-in-JS selectors (e.g., "&:hover", "&[data-unread=true]")
 * that are not part of standard CSSProperties. This type extends CSSProperties to allow them.
 */
type NovuElementStyle = CSSProperties & Record<string, CSSProperties | string | number>;

// Modern, polished theme
const customAppearance: {
  variables: Record<string, string>;
  elements: Record<string, NovuElementStyle>;
} = {
  variables: {
    colorPrimary: "#dc2626",
    colorPrimaryForeground: "#ffffff",
    colorSecondary: "#f4f4f5",
    colorSecondaryForeground: "#3f3f46",
    colorBackground: "#ffffff",
    colorForeground: "#18181b",
    colorNeutral: "#71717a",
    colorCounter: "#dc2626",
    colorCounterForeground: "#ffffff",
    borderRadius: "12px",
    fontSize: "14px",
  },
  elements: {
    // Bell icon button
    bellIcon: {
      width: "20px",
      height: "20px",
      color: "#52525b",
    },
    bellContainer: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      backgroundColor: "#f4f4f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      border: "1px solid #e4e4e7",
      "&:hover": {
        backgroundColor: "#e4e4e7",
        transform: "scale(1.05)",
      },
    },
    bellDot: {
      backgroundColor: "#dc2626",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      border: "2px solid white",
      boxShadow: "0 0 0 1px #dc2626",
    },

    // Popover container
    popoverContent: {
      width: "400px",
      maxHeight: "500px",
      borderRadius: "16px",
      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      border: "none",
      overflow: "hidden",
      animation: "slideIn 0.2s ease-out",
    },

    // Header
    inboxHeader: {
      padding: "20px 24px 16px",
      borderBottom: "1px solid #f4f4f5",
      backgroundColor: "#fafafa",
    },
    inboxHeader__title: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#18181b",
      letterSpacing: "-0.02em",
    },
    inboxHeader__dropdown: {
      fontSize: "13px",
      color: "#71717a",
      fontWeight: "500",
    },

    // Tabs/Filters
    tabs__tabsRoot: {
      padding: "0 16px",
      backgroundColor: "#fafafa",
      borderBottom: "1px solid #f4f4f5",
    },
    tabs__tabsTrigger: {
      fontSize: "13px",
      fontWeight: "500",
      color: "#71717a",
      padding: "12px 16px",
      borderRadius: "0",
      borderBottom: "2px solid transparent",
      transition: "all 0.15s ease",
      "&:hover": {
        color: "#18181b",
      },
      "&[data-state=active]": {
        color: "#dc2626",
        borderBottomColor: "#dc2626",
        backgroundColor: "transparent",
      },
    },

    // Notification list
    notificationList: {
      padding: "8px",
    },
    notificationListEmptyNotice: {
      padding: "48px 24px",
      textAlign: "center",
    },
    notificationListEmptyNotice__icon: {
      width: "48px",
      height: "48px",
      color: "#d4d4d8",
      marginBottom: "16px",
    },
    notificationListEmptyNotice__text: {
      fontSize: "15px",
      color: "#71717a",
      fontWeight: "500",
    },

    // Individual notification
    notification: {
      padding: "16px",
      borderRadius: "12px",
      marginBottom: "4px",
      transition: "all 0.15s ease",
      cursor: "pointer",
      border: "1px solid transparent",
      "&:hover": {
        backgroundColor: "#f4f4f5",
      },
      "&[data-unread=true]": {
        backgroundColor: "#fef2f2",
        borderColor: "#fecaca",
      },
      "&[data-unread=true]:hover": {
        backgroundColor: "#fee2e2",
      },
    },
    notificationDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#dc2626",
      flexShrink: "0",
      marginTop: "6px",
    },
    notification__icon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      backgroundColor: "#f4f4f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "12px",
      flexShrink: "0",
    },
    notificationSubject: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#18181b",
      lineHeight: "1.4",
      marginBottom: "4px",
    },
    notificationBody: {
      fontSize: "13px",
      color: "#52525b",
      lineHeight: "1.5",
      marginBottom: "8px",
    },
    notification__timestamp: {
      fontSize: "12px",
      color: "#a1a1aa",
      fontWeight: "500",
    },

    // Action buttons
    notificationPrimaryAction__button: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#b91c1c",
        transform: "translateY(-1px)",
      },
    },
    notificationSecondaryAction__button: {
      backgroundColor: "#f4f4f5",
      color: "#3f3f46",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "600",
      border: "1px solid #e4e4e7",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#e4e4e7",
      },
    },

    // Mark all as read
    markAllAsRead__button: {
      fontSize: "13px",
      color: "#dc2626",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        color: "#b91c1c",
        textDecoration: "underline",
      },
    },

    // Footer
    inboxFooter: {
      padding: "12px 16px",
      borderTop: "1px solid #f4f4f5",
      backgroundColor: "#fafafa",
      display: "flex",
      justifyContent: "center",
    },
    inboxFooter__link: {
      fontSize: "13px",
      color: "#71717a",
      fontWeight: "500",
      "&:hover": {
        color: "#18181b",
      },
    },
  },
};

const customLocalization = {
  "inbox.title": "Notifications",
  "inbox.filters.labels.default": "All",
  "inbox.filters.labels.unread": "Unread",
  "inbox.filters.labels.archived": "Archived",
  "notifications.emptyNotice": "You're all caught up!",
  "notifications.markAllAsRead": "Mark all as read",
};

interface NovuInboxProps {
  bellSize?: "sm" | "md" | "lg";
}

/**
 * NovuInbox - Bell icon with dropdown inbox using Novu's pre-built UI
 */
export function NovuInbox({ bellSize = "md" }: NovuInboxProps) {
  const { data: session } = useSession();
  const subscriberId = session?.user?.id;

  // Fetch subscriber hash for secure Novu authentication
  const { data: hashData } = useQuery({
    ...orpc.private.notifications.getSubscriberHash.queryOptions(),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!subscriberId,
  });

  // Don't render if not authenticated or Novu not configured
  if (!subscriberId || !NOVU_APP_ID) {
    return null;
  }

  return (
    <Inbox
      applicationIdentifier={NOVU_APP_ID}
      subscriberId={subscriberId}
      subscriberHash={hashData?.subscriberHash}
      appearance={customAppearance}
      localization={customLocalization}
      placement="bottom-end"
    />
  );
}

export default NovuInbox;
