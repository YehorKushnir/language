import type { PracticeSessionResponse } from '@language/contracts'

export function appendPracticeAttempt(
  session: PracticeSessionResponse,
  exerciseId: string,
  attemptId: string,
  isCorrect: boolean,
): PracticeSessionResponse {
  const isPrimaryAttempt = !session.completedExerciseIds.includes(exerciseId)
  const correctsPreviousError = session.pendingCorrections.some(
    (correction) => correction.exerciseId === exerciseId,
  )
  const attemptIds = [...session.attemptIds, attemptId]
  const pendingCorrections = session.pendingCorrections.filter(
    (correction) => correction.exerciseId !== exerciseId,
  )

  if (!isCorrect) {
    pendingCorrections.push({
      exerciseId,
      retryAfterAttempt: attemptIds.length + session.correctionDelay,
    })
  }

  return {
    ...session,
    answeredExercises: session.answeredExercises + (isPrimaryAttempt ? 1 : 0),
    correctAnswers:
      session.correctAnswers +
      (isCorrect && (isPrimaryAttempt || correctsPreviousError) ? 1 : 0),
    attemptIds,
    completedExerciseIds: isPrimaryAttempt
      ? [...session.completedExerciseIds, exerciseId]
      : session.completedExerciseIds,
    pendingCorrections,
  }
}

export function getNextPracticeCorrection(
  session: PracticeSessionResponse,
): string | null {
  if (session.answeredExercises >= session.totalExercises) {
    return session.pendingCorrections[0]?.exerciseId ?? null
  }

  return (
    session.pendingCorrections.find(
      (correction) => correction.retryAfterAttempt <= session.attemptIds.length,
    )?.exerciseId ?? null
  )
}

export function practiceIsReadyToComplete(
  session: PracticeSessionResponse,
): boolean {
  return (
    session.answeredExercises === session.totalExercises &&
    session.correctAnswers >= session.requiredCorrectAnswers
  )
}
