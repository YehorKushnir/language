interface SequenceableExercise {
  id: string
  selectionOrder: number
  slots: readonly {
    role: string
    accepted: readonly string[]
  }[]
}

interface ExerciseGroup<T extends SequenceableExercise> {
  key: string
  personKey: string | null
  exercises: T[]
  total: number
  firstOrder: number
}

interface PersonGroup {
  total: number
  used: number
}

const PERSON_BEARING_ROLES = new Set(['possessor', 'spokenSubject', 'subject'])
const PERSON_FORMS = new Set([
  'he',
  'heillä',
  'heillä',
  'hän',
  'hänellä',
  'me',
  'meillä',
  'minä',
  'minulla',
  'mulla',
  'mä',
  'ne',
  'se',
  'sinulla',
  'sinä',
  'sulla',
  'sä',
  'te',
  'teillä',
])
const PERSON_KEYS = new Map([
  ['minä', 'minä'],
  ['mä', 'minä'],
  ['minulla', 'minä'],
  ['mulla', 'minä'],
  ['sinä', 'sinä'],
  ['sä', 'sinä'],
  ['sinulla', 'sinä'],
  ['sulla', 'sinä'],
  ['hän', 'hän'],
  ['se', 'hän'],
  ['hänellä', 'hän'],
  ['me', 'me'],
  ['meillä', 'me'],
  ['te', 'te'],
  ['teillä', 'te'],
  ['he', 'he'],
  ['ne', 'he'],
  ['heillä', 'he'],
])

export function getExerciseConstructionKey(
  exercise: Pick<SequenceableExercise, 'slots'>,
): string {
  return exercise.slots
    .map((slot) => {
      const personForms = slot.accepted
        .map((value) => value.toLocaleLowerCase('fi'))
        .filter((value) => PERSON_FORMS.has(value))
      const person =
        PERSON_BEARING_ROLES.has(slot.role) && personForms.length > 0
          ? `:${personForms.sort().join('/')}`
          : ''
      return `${slot.role}${person}`
    })
    .join('>')
}

export function getExercisePersonKey(
  exercise: Pick<SequenceableExercise, 'slots'>,
): string | null {
  const personForms = exercise.slots.flatMap((slot) =>
    PERSON_BEARING_ROLES.has(slot.role)
      ? slot.accepted
          .map((value) => value.toLocaleLowerCase('fi'))
          .map((value) => PERSON_KEYS.get(value))
          .filter((value): value is string => Boolean(value))
      : [],
  )
  const uniquePersonForms = [...new Set(personForms)].sort()

  return uniquePersonForms.length > 0 ? uniquePersonForms.join('/') : null
}

