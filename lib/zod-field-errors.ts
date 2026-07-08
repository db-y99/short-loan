import type { ZodIssue } from "zod";

const NESTED_PATH_TO_FORM_FIELD: Record<string, string> = {
  "asset_identity.chassis_number": "chassis_number",
  "asset_identity.engine_number": "engine_number",
  "asset_identity.imei": "imei",
  "asset_identity.serial": "serial",
};

/** Map Zod issues → flat form field keys (first error per field). */
export const zodIssuesToFieldErrors = (
  issues: ZodIssue[],
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const pathKey = issue.path.map(String).join(".");
    const fieldKey =
      NESTED_PATH_TO_FORM_FIELD[pathKey] ??
      (issue.path.length > 0 ? String(issue.path[issue.path.length - 1]) : "_form");

    if (!errors[fieldKey]) {
      errors[fieldKey] = issue.message;
    }
  }

  return errors;
};
