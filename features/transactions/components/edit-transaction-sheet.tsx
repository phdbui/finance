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
  ApiValues,
} from "@/features/transactions/components/transaction-form";
import {
  useEditTransaction,
  useGetTransaction,
  useDeleteTransaction,
} from "@/features/transactions/api";
import { useOpenTransaction } from "@/features/transactions/hooks";
import { useConfirm } from "@/hooks/use-confirm";
import { Loader2 } from "lucide-react";
import { useCreateCategory, useGetCategories } from "@/features/categories/api";
import { useCreateAccount, useGetAccounts } from "@/features/accounts/api";

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction();

  const transactionQuery = useGetTransaction(id);
  const mutation = useEditTransaction(id);
  const deleteMutation = useDeleteTransaction(id);

  const categoriesQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const onCreateCategory = (name: string) => categoryMutation.mutate({ name });
  const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const accountsQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const onCreateAccount = (name: string) => accountMutation.mutate({ name });
  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const [ConfirmationDialog, confirm] = useConfirm(
    "Delete transaction",
    "Are you sure you want to delete this transaction?"
  );
  const onSubmit = (formValues: ApiValues) => {
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
  const isLoading =
    transactionQuery.isLoading ||
    accountsQuery.isLoading ||
    categoriesQuery.isLoading;
  const isPending =
    mutation.isPending ||
    deleteMutation.isPending ||
    transactionQuery.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;
  const defaultValues = transactionQuery.data
    ? {
        accountId: transactionQuery.data.accountId,
        categoryId: transactionQuery.data.categoryId,
        amount: transactionQuery.data.amount.toString(),
        date: transactionQuery.data.date
          ? new Date(transactionQuery.data.date)
          : new Date(),
        notes: transactionQuery.data.notes,
        payee: transactionQuery.data.payee,
      }
    : {
        accountId: "",
        amount: "",
        date: new Date(),
        payee: "",
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
            <TransactionForm
              id={id}
              onSubmit={onSubmit}
              onDelete={onDelete}
              defaultValues={defaultValues}
              disabled={isPending}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
              accountOptions={accountOptions}
              onCreateAccount={onCreateAccount}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
