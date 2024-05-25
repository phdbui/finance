import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// transaction hook
import {
  TransactionForm,
  FormValues,
} from "@/features/transactions/components/transaction-form";
import { useNewTransaction } from "@/features/transactions/hooks";
import { useCreateTransaction } from "@/features/transactions/api";

export const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransaction();
  const mutation = useCreateTransaction();
  const onSubmit = (formValues: FormValues) => {
    mutation.mutate(formValues, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>
            Create a new transaction to organize your transactions
          </SheetDescription>
        </SheetHeader>
        <TransactionForm
          onSubmit={onSubmit}
          defaultValues={{ name: "" }}
          disabled={mutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
};
