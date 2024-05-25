import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  TransactionForm,
  FormValues,
} from "@/features/transactions/components/transaction-form";
import {
  useEditTransaction,
  useGetTransaction,
  useDeleteTransaction,
} from "@/features/transactions/api";
import { useOpenTransaction } from "@/features/transactions/hooks";
import { useConfirm } from "@/hooks/use-confirm";
import { Loader2 } from "lucide-react";

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction();
  const transactionQuery = useGetTransaction(id);
  const mutation = useEditTransaction(id);
  const deleteMutation = useDeleteTransaction(id);
  const [ConfirmationDialog, confirm] = useConfirm(
    "Delete transaction",
    "Are you sure you want to delete this transaction?"
  );
  const onSubmit = (formValues: FormValues) => {
    mutation.mutate(formValues, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  const isLoading = transactionQuery.isLoading;
  const isPending = mutation.isPending || deleteMutation.isPending;
  const defaultValues = transactionQuery.data
    ? {
        name: transactionQuery.data.name,
      }
    : {
        name: "",
      };

  return (
    <>
      <ConfirmationDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit transaction</SheetTitle>
            <SheetDescription>
              Edit the name of the transaction
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin size-6 text-slate-600" />
            </div>
          ) : (
            <>Transaction form</>
            // TODO: add transaction form
            // <TransactionForm
            //   id={id}
            //   onSubmit={onSubmit}
            //   onDelete={onDelete}
            //   defaultValues={defaultValues}
            //   disabled={isPending}
            // />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
