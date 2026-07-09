# Timeline Data

`timeline.json` is the source file for the future Timeline section. It is intentionally plain JSON so entries can be reviewed and edited by hand.

Entry types:

- `version_update`: game/client/server update notes, including map and weapon releases.
- `event`: standalone official or community event milestones. If an official event happened as part of a version update on the same date, keep it as one `version_update` entry and add `event` / `official_event` tags plus `mergedEventTitles`.
- `community_project`: community-run projects, tournaments, videos, and resource efforts.

Priority:

- `high`: maps, gun or weapon releases, events, and community projects.
- `low`: bug fixes, minor balance tweaks, infrastructure notes, small server/client updates.

Tags:

- `patch`: an ordinary update, fix, balance pass, platform note, or minor gameplay adjustment.
- `event`: an entry that should appear in the Events filter, including merged event/update entries.
- `map_release`: a new map, new level, or major map variant release. This powers the Timeline map filter.
- `map_update`: a major update to an existing map. This is shown on entries but does not count as a new map release.
- `weapon_release`: a new gun, weapon, sidearm, throwable, or melee release. This powers the Timeline gun filter.
- `mode_release`: a new game mode or major mode rollout.
- `vehicle_release`: a new playable vehicle or major vehicle rollout.
- `platform_release`: a major platform/client release, such as the Steam launch.

Avoid broad labels like `map` or `weapon` for entries that only fix, tune, or mention those systems. Use the release tags only when the entry actually introduced the thing.

Release items:

- Use `releaseItems` to list the actual maps, weapons, modes, vehicles, or platform milestones introduced by an entry.
- `date` should match the public update-log date when available.
- Base-game items are tracked in `metadata.baseGame`, not as release timeline entries.
- If the community/dev record gives an internal menu/addition order that differs from public release order, keep the public release date in `releaseItems` and add a note rather than changing the date without confirmation.

Image handling:

- Use `image.url` for a direct image URL when one exists.
- Set `image.url` to `null` and `image.needsManualImage` to `true` when an image should be added manually later.

When adding entries, keep `releaseDate` in `YYYY-MM-DD` format when possible, use stable lowercase kebab-case IDs, and add at least one `sourceRefs` item so future editors can trace where the entry came from.
