export interface AccountPermissionsScope {
  groups: string[]; // e.g. ["all"] or ["ITS", "Marine Logistics"]
  depts: string[];  // e.g. ["all"] or ["inter2", "inter3", "heavy"]
}

export const AVAILABLE_AGENCIES = [
  { id: "all", name: "ทุกหน่วยงาน (All Agencies)" },
  { id: "ITS", name: "หน่วยงาน ITS" },
  { id: "Marine Logistics", name: "หน่วยงาน Marine Logistics" },
  { id: "Operation & Maintenance", name: "หน่วยงาน O&M (Operation & Maintenance)" },
];

export const AVAILABLE_DEPARTMENTS = [
  { id: "all", name: "ทุกแผนก (All Departments)" },
  { id: "inter2", name: "INTER 2" },
  { id: "inter3", name: "INTER 3" },
  { id: "inter5", name: "INTER 5" },
  { id: "inter7", name: "INTER 7" },
  { id: "heavy", name: "Heavy Machine" },
  { id: "ecc", name: "ECC" },
  { id: "control", name: "CONTROL" },
  { id: "improvement", name: "Improvement" },
  { id: "management", name: "Management" },
];

export function parseAccountScope(deptIdRaw?: string | null): AccountPermissionsScope {
  if (!deptIdRaw || deptIdRaw === "all") {
    return { groups: ["all"], depts: ["all"] };
  }
  
  const rawStr = String(deptIdRaw).trim();
  
  if (rawStr.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawStr);
      const groups = Array.isArray(parsed.groups) && parsed.groups.length > 0 ? parsed.groups : ["all"];
      const depts = Array.isArray(parsed.depts) && parsed.depts.length > 0 ? parsed.depts : ["all"];
      return { groups, depts };
    } catch {
      // Fall through if not valid JSON
    }
  }

  // Parse comma-separated or legacy single department
  const tokens = rawStr.split(",").map(t => t.trim()).filter(Boolean);
  const groups: string[] = [];
  const depts: string[] = [];

  tokens.forEach(tok => {
    if (tok.toLowerCase().startsWith("group:")) {
      groups.push(tok.replace(/^group:/i, "").trim());
    } else {
      depts.push(tok);
    }
  });

  return {
    groups: groups.length > 0 ? groups : ["all"],
    depts: depts.length > 0 ? depts : ["all"],
  };
}

export function serializeAccountScope(groups: string[], depts: string[]): string {
  const cleanGroups = groups.filter(Boolean);
  const cleanDepts = depts.filter(Boolean);

  const finalGroups = cleanGroups.length === 0 || cleanGroups.includes("all") ? ["all"] : cleanGroups;
  const finalDepts = cleanDepts.length === 0 || cleanDepts.includes("all") ? ["all"] : cleanDepts;

  if (finalGroups.includes("all") && finalDepts.includes("all")) {
    return "all";
  }

  return JSON.stringify({
    groups: finalGroups,
    depts: finalDepts,
  });
}

export function getDeptDisplayName(deptId: string): string {
  if (deptId === "all") return "ทุกแผนก (All)";
  const found = AVAILABLE_DEPARTMENTS.find(d => d.id.toLowerCase() === deptId.toLowerCase() || d.name.toLowerCase() === deptId.toLowerCase());
  return found ? found.name : deptId;
}

export function getAgencyDisplayName(agencyId: string): string {
  if (agencyId === "all") return "ทุกหน่วยงาน (All)";
  const found = AVAILABLE_AGENCIES.find(a => a.id.toLowerCase() === agencyId.toLowerCase() || a.name.toLowerCase() === agencyId.toLowerCase());
  return found ? found.name : agencyId;
}

/**
 * Checks whether an employee record is authorized under a given account scope
 */
export function isRecordAuthorizedByScope(
  scope: AccountPermissionsScope,
  recordDept?: string,
  recordGroup?: string
): boolean {
  if (scope.groups.includes("all") && scope.depts.includes("all")) {
    return true;
  }

  const cleanDept = (recordDept || "").trim().toLowerCase().replace(/[\s\-_]/g, "");
  const cleanGroup = (recordGroup || "").trim().toLowerCase();

  const groupAuthorized =
    scope.groups.includes("all") ||
    scope.groups.some(g => {
      const gClean = g.trim().toLowerCase();
      return cleanGroup.includes(gClean) || gClean.includes(cleanGroup);
    });

  const deptAuthorized =
    scope.depts.includes("all") ||
    scope.depts.some(d => {
      const dClean = d.trim().toLowerCase().replace(/[\s\-_]/g, "");
      const mapped = getDeptDisplayName(d).trim().toLowerCase().replace(/[\s\-_]/g, "");
      return (
        cleanDept === dClean ||
        cleanDept.includes(dClean) ||
        dClean.includes(cleanDept) ||
        cleanDept === mapped ||
        cleanDept.includes(mapped) ||
        mapped.includes(cleanDept)
      );
    });

  return groupAuthorized && deptAuthorized;
}
