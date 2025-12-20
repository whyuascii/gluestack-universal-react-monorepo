# Utils Package

The `utils` package provides isomorphic utility functions for date/time handling, validation, and common helpers.

## Overview

Pure utility functions that work on both client and server, web and mobile.

**Dependencies:**

- **date-fns** - Date/time manipulation
- **date-fns-tz** - Timezone support
- **zod** - Validation helpers
- **lodash** - General utilities
- **DOMPurify** - HTML sanitization

## Installation

```json
{
  "dependencies": {
    "utils": "workspace:*"
  }
}
```

## Date/Time Utilities

```typescript
import { formatDate, parseDate, addDays, isAfter } from "@app/utils";

// Format dates
formatDate(new Date(), "yyyy-MM-dd"); // "2025-12-11"
formatDate(new Date(), "PPP"); // "December 11, 2025"

// Parse dates
parseDate("2025-12-11", "yyyy-MM-dd");

// Date math
addDays(new Date(), 7); // 7 days from now
isAfter(date1, date2); // true/false
```

## Validation Helpers

```typescript
import { validateEmail, validateUrl } from "@app/utils";

// Email validation
validateEmail("user@example.com"); // true
validateEmail("invalid"); // false

// URL validation
validateUrl("https://example.com"); // true
validateUrl("not-a-url"); // false
```

## String Utilities

```typescript
import { truncate, slugify, capitalize } from "@app/utils";

truncate("Long text here", 10); // "Long te..."
slugify("Hello World!"); // "hello-world"
capitalize("hello"); // "Hello"
```

## Sanitization

```typescript
import { sanitizeHtml } from "@app/utils";

const dirty = '<script>alert("XSS")</script><p>Safe content</p>';
const clean = sanitizeHtml(dirty);
// "<p>Safe content</p>"
```

## Lodash Re-exports

```typescript
import { debounce, throttle, groupBy, chunk } from "@app/utils";

const debouncedFn = debounce(() => console.log("Called"), 300);
const grouped = groupBy(users, "role");
```

## Related Documentation

- [UI Package](./ui.md)
- [Service Contracts](./service-contracts.md)
