import { DatabaseClient, UserRole } from '../src/index.js'

const prisma = new DatabaseClient()
const [rawEmail, rawRole = 'ADMIN'] = process.argv
  .slice(2)
  .filter((argument) => argument !== '--')

async function main() {
  const email = rawEmail?.trim().toLowerCase()
  const role = rawRole.toUpperCase()
  if (!email) {
    throw new Error(
      'Укажите email пользователя: pnpm user:set-role -- user@example.com ADMIN',
    )
  }
  if (role !== UserRole.USER && role !== UserRole.ADMIN) {
    throw new Error('Роль должна быть USER или ADMIN.')
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  })
  if (!user) throw new Error(`Пользователь ${email} не найден.`)

  await prisma.user.update({
    where: { id: user.id },
    data: { role },
  })
  console.info(`Роль ${role} назначена пользователю ${user.email}.`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    await prisma.$disconnect()
    process.exitCode = 1
  })
