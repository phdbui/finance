import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$delete"]
>;

const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.transactions[":id"]["$delete"]({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("Failed to remove transaction");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
      toast.success("Transaction deleted");
      // TODO: invalidate summary
    },
    onError: () => {
      toast.error("Failed to remove transaction");
    },
  });
  return deleteMutation;
};

export default useDeleteTransaction;
