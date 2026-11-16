import { expect, test } from "bun:test"
import { openUnreadKeys, UnreadWindows, type Session } from "./unread"

test("counts unread root sessions only among open tabs", () => {
  const sessions: Session[] = [
    { id: "unseen", time: { idle: 10 } },
    { id: "newer", time: { idle: 20, viewed: 10 } },
    { id: "equal", time: { idle: 10, viewed: 10 } },
    { id: "read", time: { idle: 10, viewed: 20 } },
    { id: "draft", time: {} },
    { id: "child", parentID: "unseen", time: { idle: 10 } },
    { id: "archived", time: { idle: 10, archived: 0 } },
  ]
  const data = new Map(sessions.map((session) => [session.id, session]))
  // 'unseen' is old and unread, but its tab is CLOSED: it must not contribute.
  const tabs = sessions.filter((session) => session.id !== "unseen")
    .map((session) => ({ key: session.id, session: data.get(session.id) }))
  expect(openUnreadKeys(tabs)).toEqual(["newer"])
})

test("opening, reading and closing a tab update the count; unloaded drafts do not count", () => {
  const session = { id: "a", time: { idle: 10, viewed: 0 } }
  const tabs = [{ key: "local\na", session }, { key: "draft", session: undefined }]
  expect(openUnreadKeys(tabs)).toEqual(["local\na"])
  session.time.viewed = 10
  expect(openUnreadKeys(tabs)).toEqual([])
  session.time.idle = 20
  expect(openUnreadKeys(tabs)).toEqual(["local\na"])
  expect(openUnreadKeys([])).toEqual([])
})

test("deduplicates windows and tabs, separates servers, removes closed windows", () => {
  const counts = new UnreadWindows()
  counts.set(1, ["local\na", "local\na", "local\nb"])
  counts.set(2, ["local\na", "remote\na"])
  expect(counts.badge()).toBe("3")
  counts.set(1, ["local\na"])
  expect(counts.badge()).toBe("2")
  counts.remove(2)
  expect(counts.badge()).toBe("1")
  counts.set(1, [])
  expect(counts.badge()).toBe("")
})
