import { Platform } from "react-native";

/**
 * True when Google Sign-In native module is available (dev client / release), not Expo Go without the module.
 */
export function isGoogleSignInNativeAvailable(): boolean {
  if (Platform.OS === "web") return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@react-native-google-signin/google-signin");
    return true;
  } catch {
    return false;
  }
}
