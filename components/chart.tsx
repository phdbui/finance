import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart3, FileSearch, LineChart } from "lucide-react";
import AreaVariant from "@/components/area-variant";
import BarVariant from "./bar-variant";
import LineVariant from "./line-variant";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";

type Props = {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

const Chart = ({ data = [] }: Props) => {
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("area");

  const onChangeType = (type: "line" | "area" | "bar") => {
    setChartType(type);
  };
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <CardTitle className="text-xl line-clamp-1">Transactions</CardTitle>
        {/* TODO add select */}
        <Select defaultValue={chartType} onValueChange={onChangeType}>
          <SelectTrigger className="lg:w-auto h-9 rounded-md">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="area">
              <div className="flex items-center">
                <AreaChart className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">Area Chart</p>
              </div>
            </SelectItem>
            <SelectItem value="bar">
              <div className="flex items-center">
                <BarChart3 className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">Bar Chart</p>
              </div>
            </SelectItem>
            <SelectItem value="line">
              <div className="flex items-center">
                <LineChart className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">Line Chart</p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No data for this period
            </p>
          </div>
        ) : (
          <>
            {chartType === "area" && <AreaVariant data={data} />}
            {chartType === "bar" && <BarVariant data={data} />}
            {chartType === "line" && <LineVariant data={data} />}
          </>
          // chartType === "bar" && <BarVariant data={data} />
          // <BarVariant data={data} />
          // <LineVariant data={data} />
        )}
      </CardContent>
    </Card>
  );
};

export default Chart;
