"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DialogField } from "@/lib/portfolio-types";

interface AddAssetDialogProps {
  title: string;
  triggerLabel: string;
  fields: DialogField[];
  isPending: boolean;
  onSubmit: (formData: Record<string, string>) => void;
}

export const AddAssetDialog = ({
  title,
  triggerLabel,
  fields,
  isPending,
  onSubmit,
}: AddAssetDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Convert FormData to a simple object
    const values: Record<string, string> = {};
    fields.forEach((field) => {
      values[field.name] = formData.get(field.name) as string;
    });

    onSubmit(values);
    setOpen(false); // Close immediately on submit (optimistic) or handle via parent
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                step={field.step}
                required={field.required}
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};