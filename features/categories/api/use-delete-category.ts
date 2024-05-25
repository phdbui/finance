import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"]
>;

const useDeleteCategory = (id?: string) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.categories[":id"]["$delete"]({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("Failed to remove category");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", { id }] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Category deleted");
    },
    onError: () => {
      toast.error("Failed to remove category");
    },
  });
  return deleteMutation;
};

export default useDeleteCategory;
