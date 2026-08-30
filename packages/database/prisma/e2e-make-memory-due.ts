import { DatabaseClient } from '../src/index.js'

const [email, itemId] = process.argv
  .slice(2)
  .filter((argument) => argument !== '--')

if (!email || !itemId) {
  throw new Error('Usage: e2e:make-memory-due <email> <itemId>')
}

const database = new DatabaseClient()

try {
  const user = await database.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (!user) throw new Error(`E2E user ${email} was not found`)

  await database.userMemory.update({
    where: {
      userId_itemId: { userId: user.id, itemId },
    },
    data: { dueAt: new Date(0) },
  })
} finally {
  await database.$disconnect()
}
