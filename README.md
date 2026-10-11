# Carpool

School carpool coordination for a small family group.

## Schedule UI exploration (this branch)

Throwaway prototypes to compare four schedule surfaces against the real sample Google Sheet. **No auth, database, or SMS** here.

### Run locally

```bash
npm install
npm run dev
# or production-style:
# npm run build && npm run start
```

Open [http://localhost:3000/explore](http://localhost:3000/explore).

| Route | Concept |
|-------|---------|
| `/explore` | Chooser |
| `/explore/week` | Week calendar |
| `/explore/agenda` | Agenda / list |
| `/explore/drivers` | Driver-first board |
| `/explore/table` | Edit-heavy table |

Edits (driver, riders, status) persist in `localStorage` so you can switch concepts and compare.

Sample data is normalized from the shared sheet into `src/lib/mock-schedule.json`.
