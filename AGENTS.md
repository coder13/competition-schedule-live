# Agent Instructions

## Working Style

- Keep changes simple and maintainable. Prefer KISS and DRY over speculative abstractions.
- Code split by semantic responsibility. Do not grow large single-file implementations when related modules would be clearer.
- If the user asks to pivot, remove the old code for the abandoned direction before beginning the new one.
- Do not revert unrelated user changes. Work with the current tree and keep edits scoped to the task.

## Maintained Surface

`packages/server` is the primary maintained app in this repository. Treat it as the source of truth for active product behavior, business logic, authorization, scheduling, notification orchestration, GraphQL API behavior, and CompetitionGroups integration.

The other packages are currently deprecated unless the user explicitly asks to work on them:

- `packages/webapp`
- `packages/projector`
- `packages/admin`
- `packages/www`
- `packages/notifapi`
- `packages/frontend-common`

For deprecated packages, avoid broad refactors or new feature work unless it is necessary to keep the server integration working or the user specifically scopes the task there.

## Service Relationships

The server app owns the core competition state and exposes it to other apps and services through GraphQL, subscriptions, authentication tokens, webhooks, and external push endpoints.

- `packages/webapp` is a client for competition owners and delegates. It talks directly to `packages/server`.
- `packages/projector` is a display client. It should consume server state rather than duplicate scheduling logic.
- `packages/admin` is an internal/admin UI. Any durable competition behavior should live in the server, not the admin package.
- `packages/www` is a public notification signup surface. It depends on server-side competition and notification behavior.
- `packages/notifapi` historically handled notification delivery. Treat it as downstream of server events/webhooks, not as the place for core scheduling or authorization logic.
- `packages/frontend-common` contains shared frontend utilities. Do not put server business rules there.

When adding or changing behavior, prefer implementing the business rule in `packages/server` and keeping other packages as consumers or presenters of that behavior.

## Checks

Use Node `20.19.0` via `nvm use` before running package commands.

For server work, run the relevant subset first and then the broader checks when practical:

- `yarn workspace api test`
- `yarn workspace api test:coverage`
- `yarn workspace api typecheck`
- `yarn workspace api lint`

The GitHub `Quality` workflow runs the server coverage gate with `yarn workspace api test:coverage`.
