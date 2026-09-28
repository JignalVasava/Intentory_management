import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusTone, type Tone } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";

const toneCls: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info/10 text-info border-info/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  success: "bg-success/10 text-success border-success/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  navy: "bg-primary text-primary-foreground border-primary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium", toneCls[statusTone(status)], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function ProgressBar({ value, className, showLabel = true }: { value: number; className?: string; showLabel?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
        <div className={cn("h-full rounded-full transition-all", value >= 100 ? "bg-success" : "bg-info")} style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="w-10 text-right font-mono text-xs font-semibold text-foreground">{value}%</span>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-sm", className)}>
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{body}</p>}
    </div>
  );
}

export function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 text-sm font-medium text-foreground", mono && "font-mono")}>{value ?? "—"}</dd>
    </div>
  );
}

/** Button gated by the current demo role. */
export function RoleButton({ roles, children, onClick, variant = "default", size = "sm" }: { roles: Role[]; children: ReactNode; onClick: () => void; variant?: "default" | "outline" | "destructive" | "secondary"; size?: "sm" | "default" }) {
  const { role } = useStore();
  const allowed = roles.includes(role);
  if (!allowed) {
    return (
      <Button size={size} variant="outline" disabled title={`Switch role to ${roles.join(" / ")}`} className="gap-1.5">
        <Lock className="h-3 w-3" />
        {children}
        <span className="text-[10px] font-normal text-muted-foreground">({roles[0]})</span>
      </Button>
    );
  }
  return (
    <Button size={size} variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}
