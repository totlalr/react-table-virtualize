import TableExample from "./components/Table";
import VirtualExample from "./components/Virtual/index";
import React, { useEffect, useState } from "react";
import NewTable from "./components/NewTable/index";
import Sorting from "./components/Sorting/index";
import InfinitiveScroll from "./components/InfinitiveScroll/index";
import { makeData, Person } from "./components/Virtual/makeData";
import { SortingState } from "@tanstack/react-table";
import { useInfiniteQuery } from "react-query";
import {
  fetchData,
  PersonApiResponse,
} from "./components/InfinitiveScroll/makeData";

const fetchSize = 50;

function App() {
  //Hooks
  const [data, setData] = React.useState([]);
  const [dataPagination, setDataPagination] = React.useState([]);
  const [mode, setmode] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [titleHeaderForTable, setTitleHeaderForTable] = useState([]);

  //Watcher
  React.useEffect(() => {
    const result = makeData(20000);
    setData(result);

    const resultForPagination = makeData(5000);
    setDataPagination(resultForPagination);
  }, []);

  //API
  const {
    data: dataForInfinitiveScroll,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery<PersonApiResponse>(
    ["table-data", sorting],
    async ({ pageParam = 0 }) => {
      const start = pageParam * fetchSize;
      const fetchedData = fetchData(start, fetchSize, sorting);
      return fetchedData;
    },
    {
      getNextPageParam: (_lastGroup, groups) => groups.length,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!isLoading) {
      const resultTitleForTableHeader = Object.keys(
        dataForInfinitiveScroll?.pages[0]?.data[0]
      );

      setTitleHeaderForTable(resultTitleForTableHeader);
    }
  }, [isLoading]);

  return (
    <div className="App">
      {/* <TableExample /> */}
      {/* <VirtualExample /> */}
      {/* <button
        style={{ marginBottom: "25px" }}
        onClick={() => setmode((mode) => !mode)}
      >
        change
      </button> */}
      <NewTable
        kindofTable={"infinitiveScroll"}
        data={data || []}
        setData={setData}
        dataPagination={dataPagination}
        dataForInfinitiveScroll={dataForInfinitiveScroll}
        fetchNextPage={fetchNextPage}
        isFetching={isFetching}
        setSorting={setSorting}
        sorting={sorting}
        isLoading={isLoading}
        titleHeaderForTable={titleHeaderForTable}
      />

      {/* <Sorting /> */}

      {/* <InfinitiveScroll /> */}
    </div>
  );
}

export default App;
