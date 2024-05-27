"use client";
// icons
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import qs from "query-string";

import useGetSummary from "@/features/summary/api/use-get-summary";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { formatDateRange } from "@/lib/utils";
import { Calendar } from "./ui/calendar";

const DateFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const accountId = params.get("accountId") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);
  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  };

  const [date, setDate] = useState<DateRange | undefined>(paramState);
  const {} = useGetSummary();
  const pushToUrl = (rangeDate?: DateRange | undefined) => {
    const query = {
      from: format(rangeDate?.from || defaultFrom, "yyyy-MM-dd"),
      to: format(rangeDate?.to || defaultTo, "yyyy-MM-dd"),
      accountId: accountId,
    };
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false}
          size="sm"
          variant="outline"
          className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
        >
          <span>{formatDateRange(paramState)}</span>
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="lg:w-auto w-full p-0" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <div className="p-4 w-full flex items-center gap-x-2 ">
          <PopoverClose asChild>
            <Button
              disabled={!date?.from || !date?.to}
              onClick={onReset}
              className="w-full"
              variant="outline"
            >
              Reset
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              disabled={!date?.from || !date?.to}
              onClick={() => pushToUrl(date)}
              className="w-full"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilter;
