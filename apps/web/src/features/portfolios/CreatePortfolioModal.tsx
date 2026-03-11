"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortfolio } from "@/services/portfolio-service";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"] as const;

interface CreatePortfolioModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function CreatePortfolioModal({
  open,
  onOpenChange,
}: CreatePortfolioModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("USD");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast("Portfolio created successfully!");
      resetAndClose();
    },
    onError: (error: Error) => {
      toast(error.message || "Failed to create portfolio.", "error");
    },
  });

  function resetAndClose() {
    setName("");
    setDescription("");
    setBaseCurrency("USD");
    onOpenChange(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      baseCurrency,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
          <DialogDescription>
            Add a new portfolio to track your investments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Portfolio Name */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-name">
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="portfolio-name"
              placeholder="My Portfolio"
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-description">Description</Label>
            <textarea
              id="portfolio-description"
              className="stoxly-input min-h-[80px] resize-none py-2"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Base Currency */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-currency">Base Currency</Label>
            <Select
              value={baseCurrency}
              onValueChange={setBaseCurrency}
              disabled={isPending}
            >
              <SelectTrigger id="portfolio-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={resetAndClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create Portfolio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
