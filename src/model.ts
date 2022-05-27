const PREFIX = 'v1:bookmark'

declare global {
  interface Crypt {
    randomUUID(): string
  }
}

export interface Bookmark {
  id: string
  url: string
  title: string
  last_updated_at?: string
}

export type Param = {
  url?: string
  title?: string
  last_updated_at?: string
}

const generateID = (key: string) => {
  return `${PREFIX}${key}`
}

export const getBookmarks = async (KV: KVNamespace): Promise<Bookmark[]> => {
  const list = await KV.list({ prefix: PREFIX })
  const keys = list.keys
  const bookmarks: Bookmark[] = []

  const len = keys.length
  for (let i = 0; i < len; i++) {
    const value = await KV.get(keys[i].name)
    if (value) {
      const bookmark: Bookmark = JSON.parse(value)
      bookmarks.push(bookmark)
    }
  }

  return bookmarks
}

export const getBookmark = async (KV: KVNamespace, id: string): Promise<Bookmark | undefined> => {
  const value = await KV.get(generateID(id))
  if (!value) return
  const bookmark: Bookmark = JSON.parse(value)
  return bookmark
}

export const createBookmark = async (KV: KVNamespace, param: Param): Promise<Bookmark | undefined> => {
  if (!(param && param.title && param.url)) return
  const id = crypto.randomUUID()
  const newBookmark: Bookmark = { id: id, title: param.title, url: param.url }
  await KV.put(generateID(id), JSON.stringify(newBookmark))
  return newBookmark
}

export const updateBookmarkDate = async (KV: KVNamespace, id: string): Promise<boolean> => {
  const bookmark = await getBookmark(KV, id)
  if (!bookmark) return false
  bookmark.last_updated_at = (new Date()).toLocaleString("ja")
  await KV.put(generateID(id), JSON.stringify(bookmark))
  return true
}

export const deleteBookmark = async (KV: KVNamespace, id: string): Promise<boolean> => {
  const post = await getBookmark(KV, id)
  if (!post) return false
  await KV.delete(generateID(id))
  return true
}