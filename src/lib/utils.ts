export function getUserDisplayName(
  user: any
): string {
  if (!user) return "Engineering Student";

  const meta = user.user_metadata || {};
  const identityData = user.identities?.[0]?.identity_data || {};

  // 1. Check Google account metadata fields
  const metaName =
    meta.full_name ||
    meta.name ||
    meta.display_name ||
    identityData.full_name ||
    identityData.name ||
    identityData.display_name;

  if (metaName && typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }

  if (meta.given_name || identityData.given_name) {
    const given = meta.given_name || identityData.given_name;
    const family = meta.family_name || identityData.family_name || "";
    const combined = `${given} ${family}`.trim();
    if (combined) return combined;
  }

  if (!user.email) return "Engineering Student";

  const emailId = user.email.split("@")[0] || "";
  if (!emailId) return "Engineering Student";

  // 2. Try parsing formatted name from email ID (e.g. arghya.jana.cse29 -> Arghya Jana)
  const parts = emailId
    .split(/[\._\-]/)
    .filter((part: string) => !part.match(/^(cse|it|ece|ee|me|ce|\d+)$/i));

  const parsedName = parts
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .trim();

  if (parsedName && parsedName.length > 0) {
    return parsedName;
  }

  // 3. Fallback: Whenever the name is not visible, make sure user's name is the first two letters of their email ID
  return emailId.substring(0, 2).toUpperCase() || "Engineering Student";
}

export function getUserInitials(
  user: any
): string {
  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || meta.name || meta.display_name;

  if (fullName && typeof fullName === "string" && fullName.trim()) {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    } else if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
  }

  const name = getUserDisplayName(user);
  if (name && name !== "Engineering Student") {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (user?.email) {
    const emailId = user.email.split("@")[0] || "";
    return emailId.substring(0, 2).toUpperCase() || "ST";
  }

  return "ST";
}
