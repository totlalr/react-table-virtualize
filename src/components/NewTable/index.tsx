  import React, { useEffect, useMemo, useState } from "react";
  import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnSort,
  } from "@tanstack/react-table";
  import { useVirtual } from "@tanstack/react-virtual";
  import { makeData, Person } from "../Virtual/makeData";

interface NewTableProps {
  kindofTable?: "virtulize" | "pagination" | "infinitiveScroll";
  data: Person[];
  setData: any;
  dataPagination?: Person[];
  dataForInfinitiveScroll?: any;
  isFetching?: any;
  fetchNextPage?: any;
  sorting?: ColumnSort[];
  setSorting?: any;
  isLoading?: boolean;
  titleHeaderForTable?: string[];
}

function NewTable({
  kindofTable,
  data,
  setData,
  dataPagination,
  dataForInfinitiveScroll,
  isFetching,
  fetchNextPage,
  sorting,
  setSorting,
  isLoading,
  titleHeaderForTable,
}: NewTableProps) {
  const rerender = React.useReducer(() => ({}), {})[1];
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const refreshData = () => setData(() => makeData(1000));

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 60,
      },
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        size: 50,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        size: 80,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => info.getValue<Date>()?.toLocaleString(),
      },
    ],
    []
  );

  console.log("columns", columns);
  const flatData = React.useMemo(
    () =>
      dataForInfinitiveScroll?.pages
        ?.map((page: any) => page?.data)
        .reduce((acc: any, val: any) => acc.concat(val), []) ?? [],
    [dataForInfinitiveScroll]
  );

  const totalDBRowCount =
    dataForInfinitiveScroll?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData?.length;

  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data:
      kindofTable === "virtulize"
        ? data
        : kindofTable === "infinitiveScroll"
        ? flatData
        : dataPagination,
    columns,
    state: {
      sorting,
    },

    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel:
      kindofTable === "pagination" ? getPaginationRowModel() : () => undefined,
    debugTable: true,
  });

  // const { paddingBottom, paddingTop, rows, virtualRows } =
  //   kindofTable != "pagination"
  //     ? VirtualRow({
  //         table,
  //         tableContainerRef,
  //       })
  //     : { paddingBottom: 0, paddingTop: 0, rows: {}, virtualRows: [] };

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

  return (
    <div className="p-2">
      <div className="h-2" />
      <div
        ref={tableContainerRef}
        className="container"
        onScroll={(e) => {
          return kindofTable === "infinitiveScroll"
            ? fetchMoreOnBottomReached(e.target as HTMLDivElement)
            : undefined;
        }}
        style={
          kindofTable === "virtulize" || kindofTable === "infinitiveScroll"
            ? {
                border: "1px solid lightgray",
                height: "500px",
                maxWidth: "900px !important",
                overflow: "auto",
              }
            : { height: "auto" }
        }
      >
        <table
          {...table.getPaginationRowModel}
          style={
            kindofTable === "virtulize" || kindofTable === "infinitiveScroll"
              ? {
                  borderCollapse: "collapse",
                  borderSpacing: 0,
                  fontFamily: "arial, sans-serif",
                  tableLayout: "fixed",
                  width: "100%",
                }
              : { border: "1px solid lightgray" }
          }
        >
          <thead
            style={
              kindofTable === "virtulize" || kindofTable === "infinitiveScroll"
                ? {
                    background: "lightgray",
                    margin: 0,
                    position: "sticky",
                    top: 0,
                  }
                : {
                    margin: 0,
                    position: "sticky",
                    top: 0,
                  }
            }
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      style={
                        kindofTable === "virtulize"
                          ? {
                              borderBottom: "1px solid lightgray",
                              borderRight: "1px solid lightgray",
                              padding: "2px 4px",
                              textAlign: "left",
                            }
                          : {
                              borderBottom: "1px solid lightgray",
                              borderRight: "1px solid lightgray",
                              padding: "2px 4px",
                            }
                      }
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          {(kindofTable === "virtulize" ||
            kindofTable === "infinitiveScroll") && (
            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td
                    style={{
                      height: `${paddingTop}px`,
                    }}
                  />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<Person>;
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td style={{ padding: "6px" }} key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </tbody>
          )}

          {kindofTable === "pagination" && (
            <tbody style={{ borderBottom: "1px solid lightgray" }}>
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id} style={{ textAlign: "center" }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      {isLoading && <h1>....loading</h1>}
      <div>{table.getRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
      <div className="h-2" />

      {kindofTable === "pagination" && (
        <div className="flex items-center gap-2">
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span
            className="flex items-center gap-1"
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div>Page : </div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      )}

      {kindofTable === "infinitiveScroll" && (
        <div>
          Fetched {flatData.length} of {totalDBRowCount} Rows.
        </div>
      )}
    </div>
  );
}

export default NewTable;
