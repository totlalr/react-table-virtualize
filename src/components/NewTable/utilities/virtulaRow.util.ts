import { useVirtual } from "@tanstack/react-virtual";

interface VirtualRowProps {
  table: any;
  tableContainerRef: any;
}

function VirtualRow({ table, tableContainerRef }: VirtualRowProps) {
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    overscan: 10,
  });

  const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return {
    rows: rows,
    paddingBottom: paddingBottom,
    paddingTop: paddingTop,
    virtualRows: virtualRows,
  };
}

export default VirtualRow;
