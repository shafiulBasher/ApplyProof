export type OverallStatus = "not_checked" | "passed" | "action_needed" | "needs_verification";

const STYLES: Record<OverallStatus, [string, string]> = {
  not_checked: ["Not Checked", "bg-navy/5 text-slate"],
  passed: ["Passed", "bg-mint/15 text-[#1f8a63]"],
  action_needed: ["Action Needed", "bg-rose/12 text-rose"],
  needs_verification: ["Needs Verification", "bg-amber/15 text-[#9a6a17]"],
};

export default function StatusBadge({ status }: { status: OverallStatus }) {
  const [label, cls] = STYLES[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}
