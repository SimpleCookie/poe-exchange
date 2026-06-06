import type { FastifyReply } from 'fastify'
import type { ZodType } from 'zod'

export function parseQueryOrReply<T>(
  schema: ZodType<T>,
  query: unknown,
  reply: FastifyReply,
): T | null {
  const parsed = schema.safeParse(query)

  if (!parsed.success) {
    reply.code(400)
    void reply.send({
      error: 'Invalid query',
      details: parsed.error.flatten(),
    })
    return null
  }

  return parsed.data
}
