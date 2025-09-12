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

const getVisiblePages = (currentPage, totalPages, maxVisible = 7) => {
  const pages = [];
  const half = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  // Shift window if too close to edges
  if (currentPage <= half) {
    start = 2;
    end = Math.min(totalPages - 1, maxVisible);
  } else if (currentPage + half >= totalPages) {
    start = Math.max(2, totalPages - maxVisible + 1);
    end = totalPages - 1;
  }

  // Add left ellipsis if needed
  if (start > 2) {
    pages.push("...");
  }

  // Add range of pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add right ellipsis if needed
  if (end < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};


  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <Fragment>

      {/* Pagination + PageSize (bottom only) */}
      <Row className="align-items-center mt-2 g-3 text-center text-sm-start">

        {/* Showing */}
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

        {/* Paging */}
        <div className="col-sm-auto">
          <ul className="pagination pagination-separated pagination-md mb-0 flex-wrap justify-content-center overflow-auto">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link
                to="#"
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Link>
            </li>

            {getVisiblePages(currentPage, totalPages, window.innerWidth < 576 ? 3 : window.innerWidth < 768 ? 5 : 7)
              .map((item, idx) => (
                <li key={idx} className="page-item">
                  {item === "..." ? (
                    <span className="page-link">…</span>
                  ) : (
                    <Link
                      to="#"
                      className={`page-link ${currentPage === item ? "active" : ""}`}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </Link>
                  )}
                </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link
                to="#"
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
              >
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

        {/* Showing */}
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

        {/* Paging */}
        <div className="col-sm-auto">
          <ul className="pagination pagination-separated pagination-md mb-0 flex-wrap justify-content-center overflow-auto">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link
                to="#"
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Link>
            </li>

            {getVisiblePages(currentPage, totalPages, window.innerWidth < 576 ? 3 : window.innerWidth < 768 ? 5 : 7)
              .map((item, idx) => (
                <li key={idx} className="page-item">
                  {item === "..." ? (
                    <span className="page-link">…</span>
                  ) : (
                    <Link
                      to="#"
                      className={`page-link ${currentPage === item ? "active" : ""}`}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </Link>
                  )}
                </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link
                to="#"
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
              >
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
