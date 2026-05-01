import type { AuthorStance } from "./types";

/** Shown at the top of stance tag help UI (web + native). */
export const STANCE_TAG_HELP_INTRO =
  "This colored tag is our AI’s read of the editorial’s tone—how the author frames the topic. It’s a quick signal, not a fact check or a verdict on who’s right.";

export const STANCE_DESCRIPTIONS: Record<AuthorStance, string> = {
  Supportive:
    "The author broadly backs or defends a person, policy, institution, or idea.",
  Critical:
    "The author mainly challenges, questions, or pushes back against something.",
  Neutral:
    "Mostly factual or descriptive reporting, without a strong lean either way.",
  Balanced:
    "The author deliberately weighs pros and cons or presents multiple sides.",
  Sarcastic:
    "Irony, mockery, or sharp wit is doing a lot of the argumentative work.",
};

export const UNKNOWN_STANCE_DESCRIPTION =
  "We couldn’t label this one confidently—open the full article to judge the author’s angle yourself.";

export function getStanceDescription(stance: AuthorStance | null): string {
  if (!stance) return UNKNOWN_STANCE_DESCRIPTION;
  return STANCE_DESCRIPTIONS[stance] ?? UNKNOWN_STANCE_DESCRIPTION;
}

/** Stable order for help dialogs and popovers. */
export const STANCES_ORDERED: readonly AuthorStance[] = [
  "Supportive",
  "Critical",
  "Neutral",
  "Balanced",
  "Sarcastic",
] as const;
