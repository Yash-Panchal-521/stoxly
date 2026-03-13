"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPortfolio,
  createSimulationPortfolio,
} from "@/services/portfolio-service";
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

type PortfolioTypeOption = "SIMULATION" | "TRACKING";

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
  const [portfolioType, setPortfolioType] =
    useState<PortfolioTypeOption>("SIMULATION");
  const [startingCash, setStartingCash] = useState("100000");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      type: PortfolioTypeOption;
      name: string;
      description?: string;
      baseCurrency: string;
      startingCash?: number;
    }) => {
      if (data.type === "SIMULATION") {
        return createSimulationPortfolio({
          name: data.name,
          description: data.description,
          startingCash: data.startingCash!,
        });
      }
      return createPortfolio({
        name: data.name,
        description: data.description,
        baseCurrency: data.baseCurrency,
      });
    },
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
    setPortfolioType("SIMULATION");
    setStartingCash("100000");
    onOpenChange(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (portfolioType === "SIMULATION") {
      const cash = Number.parseFloat(startingCash);
      if (Number.isNaN(cash) || cash <= 0) {
        toast("Starting cash must be greater than zero.", "error");
        return;
      }
      if (cash > 10_000_000) {
        toast("Starting cash cannot exceed $10,000,000.", "error");
        return;
      }
      mutate({
        type: "SIMULATION",
        name: name.trim(),
        description: description.trim() || undefined,
        baseCurrency,
        startingCash: cash,
      });
    } else {
      mutate({
        type: "TRACKING",
        name: name.trim(),
        description: description.trim() || undefined,
        baseCurrency,
      });
    }
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
          {/* Portfolio Type */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-type">Portfolio Type</Label>
            <Select
              value={portfolioType}
              onValueChange={(v) => setPortfolioType(v as PortfolioTypeOption)}
              disabled={isPending}
            >
              <SelectTrigger id="portfolio-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIMULATION">Simulation</SelectItem>
                <SelectItem value="TRACKING">Tracking</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {/* Starting Cash — only for Simulation */}
          {portfolioType === "SIMULATION" && (
            <div className="space-y-2">
              <Label htmlFor="portfolio-starting-cash">
                Starting Cash (USD) <span className="text-danger">*</span>
              </Label>
              <Input
                id="portfolio-starting-cash"
                type="number"
                min="0.01"
                max="10000000"
                step="0.01"
                placeholder="100000"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                disabled={isPending}
              />
            </div>
          )}

          {/* Base Currency — only for Tracking */}
          {portfolioType === "TRACKING" && (
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
          )}

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
