import { z } from "zod";

// Dashboard Stats
export const DashboardStats = z.object({
  totalTasks: z.number(),
  completedTasks: z.number(),
  activeProjects: z.number(),
});

export type TDashboardStats = z.infer<typeof DashboardStats>;

// Activity Item
export const ActivityItem = z.object({
  id: z.string(),
  type: z.enum(["task", "project", "comment", "upload"]),
  title: z.string(),
  description: z.string().optional(),
  timestamp: z.date(),
  user: z.object({
    name: z.string(),
    avatar: z.string().optional(),
  }),
});

export type TActivityItem = z.infer<typeof ActivityItem>;

// Dashboard Response
export const DashboardResponse = z.object({
  stats: DashboardStats,
  recentActivity: z.array(ActivityItem),
});

export type TDashboardResponse = z.infer<typeof DashboardResponse>;
