import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  half?: boolean;
}

type Names = "remarks" | "reason" | "budget" | "contractor" | "progress" | "finalCost" | "outcome" | "cost" | "docs" | "name" | "type" | "priority" | "location" | "address" | "engineer" | "estimatedCost" | "expectedEnd" | "scale" | "description" | "asset" | "category" | "citizen" | "contact" | "photos";
export type FormValues = { [K in Names]: string };

export interface FormDialogState {
  title: string;
  description?: string;
  fields: FieldDef[];
  submitLabel?: string;
  destructive?: boolean;
  onSubmit: (values: FormValues) => void;
}

export function FormDialog({ state, onClose }: { state: FormDialogState | null; onClose: () => void }) {
  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {state && <FormBody key={state.title} state={state} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function FormBody({ state, onClose }: { state: FormDialogState; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(state.fields.map((f) => [f.name, f.defaultValue ?? ""])));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    for (const f of state.fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) errs[f.name] = `${f.label} is required`;
      else if (v.length > (f.maxLength ?? 1000)) errs[f.name] = `Max ${f.maxLength ?? 1000} characters`;
      else if (f.type === "number" && v) {
        const n = Number(v);
        if (Number.isNaN(n)) errs[f.name] = "Enter a number";
        else if (f.min !== undefined && n < f.min) errs[f.name] = `Minimum ${f.min}`;
        else if (f.max !== undefined && n > f.max) errs[f.name] = `Maximum ${f.max}`;
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    state.onSubmit(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])) as FormValues);
    onClose();
  };

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-primary">{state.title}</DialogTitle>
        {state.description && <DialogDescription>{state.description}</DialogDescription>}
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-2">
        {state.fields.map((f) => (
          <div key={f.name} className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
            <Label htmlFor={f.name} className="mb-1.5 block text-xs font-medium">
              {f.label} {f.required && <span className="text-destructive">*</span>}
            </Label>
            {f.type === "textarea" ? (
              <Textarea id={f.name} value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} rows={3} maxLength={f.maxLength ?? 1000} />
            ) : f.type === "select" ? (
              <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                <SelectTrigger id={f.name}><SelectValue placeholder={f.placeholder ?? "Select…"} /></SelectTrigger>
                <SelectContent>
                  {f.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input id={f.name} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} step="any" value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} maxLength={f.maxLength ?? 200} />
            )}
            {errors[f.name] && <p className="mt-1 text-xs text-destructive">{errors[f.name]}</p>}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={state.destructive ? "destructive" : "default"} onClick={submit}>{state.submitLabel ?? "Confirm"}</Button>
      </DialogFooter>
    </>
  );
}

export function useFormDialog(): [ReactNode, (s: FormDialogState) => void] {
  const [state, setState] = useState<FormDialogState | null>(null);
  return [<FormDialog key="fd" state={state} onClose={() => setState(null)} />, setState];
}
