import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$delete"]
>;

export const useDeleteAccount = (id?: string) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.accounts[":id"]["$delete"]({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("Failed to remove account");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account deleted");
    },
    onError: () => {
      toast.error("Failed to remove account");
    },
  });
  return deleteMutation;
};

export default useDeleteAccount;
