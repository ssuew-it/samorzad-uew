import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Lokalizowane odpowiedniki next/navigation - Link sam dokleja prefiks /pl /en.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
