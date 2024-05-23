"use client";

import { Button } from "@/components/ui/button";
import useGetAccounts from "@/features/accounts/api/use-get-accounts";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

export default function Home() {
  const { onOpen } = useNewAccount();
  // const { data: accounts, isLoading } = useGetAccounts();

  // if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <Button variant="outline" color="primary" onClick={onOpen}>
        New account
      </Button>
    </div>
  );
}
