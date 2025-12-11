# Creating Routes Guide

This guide covers adding new routes to the web app (Next.js), mobile app (Expo), and API server (Fastify).

## Web Routes (Next.js App Router)

### Create a Page

```tsx
// apps/web/src/app/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
```

**Route:** `/dashboard`

### Nested Routes

```tsx
// apps/web/src/app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <div>Settings</div>;
}
```

**Route:** `/dashboard/settings`

### Dynamic Routes

```tsx
// apps/web/src/app/users/[id]/page.tsx
export default function UserPage({ params }: { params: { id: string } }) {
  return <div>User ID: {params.id}</div>;
}
```

**Route:** `/users/123`

## Mobile Routes (Expo Router)

### Create a Screen

```tsx
// apps/mobile/src/app/dashboard.tsx
export default function DashboardScreen() {
  return (
    <View>
      <Text>Dashboard</Text>
    </View>
  );
}
```

**Route:** `/dashboard`

### Tab Navigation

```tsx
// apps/mobile/src/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

### Dynamic Routes

```tsx
// apps/mobile/src/app/users/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function UserScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>User ID: {id}</Text>
    </View>
  );
}
```

## API Routes (Fastify)

### Create Route File

```typescript
// apps/api/src/routes/posts.ts
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db, posts } from "database";
import { RouteOptions } from "../models";

export default (app: FastifyInstance, routeOptions: RouteOptions) => {
  const { rootPath, versionPrefix } = routeOptions;
  const basePath = `/${versionPrefix}/${rootPath}`;

  // GET /api/v1/posts
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: `${basePath}/posts`,
    schema: {
      description: "List all posts",
      tags: ["Posts"],
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            content: z.string(),
          })
        ),
      },
    },
    handler: async (request, reply) => {
      const allPosts = await db.select().from(posts);
      return allPosts;
    },
  });
};
```

### Register Route

```typescript
// apps/api/src/routes/index.ts
import postsRoutes from "./posts";

export function registerRoutes(app: FastifyInstance) {
  // ... existing routes
  app.register(postsRoutes, { rootPath: "posts", versionPrefix: "api/v1" });
}
```

### Protected Routes

```typescript
app.route({
  method: "POST",
  url: `${basePath}/posts`,
  preHandler: [app.verifyAuth], // Require authentication
  handler: async (request, reply) => {
    // request.user is available here
    const userId = request.user.id;
    // Create post...
  },
});
```

## Related Documentation

- [API Routes Documentation](../api/routes.md)
- [Authentication Guide](./authentication.md)
