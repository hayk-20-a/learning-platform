import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn() merges Tailwind classes intelligently
// Without this: className="px-4 px-6" keeps both (bug)
// With this:    cn("px-4", "px-6") → "px-6" (correct, last wins)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
