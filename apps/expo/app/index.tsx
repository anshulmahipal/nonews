import { Redirect } from "expo-router";

/**
 * `/` resolves here first; send users to the tab shell without imperative navigation
 * (router.replace in useEffect runs before the root Stack mounts and throws).
 */
export default function IndexRedirect() {
  return <Redirect href="/(tabs)" />;
}
