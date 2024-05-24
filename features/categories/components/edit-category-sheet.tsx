import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  CategoryForm,
  FormValues,
} from "@/features/categories/components/category-form";
import {
  useEditCategory,
  useGetCategory,
  useDeleteCategory,
} from "@/features/categories/api";
// import useGetcategory from "@/features/categorys/api/use-get-category";
// import useDeletecategory from "@/features/categorys/api/use-delete-category";
import { useOpenCategory } from "@/features/categories/hooks";
import { useConfirm } from "@/hooks/use-confirm";
import { Loader2 } from "lucide-react";

export const EditCategorySheet = () => {
  const { isOpen, onClose, id } = useOpenCategory();
  const categoryQuery = useGetCategory(id);
  const mutation = useEditCategory(id);
  const deleteMutation = useDeleteCategory(id);
  const [ConfirmationDialog, confirm] = useConfirm(
    "Delete category",
    "Are you sure you want to delete this category?"
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
  const isLoading = categoryQuery.isLoading;
  const isPending = mutation.isPending || deleteMutation.isPending;
  const defaultValues = categoryQuery.data
    ? {
        name: categoryQuery.data.name,
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
            <SheetTitle>Edit category</SheetTitle>
            <SheetDescription>Edit the name of the category</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin size-6 text-slate-600" />
            </div>
          ) : (
            <CategoryForm
              id={id}
              onSubmit={onSubmit}
              onDelete={onDelete}
              defaultValues={defaultValues}
              disabled={isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
