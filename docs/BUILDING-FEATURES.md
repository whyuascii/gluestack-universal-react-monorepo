# Building Features

This guide explains where to add your code when building features. The boilerplate is organized to minimize the places you need to touch.

## The Golden Rule

**90% of your code goes in these locations:**

| What             | Where                              | Example                       |
| ---------------- | ---------------------------------- | ----------------------------- |
| Screens & UI     | `packages/ui/src/screens/`         | LoginScreen, DashboardScreen  |
| Business hooks   | `packages/ui/src/hooks/`           | useUserProfile, useCreatePost |
| oRPC API calls   | `packages/ui/src/api/`             | orpc client, queries          |
| State stores     | `packages/ui/src/stores/`          | userStore, cartStore          |
| Translations     | `packages/i18n/src/locales/`       | en/dashboard.json             |
| API endpoints    | `apps/api/src/routes/`             | posts.ts, users.ts            |
| Database schemas | `packages/database/src/schema/`    | posts.ts                      |
| Theme/styling    | `packages/tailwind-config/themes/` | starter.js                    |

## Adding a New Feature: Step by Step

Let's walk through adding a "Posts" feature as an example.

### Step 1: Define the Database Schema

**File:** `packages/database/src/schema/posts.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth/user";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Then export it:**

```typescript
// packages/database/src/schema/index.ts
export * from "./posts";
```

**Generate and run migration:**

```bash
pnpm db:generate
pnpm db:migrate
```

### Step 2: Define API Contracts

**File:** `packages/core-contract/src/posts/index.ts`

```typescript
import { z } from "zod";

// Request schemas
export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

// Response schemas
export const postSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const postsListSchema = z.array(postSchema);

// Types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type Post = z.infer<typeof postSchema>;
```

**Export from index:**

```typescript
// packages/core-contract/src/index.ts
export * from "./posts";
```

### Step 3: Create API Endpoints

**File:** `apps/api/src/routes/posts.ts`

```typescript
import { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "@app/database";
import { posts } from "@app/database/schema";
import { createPostSchema, updatePostSchema } from "@app/core-contract";
import { UnauthorizedError, NotFoundError } from "@app/auth";

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // List posts
  fastify.get("/posts", async (request, reply) => {
    const result = await db.select().from(posts).orderBy(posts.createdAt);
    return result;
  });

  // Get single post
  fastify.get<{ Params: { id: string } }>("/posts/:id", async (request, reply) => {
    const post = await db.select().from(posts).where(eq(posts.id, request.params.id)).limit(1);

    if (!post[0]) {
      throw new NotFoundError("Post not found");
    }

    return post[0];
  });

  // Create post (authenticated)
  fastify.post("/posts", async (request, reply) => {
    const user = request.user;
    if (!user) throw new UnauthorizedError();

    const data = createPostSchema.parse(request.body);

    const [post] = await db
      .insert(posts)
      .values({
        userId: user.id,
        title: data.title,
        content: data.content,
      })
      .returning();

    return post;
  });

  // Update post
  fastify.patch<{ Params: { id: string } }>("/posts/:id", async (request, reply) => {
    const user = request.user;
    if (!user) throw new UnauthorizedError();

    const data = updatePostSchema.parse(request.body);

    const [post] = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, request.params.id))
      .returning();

    if (!post) throw new NotFoundError("Post not found");

    return post;
  });

  // Delete post
  fastify.delete<{ Params: { id: string } }>("/posts/:id", async (request, reply) => {
    const user = request.user;
    if (!user) throw new UnauthorizedError();

    await db.delete(posts).where(eq(posts.id, request.params.id));

    return { success: true };
  });
};

export default postsRoutes;
```

**Register in main router:**

```typescript
// apps/api/src/routes/index.ts
import postsRoutes from "./posts";

// In the registerRoutes function:
app.register(postsRoutes);
```

### Step 4: Create UI API Client

**File:** `packages/ui/src/api/posts/index.ts`

```typescript
import { apiClient } from "../client";
import type { Post, CreatePostInput, UpdatePostInput } from "@app/core-contract";

export const postsApi = {
  list: () => apiClient.get<Post[]>("/posts"),

  get: (id: string) => apiClient.get<Post>(`/posts/${id}`),

  create: (data: CreatePostInput) => apiClient.post<Post>("/posts", data),

  update: (id: string, data: UpdatePostInput) => apiClient.patch<Post>(`/posts/${id}`, data),

  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};
```

### Step 5: Create React Query Hooks

**File:** `packages/ui/src/hooks/queries/usePosts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "../../api/posts";
import type { CreatePostInput, UpdatePostInput } from "@app/core-contract";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: postsApi.list,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => postsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) => postsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
```

### Step 6: Create the Screen

**File:** `packages/ui/src/screens/posts/PostsListScreen.tsx`

```typescript
import React from "react";
import { View, FlatList, Pressable } from "react-native";
import { Text } from "@app/components";
import { usePosts } from "../../hooks/queries/usePosts";
import { useTranslation } from "@app/i18n/mobile"; // or /web

