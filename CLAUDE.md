This app talks to `swales-backend`, which is the active rebuild backend, not
the live production one (`swales-backend.vercel.app` — plain Vercel URL, no
custom domain). The real live site is `api.swales.app` / `designer.swales.app`,
served by the separate `SwalesApp\back` repo family. (Corrected 2026-08-24 —
see `../swales-backend/docs/status.md`'s "Doc relocation note".) This repo
does not carry its own copy of the roadmap or tracking docs — those stay
canonical in `swales-backend`:

Roadmap & phase plan: `../swales-backend/docs/roadmap.md`
Live status tracker: `../swales-backend/docs/roadmap_backlog.xlsx`
Session continuity notes: `../swales-backend/docs/status.md`

`SwalesApp\back` (a separate, unrelated repo/database) is out of scope —
do not read from or write to it.

**Mobile stack confirmed (2026-08-24):** React Native + Expo — see
`../swales-backend/docs/status.md`'s "Next up" item 1. Phase B is still
gated on the separate auth-token decision, not the stack.
