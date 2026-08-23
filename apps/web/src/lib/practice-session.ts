import type { PracticeSessionResponse } from '@language/contracts'

export function appendPracticeAttempt(
  session: PracticeSessionResponse,
  exerciseId: string,
  attemptId: string,
  isCorrect: boolean,
): PracticeSessionResponse {
  if (session.completedExerciseIds.includes(exerciseId)) return session

  return {
    ...session,
    answeredExercises: session.answeredExercises + 1,
    correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
    attemptIds: [...session.attemptIds, attemptId],
    completedExerciseIds: [...session.completedExerciseIds, exerciseId],
  }
}
