import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Table } from "@tanstack/react-table";

type Props<TData> = {
  table: Table<TData>;
  onSearch?: (value?: string) => void;
  placeholder?: string;
};

export function DataTableSearchInput<TData>({
  placeholder = "Search...",
  onSearch,
  table,
}: Props<TData>) {
  return (
    <InputGroup className="min-w-0 max-w-smh-8 w-40 lg:w-56">
      <InputGroupInput
        id="search"
        placeholder={placeholder}
        value={table.getState().globalFilter ?? ""}
        onChange={(event) => {
          table.options.onGlobalFilterChange?.(event.target.value);
          onSearch?.(event.target.value);
        }}
        className="max-w-sm"
      />
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
    </InputGroup>
  );
}
