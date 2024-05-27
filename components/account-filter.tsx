"use client";
import qs from "query-string";
import {
  usePathname,
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useGetAccounts } from "@/features/accounts/api";
import useGetSummary from "@/features/summary/api/use-get-summary";
type Props = {};
const AccountFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const accountId = params.get("accountId") || "all";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();
  const { isLoading: isLoadingSummary } = useGetSummary();

  const onChange = (newValue: string) => {
    const query = qs.stringify(
      {
        accountId: newValue === "all" ? "" : newValue,
        from,
        to,
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(`${pathname}?${query}`);
  };

  return (
    <Select
      value={accountId}
      onValueChange={onChange}
      disabled={isLoadingAccounts || isLoadingSummary}
    >
      <SelectTrigger className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition">
        <SelectValue placeholder="Filter by account" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AccountFilter;
