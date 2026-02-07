/**
 * oRPC API Client
 *
 * Type-safe client for calling API endpoints with TanStack Query integration.
 *
 * Usage:
 *   // Direct client calls
 *   const result = await client.me.get()
 *   const tenant = await client.tenants.create({ name: 'My Group' })
 *
 *   // With TanStack Query
 *   const { data } = useQuery(orpc.me.get.queryOptions())
 *   const mutation = useMutation(orpc.tenants.create.mutationOptions())
 */

export { client, orpc, setApiAnalyticsContext } from "./orpc-client";
