// src/pages/Inventory/WarehouseByItems.js
import React, { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Button, Input, Collapse, Table, Badge
} from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WarehouseByItems = () => {
  document.title = "Warehouse By Items | PNP";
  const apipost = new APIClient();
  const fmt = (n) => Number(n || 0).toLocaleString();

  const [rows, setRows] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10,20,50,100,"all"
  const [totalRecords, setTotalRecords] = useState(0);

  // load data
  const load = async (page = currentPage, limit = pageSize) => {
    try {
debugger; 
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const r = await apipost.post(`/products/warehouseitems`, {
        page,
        limit: limit === "all" ? 0 : limit, // backend handles 0 = all
        search,
        status: statusFilter,
        uid: obj.id

      });

      setRows(r?.warehouses || []);
      setTotalRecords(r?.totalRecords || 0);
    } catch {
      toast.error("Error loading warehouses");
    }
  };

  useEffect(() => {
    load(1, pageSize);
  }, [search, statusFilter, pageSize]);

  useEffect(() => {
    load(currentPage, pageSize);
  }, [currentPage]);

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-content print-container">
      <Container fluid>
        {/* Header (hidden on print) */}
        <Row className="align-items-center mb-3 print-hide">
          <Col>
            <h2>Warehouse By Items</h2>
            <p className="text-muted">Grouped list of warehouses with their items</p>
          </Col>
          <Col className="text-end">
            <Button color="secondary" onClick={handlePrint}>
              <i className="ri-printer-line me-1" /> Print
            </Button>
          </Col>
        </Row>

        {/* Print Title - only visible in print */}
        <Row className="d-none d-print-block">
          <Col>
            <br /><br />
            <h3 className="report-title text-center mb-4">
              Warehouse By Items Report
            </h3>
          </Col>
        </Row>

        {/* Filter Card (hidden on print) */}
        <Card className="mb-4 print-hide">
          <CardHeader
            className="d-flex justify-content-between align-items-center"
            onClick={() => setFilterOpen(!filterOpen)}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-semibold">Filters</span>
            <i
              className={filterOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}
            ></i>
          </CardHeader>
          <Collapse isOpen={filterOpen}>
            <CardBody>
              <Row className="g-3">
                <Col md={4}>
                  <Input
                    placeholder="Search warehouse / product / serial"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SHIPPED">Shipped</option>
                  </Input>
                </Col>
              </Row>
            </CardBody>
          </Collapse>
        </Card>

        {/* Table grouped by warehouse with subtables of items */}
        <Card>
          <CardBody>
            <Table bordered hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>Created At</th>
                  <th className="text-center">Total Items</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((w, idx) => (
                    <React.Fragment key={w.id}>
                      <tr>
                        <td>{(currentPage - 1) * (pageSize === "all" ? rows.length : pageSize) + idx + 1}</td>
                        <td>{w.name}</td>
                        <td>{w.location}</td>
                        <td>{w.created_at}</td>
                        <td className="text-center">{fmt(w.items?.length || 0)}</td>
                      </tr>
                      {w.items && w.items.length > 0 && (
                        <tr>
                          <td></td>
                          <td colSpan={4}>
                            <Table bordered size="sm" className="mb-0">
                              <thead>
                                <tr className="table-secondary">
                                  <th style={{ width: "80px" }}>Item ID</th>
                                  <th>Serial</th>
                                  <th>Status</th>
                                  <th>Product</th>
                                  <th>Category</th>
                                  <th>Last Update</th>
                                </tr>
                              </thead>
                              <tbody>
                                {w.items.map((it) => (
                                  <tr key={it.id}>
                                    <td>{it.id}</td>
                                    <td>{it.serial}</td>
                                    <td>
                                      <Badge
                                        color={
                                          it.status === "IN_STOCK"
                                            ? "success"
                                            : it.status === "RESERVED"
                                            ? "warning"
                                            : "secondary"
                                        }
                                      >
                                        {it.status}
                                      </Badge>
                                    </td>
                                    <td>{it.product_name}</td>
                                    <td>{it.product_category}</td>
                                    <td>{it.updated_at}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No warehouses found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination controls (hidden on print, hidden if "All") */}
            {pageSize !== "all" && (
              <div className="d-flex justify-content-between align-items-center mt-3 print-hide">
                <div>
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                </div>
                <div className="d-flex align-items-center">
                  <Input
                    type="select"
                    value={pageSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "all") {
                        setPageSize("all");
                        setCurrentPage(1);
                        load(1, "all");
                      } else {
                        const num = Number(val);
                        setPageSize(num);
                        setCurrentPage(1);
                        load(1, num);
                      }
                    }}
                    className="me-2"
                    style={{ width: "auto" }}
                  >
                    <option value={10}>10 rows</option>
                    <option value={20}>20 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                    <option value="all">All</option>
                  </Input>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      { length: Math.ceil(totalRecords / pageSize) },
                      (_, i) => i + 1
                    ).map((n) => (
                      <li
                        key={n}
                        className={`page-item ${currentPage === n ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(n)}>
                          {n}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === Math.ceil(totalRecords / pageSize) ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(Math.ceil(totalRecords / pageSize), p + 1))
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default WarehouseByItems;
