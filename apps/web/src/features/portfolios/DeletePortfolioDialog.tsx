"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deletePortfolio } from "@/services/portfolio-service";
import { useToast } from "@/hooks/use-toast";

interface DeletePortfolioDialogProps {
  readonly portfolioId: string;
  readonly portfolioName: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly redirectTo?: string;
}

export default function DeletePortfolioDialog({
  portfolioId,
  portfolioName,
  open,
  onOpenChange,
  redirectTo = "/dashboard",
}: DeletePortfolioDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () => deletePortfolio(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast("Portfolio deleted successfully", "success");
      onOpenChange(false);
      router.push(redirectTo);
    },
    onError: () => {
      toast("Failed to delete portfolio", "error");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Portfolio</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-text-primary">
              {portfolioName}
            </span>{" "}
            ? This action cannot be undone.
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
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
