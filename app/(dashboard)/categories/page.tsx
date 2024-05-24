"use client";
// icons
import { Loader2, Plus } from "lucide-react";

// categories hooks
import { useNewCategory } from "@/features/categories/hooks";
// categories api
import { useGetCategories, useBulkDeleteCategories } from "@/features/categories/api";

// components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

const CategoriesPage = () => {
  const newCategory = useNewCategory();
  const deleteCategory = useBulkDeleteCategories();
  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data || [];

  const isDisabled = deleteCategory.isPending || categoriesQuery.isLoading;
  if (categoriesQuery.isLoading)
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Categories page
          </CardTitle>
          <Button size={"sm"} onClick={newCategory.onOpen}>
            <Plus className="mr-2 size-4" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories}
            filterKey="name"
            disabled={isDisabled}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteCategory.mutate({ ids });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;
