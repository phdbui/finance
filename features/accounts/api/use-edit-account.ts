import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.accounts)[":id"]["$patch"]
>["json"];

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.accounts[":id"]["$patch"]({
        param: { id },
        json,
      });
      if (!res.ok) {
        throw new Error("Failed to edit account");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account updated");
    },
    onError: () => {
      toast.error("Failed to edit account");
    },
  });
  return mutation;
};

export default useEditAccount;
