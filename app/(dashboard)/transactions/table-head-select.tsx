import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
type Props = {
  columnIndex: number;
  selectedColumns: Record<string, string | null>;
  onChange: (columnIndex: number, value: string | null) => void;
};
const options = ["amount", "payee", "date"];
const TableHeadSelect = ({ columnIndex, selectedColumns, onChange }: Props) => {
  const currentSelect = selectedColumns[`column_${columnIndex}`];
  return (
    <Select
      value={currentSelect || ""}
      onValueChange={(value) => onChange(columnIndex, value)}
    >
      <SelectTrigger
        className={cn(
          "focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize",
          currentSelect && "text-blue-500"
        )}
      >
        <SelectValue placeholder="Skip" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="skip">Skip</SelectItem>
        {options.map((option) => {
          const isDisabled =
            Object.values(selectedColumns).includes(option) &&
            currentSelect !== option;
          return (
            <SelectItem
              key={option}
              value={option}
              className="capitalize"
              disabled={isDisabled}
            >
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default TableHeadSelect;
