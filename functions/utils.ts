import { type ClassValue, clsx } from "npm:clsx@2.1.1";
import { twMerge } from "npm:tailwind-merge@2.5.2";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
