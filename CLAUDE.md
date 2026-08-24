This app talks to `swales-backend`, which is the active rebuild backend, not
the live production one (`swales-backend.vercel.app` — plain Vercel URL, no
custom domain). The real live site is `api.swales.app` / `designer.swales.app`,
served by the separate `SwalesApp\back` repo family. This repo does not
carry its own copy of the roadmap or tracking docs — those stay canonical
in `swales-backend`:

Roadmap & phase plan: `../swales-backend/docs/roadmap.md`
Live status tracker: `../swales-backend/docs/roadmap_backlog.xlsx`
Session continuity notes: `../swales-backend/docs/status.md`
Flagged risks/gaps not yet fixed: `../swales-backend/docs/future-concerns.md`

`SwalesApp\back` (a separate, unrelated repo/database) is out of scope —
do not read from or write to it.

Mobile stack (React Native + Expo), the auth-token approach, and
`AuthContext` are all decided/built — see `../swales-backend/docs/roadmap.md`'s
Phase A table for current status before assuming something here is still open.
