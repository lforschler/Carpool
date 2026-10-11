# Carpool

School carpool coordination for a small family group.

## Schedule hybrid (this branch)

**Week + Agenda** is the main schedule surface (exploration winner). Mock data only — **no auth, database, or SMS** in this PR.

### Run locally

```bash
npm install
npm run dev
# or: npm run build && npm run start
```

Open [http://localhost:3000/week](http://localhost:3000/week) (home redirects here).

| Route | Role |
|-------|------|
| `/` | Redirects to `/week` |
| `/week` | Primary week calendar |
| `/agenda` | Secondary agenda / list |
| `/explore` | Archive chooser; C/D reference |
| `/explore/drivers` | Driver board (reference) |
| `/explore/table` | Edit-heavy table (reference) |

Week and Agenda share one trip editor; edits persist in `localStorage`.

Sample data: `src/lib/mock-schedule.json` (from the shared Google Sheet).
