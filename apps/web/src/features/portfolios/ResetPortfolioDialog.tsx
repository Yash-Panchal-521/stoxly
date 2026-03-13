"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resetSimulationPortfolio } from "@/services/portfolio-service";
import { useToast } from "@/hooks/use-toast";

interface ResetPortfolioDialogProps {
  readonly portfolioId: string;
  readonly startingCash: number;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ResetPortfolioDialog({
  portfolioId,
  startingCash,
  open,
  onOpenChange,
}: ResetPortfolioDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: resetSimulationPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation", "portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", portfolioId],
      });
      toast("Portfolio reset successfully", "success");
      onOpenChange(false);
    },
    onError: () => {
      toast("Failed to reset portfolio", "error");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Simulation Portfolio</DialogTitle>
          <DialogDescription>
            This will erase all trades and restore your cash to{" "}
            <span className="font-semibold text-text-primary">
              {formatCurrency(startingCash)}
            </span>
            . This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Resetting..." : "Reset Portfolio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
