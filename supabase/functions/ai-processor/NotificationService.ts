/**
 * NotificationService – handles sending push notifications via Expo Push API.
 * Used by ai-processor to notify users when the Morning Brief is ready.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_MESSAGES_PER_REQUEST = 100;

export interface MorningBriefNotification {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const DEFAULT_MORNING_BRIEF: MorningBriefNotification = {
  title: "🗞️ Your Morning Brief is Ready",
  body: "We've summarized today's top 5 editorials for you. Tap to read.",
};

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  sound?: "default";
  data?: Record<string, unknown>;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

interface ExpoPushResponse {
  data?: ExpoPushTicket[];
  errors?: Array<{ code: string; message: string }>;
}

/**
 * Validates that a string looks like an Expo push token (ExponentPushToken[xxx] or ExpoPushToken[xxx]).
 */
function isValidExpoToken(token: string): boolean {
  return /^ExponentPushToken\[.+]$|^ExpoPushToken\[.+]$/i.test(token.trim());
}

/**
 * Sends push notifications to the given Expo push tokens.
 * Batches requests (max 100 per request per Expo docs).
 * @param tokens – Array of Expo push tokens
 * @param notification – Title and body (defaults to Morning Brief)
 * @returns Object with sent count and any errors
 */
export async function sendPushNotifications(
  tokens: string[],
  notification: MorningBriefNotification = DEFAULT_MORNING_BRIEF
): Promise<{ sent: number; errors: string[] }> {
  const validTokens = tokens
    .map((t) => t?.trim())
    .filter((t) => t && isValidExpoToken(t));

  if (validTokens.length === 0) {
    return { sent: 0, errors: ["No valid Expo push tokens provided"] };
  }

  const messages: ExpoMessage[] = validTokens.map((to) => ({
    to,
    title: notification.title,
    body: notification.body,
    sound: "default",
    ...(notification.data && Object.keys(notification.data).length > 0 && { data: notification.data }),
  }));

  const errors: string[] = [];
  let sent = 0;

  for (let i = 0; i < messages.length; i += MAX_MESSAGES_PER_REQUEST) {
    const batch = messages.slice(i, i + MAX_MESSAGES_PER_REQUEST);
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(batch),
    });

    const data = (await res.json()) as ExpoPushResponse;

    if (!res.ok) {
      const errMsg = data.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ?? res.statusText;
      errors.push(`Expo Push API error: ${errMsg}`);
      continue;
    }

    const tickets = data.data ?? [];
    for (const ticket of tickets) {
      if (ticket.status === "ok") {
        sent++;
      } else {
        errors.push(ticket.message ?? `Unknown error for token`);
      }
    }
  }

  return { sent, errors };
}
