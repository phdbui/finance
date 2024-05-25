import { useOpenCategory } from "@/features/categories/hooks";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOpenTransaction } from "@/features/transactions/hooks";

type Props = {
  id: string;
  category?: string | null;
  categoryId?: string | null;
};

export const CategoryColumn = ({ id, category, categoryId }: Props) => {
  const { onOpen: onOpenCategory } = useOpenCategory();
  const { onOpen: onOpenTransaction } = useOpenTransaction();
  const onClick = () => {
    if (categoryId) {
      onOpenCategory(categoryId);
    } else {
      onOpenTransaction(id);
    }
  };
  return (
    <div
      className={cn(
        "flex items-center cursor-pointer hover:underline",
        !categoryId && "text-rose-500"
      )}
      onClick={onClick}
    >
      {!categoryId && <TriangleAlert className="mr-2 h-4 w-4" />}
      {category || "No category"}
    </div>
  );
};
