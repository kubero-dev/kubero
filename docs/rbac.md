# Role-based access control (RBAC)

Kubero uses **roles**, **permissions**, and **teams** to control who can do what in the UI and API.

## Concepts

| Concept | Purpose |
|---------|---------|
| **Role** | Named set of permissions (stored in the Kubero database). |
| **Permission** | `resource:action` pair checked on API routes and in the UI (e.g. `app:write`). |
| **Team (user group)** | Groups users for **pipeline access** (`spec.access.teams` on a pipeline). Users in the `admin` team see all pipelines. |

Permissions are loaded at login and embedded in the JWT. The API enforces them via `PermissionsGuard`; the Vue UI uses `authStore.hasPermission(...)`.

## Built-in roles

These roles are created on first startup (see `server/src/database/database.service.ts`).

| Role | Intended use | Apps / pipelines | Accounts & settings | Logs / console / reboot | Security scans |
|------|----------------|------------------|---------------------|-------------------------|----------------|
| **admin** | Full administrators | write | write (users, config) | yes | write |
| **member** | Team members with broad access | write | read users; no config write | yes | write |
| **developer** | Build and operate workloads | write | no account or config access | yes | write |
| **viewer** | Read-only observers | read | no | logs only (no console/reboot) | read |
| **guest** | Legacy minimal role (prefer **viewer** for new users) | read | no | no | read |

### Permission actions

- **read** / **write** — used for `app`, `pipeline`, `user`, `config`, `security`.
- **ok** — used for `console`, `logs`, `reboot`, `token` (and audit read via `read`).
- **none** — stored in the database but does **not** satisfy API guards (guards require a positive permission such as `app:read`).

## Pipeline scoping (teams)

RBAC roles control *what operations* a user may perform. **Teams** control *which pipelines* they see:

- Assign users to teams under **Accounts → Users**.
- On each pipeline, set **access teams** (or rely on the `admin` team for global access).
- The `admin` **user group** bypasses pipeline filters.

## Managing roles

Administrators can review and customize roles under **Accounts → Roles** (requires `user:read` / `user:write`).

Built-in roles (`admin`, `member`, `developer`, `viewer`, `guest`) cannot be deleted from the UI.

## Related issue

This model implements the roles described in [kubero#545](https://github.com/kubero-dev/kubero/issues/545).
