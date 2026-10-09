export const ROLES = [
  { value: "player", label: "Player" },
  { value: "creator", label: "Creator" },
  { value: "team-owner", label: "Team owner" },
  { value: "brand", label: "Brand" },
  { value: "other", label: "Other" },
] as const;

export type Role = (typeof ROLES)[number]["value"];

export function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role.value === value);
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
