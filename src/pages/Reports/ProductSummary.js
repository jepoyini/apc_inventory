// src/pages/Inventory/ProductSummary.jsx
import React, { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Button, Input, Collapse, Table, Badge
} from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../config";

const ProductSummary = () => {
  document.title = "Product Summary | PNP";
  const apipost = new APIClient();
  const fmt = (n) => Number(n || 0).toLocaleString();

  const [rows, setRows] = useState([]);
  const [filterOpen, setFilterOpen] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10,20,50,100,"all"
  const [totalRecords, setTotalRecords] = useState(0);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };
    // inside load()
    const load = async (page = currentPage, limit = pageSize) => {
        debugger; 
    try {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const r = await apipost.post(`/products/productsummary`, {
        page,
        limit: limit === "all" ? 0 : limit, // backend handles 0 = all
        search,            // ✅ pass search to backend
        status: statusFilter,
        category: categoryFilter,
        uid: obj.id
        });

        setRows(r?.products || []);
        setTotalRecords(r?.totalRecords || 0);
    } catch {
        toast.error("Error loading products");
    }
    };

  const load1 = async (page = currentPage, limit = pageSize) => {
    try {
        debugger; 
      const r = await apipost.post(`/products/productsummary`, {
        page,
        limit: limit === "all" ? 0 : limit, // backend handles 0 = all
      });
      let data = r?.products || [];

    //   if (search) {
    //     data = data.filter(
    //       (x) =>
    //         x.name.toLowerCase().includes(search.toLowerCase()) ||
    //         x.category.toLowerCase().includes(search.toLowerCase()) ||
    //         x.sku?.toLowerCase().includes(search.toLowerCase())
    //     );
    //   }
    //   if (statusFilter) {
    //     data = data.filter((x) => x.status === statusFilter);
    //   }
    //   if (categoryFilter) {
    //     data = data.filter((x) => x.category === categoryFilter);
    //   }

      setRows(data);
      setTotalRecords(r?.totalRecords || 0);
    } catch {
      toast.error("Error loading products");
    }
  };

  useEffect(() => {
    load(1, pageSize);
  }, [search, statusFilter, categoryFilter, pageSize]);

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
            <h2>Product Summary</h2>
            <p className="text-muted">All products with their items</p>
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
          <br></br><br></br>
            <h3 className="report-title text-center mb-4">
              Product Summary Report
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
                    placeholder="Search name / category / SKU"
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
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </Input>
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Plaques">Plaques</option>
                    <option value="Trophies">Trophies</option>
                    <option value="Signage">Signage</option>
                  </Input>
                </Col>
              </Row>
            </CardBody>
          </Collapse>
        </Card>

        {/* Table with subtables */}
        <Card>
          <CardBody>
            <Table bordered hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Available</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((p, idx) => (
                    <React.Fragment key={p.id}>
                      <tr>
                        <td>{(currentPage - 1) * (pageSize === "all" ? rows.length : pageSize) + idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={prefixUrl(p.primary_image)}
                              alt={p.name}
                              width="50"
                              height="40"
                              className="me-2 rounded"
                            />
                            {p.name}
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <Badge color={p.status === "active" ? "success" : "secondary"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="text-center">{fmt(p.total_qty)}</td>
                        <td className="text-center">{fmt(p.available_qty)}</td>
                        <td>₱{Number(p.warehouse_price || 0).toFixed(2)}</td>
                      </tr>
                      {p.items && p.items.length > 0 && (
                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <Table bordered size="sm" className="mb-0">
                              <thead>
                                <tr className="table-secondary">
                                  <th style={{ width: "80px" }}>Item ID</th>
                                  <th>Serial</th>
                                  <th>Status</th>
                                  <th>Warehouse</th>
                                  <th>Last Update</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.items.map((it) => (
                                  <tr key={it.id}>
                                    <td>{it.id}</td>
                                    <td>{it.serial}</td>
                                    <td>{it.status}</td>
                                    <td>{it.warehouse_name}</td>
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
                    <td colSpan={7} className="text-center text-muted">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination controls (hidden on print, and hidden if "All") */}
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

export default ProductSummary;
