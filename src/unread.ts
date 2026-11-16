/** The public SessionInfo fields used by OpenCode's automatic unread predicate. */
export interface Session {
  id: string
  parentID?: string | null
  time: { idle?: number; viewed?: number; archived?: number }
}

/** Input is the open tab inventory, never the server's full session history. */
export function openUnreadKeys(tabs: readonly { key: string; session?: Session }[]): string[] {
  return tabs.flatMap(({ key, session }) => {
    if (!session || session.parentID) return []
    const { idle, viewed, archived } = session.time
    return archived === undefined && idle !== undefined && (viewed === undefined || idle > viewed)
      ? [key]
      : []
  })
}

export class UnreadWindows {
  private windows = new Map<number, readonly string[]>()

  set(window: number, unread: readonly string[]) {
    this.windows.set(window, unread)
  }

  remove(window: number) {
    this.windows.delete(window)
  }

  badge(): string {
    const count = new Set([...this.windows.values()].flat()).size
    return count ? String(count) : ""
  }
}
