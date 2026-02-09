# Subscriptions (packages/subscriptions)

Multi-provider system: Polar (web) + RevenueCat (mobile) with unified entitlements.

## Server-Side Usage

```typescript
import { getTenantEntitlements, hasFeatureAccess } from "@app/subscriptions/server";

const entitlements = await getTenantEntitlements(tenantId);
if (entitlements.tier === "pro") {
  /* pro features */
}
if (await hasFeatureAccess(tenantId, "bulkExport")) {
  /* allowed */
}
```

## Status Handling

| Status     | Access           | Notes                          |
| ---------- | ---------------- | ------------------------------ |
| `active`   | Full             | Normal subscription            |
| `trialing` | Full             | Trial period                   |
| `past_due` | Grace period     | 7 days after payment failure   |
| `canceled` | Until period end | If `cancelAtPeriodEnd` is true |
| `expired`  | None             | Reverts to free tier           |