export function PostsListScreen() {
  const { t } = useTranslation("posts");
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-error-500">{t("error")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-0 p-4">
      <Text className="text-2xl font-bold mb-4">{t("title")}</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable className="bg-background-50 p-4 rounded-lg mb-2">
            <Text className="font-semibold">{item.title}</Text>
            <Text className="text-typography-500 text-sm">
              {item.content?.substring(0, 100)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="text-center text-typography-500">{t("empty")}</Text>
        }
      />
    </View>
  );
}
```

### Step 7: Add Translations

**File:** `packages/i18n/src/locales/en/posts.json`

```json
{
  "title": "Posts",
  "loading": "Loading posts...",
  "error": "Failed to load posts",
  "empty": "No posts yet"
}
```

### Step 8: Add Route (Platform-specific)

**Web (Next.js):** `apps/web/src/app/posts/page.tsx`

```typescript
"use client";

import { PostsListScreen } from "@app/ui/screens/posts/PostsListScreen";

export default function PostsPage() {
  return <PostsListScreen />;
}
```

**Mobile (Expo):** `apps/mobile/src/app/(app)/posts.tsx`

```typescript
import { PostsListScreen } from "@app/ui/screens/posts/PostsListScreen";

export default function PostsScreen() {
  return <PostsListScreen />;
}
```

## Quick Reference: Where Does This Go?

| I want to...             | Location                            |
| ------------------------ | ----------------------------------- |
| Add a database table     | `packages/database/src/schema/`     |
| Add API types/validation | `packages/core-contract/src/`       |
| Add an API endpoint      | `apps/api/src/routes/`              |
| Add a shared screen      | `packages/ui/src/screens/`          |
| Add a data-fetching hook | `packages/ui/src/hooks/queries/`    |
| Add a mutation hook      | `packages/ui/src/hooks/mutations/`  |
| Add global state         | `packages/ui/src/stores/`           |
| Add API client functions | `packages/ui/src/api/`              |
| Add translations         | `packages/i18n/src/locales/{lang}/` |
| Add a web-only page      | `apps/web/src/app/`                 |
| Add a mobile-only screen | `apps/mobile/src/app/`              |
| Add a shared component   | `packages/components/src/`          |
| Customize theme          | `packages/tailwind-config/themes/`  |
| Add a custom error       | `packages/auth/src/errors.ts`       |

## Don't Touch (Unless You Know Why)

These packages are pre-configured. You typically only need to set environment variables:

| Package                   | When to modify                              |
| ------------------------- | ------------------------------------------- |
| `packages/auth/`          | Adding OAuth providers, changing auth flows |
| `packages/analytics/`     | Changing tracking behavior                  |
| `packages/subscriptions/` | Changing payment products                   |
| `packages/notifications/` | Changing push notification behavior         |
| `packages/mailer/`        | Adding email templates                      |

## Error Handling Patterns

Use the shared error state components for consistent UX:

### In Screens

```tsx
import { NetworkError, GeneralError, EmptyList } from "@app/components";
import { useNetworkStatus } from "@app/components";

function PostsScreen() {
  const { data, error, isLoading, refetch } = usePosts();
  const { isOffline } = useNetworkStatus();

  // Network error
  if (isOffline) {
    return <NetworkError onRetry={refetch} />;
  }

  // API error
  if (error) {
    return <GeneralError title="Couldn't load posts" message={error.message} onRetry={refetch} />;
  }

  // Empty state
  if (!data?.length) {
    return <EmptyList itemName="posts" onAdd={() => setShowCreateModal(true)} />;
  }

  return <PostsList posts={data} />;
}
```

### In Lists (FlatList)

```tsx
import { EmptyState, GeneralError } from "@app/components";

<FlatList
  data={items}
  ListEmptyComponent={
    error ? (
      <GeneralError compact message={error.message} onRetry={refetch} />
    ) : (
      <EmptyState title="No items yet" message="Pull down to refresh" compact />
    )
  }
/>;
```

### With ErrorBoundary

Wrap major sections with ErrorBoundary for crash protection:

```tsx
import { ErrorBoundary } from "@app/analytics";
import { GeneralError } from "@app/components";

// In your layout or screen
<ErrorBoundary
  fallback={(error, info, retry) => (
    <GeneralError
      onRetry={retry}
      errorDetails={error.toString()}
      componentStack={info.componentStack}
    />
  )}
>
  <FeatureSection />
</ErrorBoundary>;
```

## Tips

1. **Start with the contract** - Define your API types first in `core-contract`
2. **Share everything possible** - Put UI in `packages/ui/`, not in `apps/`
3. **Use the hooks pattern** - Data fetching should be in reusable hooks
4. **Keep routes thin** - Business logic goes in hooks, not route handlers
5. **Type everything** - The contracts give you end-to-end type safety
6. **Handle all states** - Loading, error, empty, and success states
7. **Use semantic components** - `NetworkError`, `EmptyState`, etc. for consistency

## Next Steps

- **[Customizing Brand](./CUSTOMIZING-BRAND.md)** - Themes, logos, copy
- **[Deploying](./DEPLOYING.md)** - Production deployment guide
- **[guides/DATABASE.md](./guides/DATABASE.md)** - Advanced Drizzle patterns
- **[guides/API.md](./guides/API.md)** - Fastify plugins and middleware
