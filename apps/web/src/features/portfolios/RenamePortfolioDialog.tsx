"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdatePortfolio } from "@/hooks/use-portfolios";
import { useToast } from "@/hooks/use-toast";

interface RenamePortfolioDialogProps {
  readonly portfolioId: string;
  readonly currentName: string;
  readonly currentDescription: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function RenamePortfolioDialog({
  portfolioId,
  currentName,
  currentDescription,
  open,
  onOpenChange,
}: RenamePortfolioDialogProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");
  const { toast } = useToast();

  const { mutate, isPending } = useUpdatePortfolio(portfolioId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast("Portfolio updated", "success");
          onOpenChange(false);
        },
        onError: (err: Error) => {
          toast(err.message || "Failed to update portfolio", "error");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Portfolio</DialogTitle>
          <DialogDescription>
            Update the name or description of your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="rename-name">Name</Label>
            <Input
              id="rename-name"
              className="stoxly-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rename-description">
              Description{" "}
              <span className="text-muted text-small">(optional)</span>
            </Label>
            <Input
              id="rename-description"
              className="stoxly-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this portfolio"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
