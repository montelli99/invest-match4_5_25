import {
  Check,
  CheckCheck,
  type Icon as LucideIcon,
  Paperclip,
} from "lucide-react";

export type Icon = typeof LucideIcon;

export const Icons = {
  check: Check,
  checkCheck: CheckCheck,
  paperclip: Paperclip,
} as const;
