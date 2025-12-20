import type { FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { DashboardResponse } from "@app/service-contracts";
import { type RouteOptions } from "../models";

export default (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  // Get Dashboard Data
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: `${basePath}`,
    preHandler: [app.verifyAuth], // Require authentication
    schema: {
      description: "Get dashboard stats and recent activity",
      tags: ["Dashboard"],
      response: {
        200: DashboardResponse,
      },
    },
    handler: async (request, reply) => {
      try {
        // Mock data - replace with real database queries
        const dashboardData = {
          stats: {
            totalTasks: 24,
            completedTasks: 18,
            activeProjects: 3,
          },
          recentActivity: [
            {
              id: "1",
              type: "task" as const,
              title: "Completed design mockups",
              description: "Finalized all UI screens",
              timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
              user: {
                name: request.user?.name || "Unknown User",
              },
            },
            {
              id: "2",
              type: "project" as const,
              title: "Started new project",
              description: "Mobile app redesign",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              user: {
                name: request.user?.name || "Unknown User",
              },
            },
            {
              id: "3",
              type: "comment" as const,
              title: "Commented on task",
              description: "Added feedback to PR #123",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
              user: {
                name: request.user?.name || "Unknown User",
              },
            },
            {
              id: "4",
              type: "upload" as const,
              title: "Uploaded files",
              description: "Added 3 design assets",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              user: {
                name: request.user?.name || "Unknown User",
              },
            },
            {
              id: "5",
              type: "task" as const,
              title: "Updated task status",
              description: "Moved to In Progress",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
              user: {
                name: request.user?.name || "Unknown User",
              },
            },
          ],
        };

        return reply.status(200).send(dashboardData);
      } catch (error) {
        app.log.error({ message: "Error fetching dashboard", error });
        throw error;
      }
    },
  });
};
