import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

const useGetCategories = () => {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await client.api.categories.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      const { data } = await res.json();

      return data;
    },
  });
  return query;
};

export default useGetCategories;
