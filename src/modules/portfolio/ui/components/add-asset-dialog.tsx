"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DialogField } from "@/lib/portfolio-types";

interface AddAssetDialogProps {
  title: string;
  triggerLabel?: string; // Optional now, since we might open it manually
  fields: DialogField[];
  onSubmit: (values: Record<string, string>) => void;
  isPending: boolean;
  // NEW PROPS FOR EDITING
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Record<string, any>;
}

export function AddAssetDialog({
  title,
  triggerLabel,
  fields,
  onSubmit,
  isPending,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultValues,
}: AddAssetDialogProps) {
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise internal
  const isOpen = controlledOpen ?? internalOpen;
  const onOpenChange = setControlledOpen ?? setInternalOpen;

  const [formData, setFormData] = useState<Record<string, string>>({});

  // Reset form or Load defaults when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        // Convert numbers to strings for inputs
        const stringified = Object.fromEntries(
          Object.entries(defaultValues).map(([k, v]) => [k, String(v)])
        );
        setFormData(stringified);
      } else {
        setFormData({});
      }
    }
  }, [isOpen, defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Note: We don't close automatically here; 
    // we let the parent close it on success, or close it manually.
    if (!isPending && !controlledOpen) {
       onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.name} className="text-right">
                {field.label}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                step={field.step}
                required={field.required}
                className="col-span-3"
                value={formData[field.name] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                // If editing, usually Symbol is locked (read-only)
                disabled={defaultValues && field.name === "symbol"} 
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}