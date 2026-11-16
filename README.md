# OpenCode unread Dock badge

OpenCode V2 desktop GUI plugin for macOS. Shows the number of **unread sessions
in currently open tabs**, across desktop windows. Old sessions with closed tabs
are never counted. Zero clears the badge.

## Development

```sh
bun install --ignore-scripts
bun test
bun run typecheck
bun run build
```

The package exports the prebuilt `dist/gui-experimental.cjs` GUI entry. Its
experimental GUI SDK is pinned to 2.2.7 and has been loaded in Desktop 2.3.0.
Electron is a development/type dependency; runtime uses the app's Electron.

## Installation

```sh
ln -s ~/work/opencode-unread-badge ~/.config/opencode/plugins/opencode-unread-badge
```

OpenCode watches plugin changes. Check **Settings → Extensions → Plugins** for
`opencode-unread-badge`. Rebuild after editing; use `bun run build --watch`
while developing. Do not also configure a second copy of the plugin.

Enable OpenCode notifications and icon badges in macOS **System Settings →
Notifications → OpenCode** if the badge does not appear.

## Behavior and limitations

- Reads `ctx.sessions.list()` (open shell tabs) and the host's reactive synced
  session timestamps. No history scans or additional server requests.
- Automatic unread means `time.idle > time.viewed`, or an idle timestamp with
  no viewed timestamp. Reading a session clears it; closing its tab removes it
  from consideration even if it remains unread.
- Updates reactively, with a 3-second retry to recover from plugin reloads.
  Counts a session once across duplicate tabs/windows, and separates servers.
  Closing all windows clears the badge.
- Drafts, unloaded sessions, archived sessions and subagents are excluded.
  Permission/question requests alone do not count as unread completions.
- **“Mark as unread” is not included.** That private desktop preference is not
  exposed by the public plugin API. Legacy unread migration can also temporarily
  differ until the app finishes migration.
- No database access, custom read-state persistence, sounds or Dock bouncing.
  The plugin never marks sessions read. Disabling/unloading clears the badge.
  Avoid other plugins that write the same app-wide Dock badge.

To uninstall, remove only the symlink from `~/.config/opencode/plugins/`.
