import { Hono } from 'hono'
import * as model from './model'
import { Bindings } from './bindings'
import { bodyParse } from 'hono/body-parse'
import { cors } from 'hono/cors'

const api = new Hono<Bindings>()
api.use('/bookmarks/*', cors(), bodyParse())

api.get('/bookmarks', async (c) => {
  const bookmarks = await model.getBookmarks(c.env.YM_HCW)
  return c.json({ bookmarks: bookmarks, ok: true })
})

api.post('/bookmarks', async (c) => {
  const param = c.req.parsedBody
  const newBookmark = await model.createBookmark(c.env.YM_HCW, param)
  if (!newBookmark) {
    return c.json({ error: 'Can not create new bookmark', ok: false }, 422)
  }
  return c.json({ post: newBookmark, ok: true }, 201)
})

api.get('/bookmarks/:id', async (c) => {
  const id = c.req.param('id')
  const bookmark = await model.getBookmark(c.env.YM_HCW, id)
  if (!bookmark) {
    return c.json({ error: 'Not Found', ok: false }, 404)
  }
  return c.json({ bookmark: bookmark, ok: true })
})

api.put('/bookmarks/:id', async (c) => {
  const id = c.req.param('id')
  const bookmark = await model.getBookmark(c.env.YM_HCW, id)
  if (!bookmark) {
    // 204 No Content
    return new Response(null, { status: 204 })
  }
  const success = await model.updateBookmarkDate(c.env.YM_HCW, id)
  return c.json({ ok: success })
})

api.delete('/bookmarks/:id', async (c) => {
  const id = c.req.param('id')
  const bookmark = await model.getBookmark(c.env.YM_HCW, id)
  if (!bookmark) {
    // 204 No Content
    return new Response(null, { status: 204 })
  }
  const success = await model.deleteBookmark(c.env.YM_HCW, id)
  return c.json({ ok: success })
})

export { api }