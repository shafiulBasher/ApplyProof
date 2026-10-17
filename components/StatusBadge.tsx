export type OverallStatus = "not_checked" | "passed" | "action_needed" | "needs_verification";

// Always a text label next to the color, never color alone.
const STYLES: Record<OverallStatus, [string, string]> = {
  not_checked: ["Not Checked", "bg-lilac/70 text-muted"],
  passed: ["Ready", "bg-sage text-sage-ink"],
  action_needed: ["Action Needed", "bg-peach text-peach-ink"],
  needs_verification: ["Needs Verification", "bg-butter text-butter-ink"],
};

export const STATUS_LABEL = (s: OverallStatus) => STYLES[s][0];

export default function StatusBadge({ status, label, confirmed = 0 }: { status: OverallStatus; label?: string; confirmed?: number }) {
  const [text, cls] = STYLES[status];
  // Never "Verified" when the applicant vouched for some items: say so.
  const shown = label ?? (status === "passed" && confirmed > 0 ? `Ready to submit · ${confirmed} confirmed by you` : text);
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{shown}</span>;
}
