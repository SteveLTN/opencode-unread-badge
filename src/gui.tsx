import { app } from "electron"
import { Ipc, Plugin } from "@opencode/plugin/gui"
import { Schema } from "effect"
import { createEffect } from "solid-js"
import { openUnreadKeys, UnreadWindows } from "./unread"

const UnreadTabs = Ipc.define({
  id: "opencode-unread-badge.tabs",
  methods: { set: { input: Schema.Array(Schema.String) } },
})

export default Plugin.define({
  os: ["macos"],
  setup(ctx) {
    const main = ctx.main(UnreadTabs)
    const report = () => {
      const unread = openUnreadKeys(ctx.sessions.list().map((tab) => ({
        // Canonical server URL deduplicates the same session across windows/aliases.
        key: `${tab.server.url.replace(/\/$/, "")}\n${tab.id}`,
        session: tab.pending ? undefined : tab.server.data.session.get(tab.id),
      })))
      void main.set(unread).catch(() => {
        // Main may be reloading. The periodic report retries automatically.
      })
    }
    // Both tab inventory and the host's synced session timestamps are reactive.
    createEffect(report)
    const retry = setInterval(report, 3000)
    return () => clearInterval(retry)
  },
  main(ctx) {
    ctx.log.write("info", "Open-tab unread Dock badge started")
    const counts = new UnreadWindows()
    let previous: string | undefined
    const update = () => {
      const badge = counts.badge()
      if (badge === previous) return
      app.dock?.setBadge(badge)
      previous = badge
      ctx.log.write("info", "Unread Dock badge updated", { count: Number(badge || 0) })
    }

    ctx.provide(UnreadTabs, {
      set(unread, caller) {
        if (!ctx.windows.get(caller.window)) return
        counts.set(caller.window, unread)
        update()
      },
    })
    const off = ctx.windows.on("close", (window) => {
      counts.remove(window.id)
      update()
    })
    update()

    return () => {
      off()
      app.dock?.setBadge("")
    }
  },
})