export function sequenceExercisesByConstruction<T extends SequenceableExercise>(
  exercises: readonly T[],
): T[] {
  const sorted = [...exercises].sort(
    (left, right) =>
      left.selectionOrder - right.selectionOrder ||
      left.id.localeCompare(right.id),
  )
  const groupsByKey = new Map<string, ExerciseGroup<T>>()

  for (const exercise of sorted) {
    const key = getExerciseConstructionKey(exercise)
    const group = groupsByKey.get(key)
    if (group) {
      group.exercises.push(exercise)
      group.total += 1
      continue
    }

    groupsByKey.set(key, {
      key,
      personKey: getExercisePersonKey(exercise),
      exercises: [exercise],
      total: 1,
      firstOrder: exercise.selectionOrder,
    })
  }

  const groups = [...groupsByKey.values()]
  const peopleByKey = new Map<string | null, PersonGroup>()
  for (const group of groups) {
    const person = peopleByKey.get(group.personKey)
    if (person) {
      person.total += group.total
    } else {
      peopleByKey.set(group.personKey, {
        total: group.total,
        used: 0,
      })
    }
  }
  const sequenced: T[] = []
  let previousKey: string | null = null
  let previousPersonKey: string | null = null
  let hasPreviousPerson = false
  let previousPersonRunLength = 0
  let previousConstructionRunLength = 0

  while (sequenced.length < sorted.length) {
    const active = groups.filter((group) => group.exercises.length > 0)
    let eligible = active
    const previousPerson = hasPreviousPerson
      ? peopleByKey.get(previousPersonKey)
      : undefined
    const previousPersonMaxRun = previousPerson
      ? Math.max(
          2,
          Math.ceil(
            previousPerson.total / (sorted.length - previousPerson.total + 1),
          ),
        )
      : Number.POSITIVE_INFINITY
    if (previousPersonRunLength >= previousPersonMaxRun) {
      const differentPeople = eligible.filter(
        (group) => group.personKey !== previousPersonKey,
      )
      if (differentPeople.length > 0) eligible = differentPeople
    }

    const previousConstruction = previousKey
      ? groupsByKey.get(previousKey)
      : undefined
    const previousConstructionMaxRun = previousConstruction
      ? Math.max(
          2,
          Math.ceil(
            previousConstruction.total /
              (sorted.length - previousConstruction.total + 1),
          ),
        )
      : Number.POSITIVE_INFINITY
    if (previousConstructionRunLength >= previousConstructionMaxRun) {
      const differentConstructions = eligible.filter(
        (group) => group.key !== previousKey,
      )
      if (differentConstructions.length > 0) {
        eligible = differentConstructions
      }
    }

    const selected = eligible.sort((left, right) =>
      compareCandidateGroups(
        left,
        right,
        peopleByKey,
        hasPreviousPerson ? previousPersonKey : undefined,
        previousKey,
      ),
    )[0]

    if (!selected) break
    const exercise = selected.exercises.shift()
    if (!exercise) break

    const selectedPerson = peopleByKey.get(selected.personKey)
    if (selectedPerson) selectedPerson.used += 1
    previousConstructionRunLength =
      selected.key === previousKey ? previousConstructionRunLength + 1 : 1
    previousPersonRunLength =
      hasPreviousPerson && selected.personKey === previousPersonKey
        ? previousPersonRunLength + 1
        : 1
    previousKey = selected.key
    previousPersonKey = selected.personKey
    hasPreviousPerson = true
    sequenced.push({
      ...exercise,
      selectionOrder: sequenced.length + 1,
    })
  }

  return sequenced
}

function compareCandidateGroups<T extends SequenceableExercise>(
  left: ExerciseGroup<T>,
  right: ExerciseGroup<T>,
  peopleByKey: ReadonlyMap<string | null, PersonGroup>,
  previousPersonKey: string | null | undefined,
  previousConstructionKey: string | null,
): number {
  const leftPerson = peopleByKey.get(left.personKey)
  const rightPerson = peopleByKey.get(right.personKey)
  const personRemainingDifference =
    (rightPerson ? rightPerson.total - rightPerson.used : 0) -
    (leftPerson ? leftPerson.total - leftPerson.used : 0)
  if (personRemainingDifference !== 0) return personRemainingDifference

  const groupRemainingDifference =
    right.exercises.length - left.exercises.length
  if (groupRemainingDifference !== 0) return groupRemainingDifference

  const leftRepeatsPerson =
    previousPersonKey !== undefined && left.personKey === previousPersonKey
  const rightRepeatsPerson =
    previousPersonKey !== undefined && right.personKey === previousPersonKey
  if (leftRepeatsPerson !== rightRepeatsPerson) {
    return leftRepeatsPerson ? 1 : -1
  }

  const leftRepeatsConstruction = left.key === previousConstructionKey
  const rightRepeatsConstruction = right.key === previousConstructionKey
  if (leftRepeatsConstruction !== rightRepeatsConstruction) {
    return leftRepeatsConstruction ? 1 : -1
  }

  const nextOrderDifference =
    (left.exercises[0]?.selectionOrder ?? Number.MAX_SAFE_INTEGER) -
    (right.exercises[0]?.selectionOrder ?? Number.MAX_SAFE_INTEGER)
  if (nextOrderDifference !== 0) return nextOrderDifference

  return left.firstOrder - right.firstOrder || left.key.localeCompare(right.key)
}
