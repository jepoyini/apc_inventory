import React, { Fragment, useEffect, useState } from "react";
import { Row, Table, Spinner, Input } from "reactstrap";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";

const Filter = ({ column }) => {
  const columnFilterValue = column.getFilterValue();
  return (
    <input
      type="text"
      value={columnFilterValue ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder="Search..."
      className="form-control form-control-sm"
    />
  );
};

const TableContainer = ({
  columns,
  data,
  loading = false,
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  customPageSize,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,
}) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: { fuzzy: fuzzyFilter },
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = table;

  useEffect(() => {
    if (customPageSize) table.setPageSize(customPageSize);
  }, [customPageSize, table]);

  const getVisiblePages = (pageIndex, pageCount, maxVisible = 10) => {
    const pages = [];
    if (pageCount <= maxVisible) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
    } else {
      const left = Math.max(0, pageIndex - Math.floor(maxVisible / 2));
      const right = Math.min(pageCount, left + maxVisible);
      const adjustedLeft = Math.max(0, right - maxVisible);

      if (adjustedLeft > 0) pages.push(0, "start-ellipsis");
      for (let i = adjustedLeft; i < right; i++) pages.push(i);
      if (right < pageCount) pages.push("end-ellipsis", pageCount - 1);
    }
    return pages;
  };

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <Fragment>

      {/* Pagination + PageSize (bottom only) */}
      <Row className="align-items-center mt-2 g-3 text-center text-sm-start">
        <div className="col-sm d-flex align-items-center gap-3">
          <Input
            type="select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            style={{ width: "auto", minWidth: "120px" }}
            className="form-select"
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </Input>

          <div className="text-muted">
            Showing{" "}
            <span className="fw-semibold">
              {startRecord}-{endRecord}
            </span>{" "}
            of <span className="fw-semibold">{totalRecords}</span> Results
          </div>
        </div>

        <div className="col-sm-auto">
          <ul className="pagination pagination-separated pagination-md mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link to="#" className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                Previous
              </Link>
            </li>

            {getVisiblePages(currentPage - 1, totalPages, 10).map((item, idx) => (
              <li key={idx} className="page-item">
                {item === "start-ellipsis" || item === "end-ellipsis" ? (
                  <span className="page-link">...</span>
                ) : (
                  <Link
                    to="#"
                    className={`page-link ${currentPage === item + 1 ? "active" : ""}`}
                    onClick={() => onPageChange(item + 1)}
                  >
                    {item + 1}
                  </Link>
                )}
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link to="#" className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                Next
              </Link>
            </li>
          </ul>
        </div>
      </Row>
      <br></br>

      <div className={divClass}>
        <Table hover className={tableClass}>
          <thead className={theadClass}>
            {getHeaderGroups().map((headerGroup) => (
              <tr className={trClass} key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={thClass}
                    {...{ onClick: header.column.getToggleSortingHandler() }}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanFilter() && (
                          <div>
                            <Filter column={header.column} />
                          </div>
                        )}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5">
                  <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
                </td>
              </tr>
            ) : getRowModel().rows.length > 0 ? (
              getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-3 text-muted">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination + PageSize (bottom only) */}
      <Row className="align-items-center mt-2 g-3 text-center text-sm-start">
        <div className="col-sm d-flex align-items-center gap-3">
          <Input
            type="select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            style={{ width: "auto", minWidth: "120px" }}
            className="form-select"
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </Input>

          <div className="text-muted">
            Showing{" "}
            <span className="fw-semibold">
              {startRecord}-{endRecord}
            </span>{" "}
            of <span className="fw-semibold">{totalRecords}</span> Results
          </div>
        </div>

        <div className="col-sm-auto">
          <ul className="pagination pagination-separated pagination-md mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link to="#" className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                Previous
              </Link>
            </li>

            {getVisiblePages(currentPage - 1, totalPages, 10).map((item, idx) => (
              <li key={idx} className="page-item">
                {item === "start-ellipsis" || item === "end-ellipsis" ? (
                  <span className="page-link">...</span>
                ) : (
                  <Link
                    to="#"
                    className={`page-link ${currentPage === item + 1 ? "active" : ""}`}
                    onClick={() => onPageChange(item + 1)}
                  >
                    {item + 1}
                  </Link>
                )}
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link to="#" className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                Next
              </Link>
            </li>
          </ul>
        </div>
      </Row>

    </Fragment>
  );
};

export default TableContainer;
