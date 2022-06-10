const PREFIX = 'v1:bookmark'

declare global {
  interface Crypt {
    randomUUID(): string
  }
}

export interface Bookmark {
  id: string
  url: string
  link: string
  last_updated_at?: string
  users?: string[]
  b_url?: string
}

export type Param = {
  url?: string
  link?: string
  last_updated_at?: string
  users?: string[]
  b_url?: string
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
  if (!(param && param.link && param.url && param.last_updated_at)) return
  const last_updated_at = convertDate(param.last_updated_at)
  const newBookmark: Bookmark = { id: param.url, link: param.link, url: param.url, last_updated_at: last_updated_at }
  await KV.put(generateID(param.url), JSON.stringify(newBookmark))
  return newBookmark
}

export const updateBookmark = async (KV: KVNamespace, id: string, param: Param): Promise<boolean> => {
  const bookmark = await getBookmark(KV, id)
  if (!bookmark) return false
  bookmark.last_updated_at = param.last_updated_at
  bookmark.users = param.users
  bookmark.b_url = param.b_url
  await KV.put(generateID(id), JSON.stringify(bookmark))
  return true
}

export const deleteBookmark = async (KV: KVNamespace, id: string): Promise<boolean> => {
  const post = await getBookmark(KV, id)
  if (!post) return false
  await KV.delete(generateID(id))
  return true
}

// IFTTT の created_at を valid な日付に変換する
const convertDate = (date: string) => {
  // そもそも valid な format で日付が送られてきた場合はそのまま返す
  if (isValidDate(date)) return date

  // May 31, 2022 at 08:00PM のような書式に対応する正規表現
  let m = date.match(/(.+\d{4}) at (.+)([AP]M)/)

  // マッチしなかったら空文字を返却
  if (!m) return ''

  // Date がパースできるように並び変える
  let result = new Date(`${m[1].trim()} ${m[2]}`)

  // PMなら12時間足す
  if (m[3] === 'PM') {
    result = new Date(result.setHours(result.getHours() + 12))
  }
  
  // 午前0時台は 12:00AM のようになっているため12時間減らす
  if (m[3] === 'AM' && result.getHours() == 12) {
    result = new Date(result.setHours(result.getHours() - 12))
  }

  // timezone の指定は不要
  return result.toLocaleString("ja")
}

const isValidDate = (date: string) => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}
