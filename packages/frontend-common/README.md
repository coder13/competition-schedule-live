# `@notifycomp/frontend-common`

Shared TypeScript utilities for the various frontend applications. Currently this
package exposes helper functions for date and time formatting that are consumed
by both the admin and public websites.

## Usage

```ts
import { formatDateRange } from '@notifycomp/frontend-common';

console.log(formatDateRange('2023-01-01', '2023-01-05'));
```
