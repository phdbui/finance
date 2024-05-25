import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { client } from "@/lib/hono";

const useGetTransactions = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const accountId = searchParams.get("accountId") || "";
  const query = useQuery({
    // TODO: check  params are not empty
    queryKey: ["transactions", { from, to, accountId }],
    queryFn: async () => {
      const res = await client.api.transactions.$get({
        query: { from, to, accountId },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const { data } = await res.json();

      return data;
    },
  });
  return query;
};

export default useGetTransactions;
