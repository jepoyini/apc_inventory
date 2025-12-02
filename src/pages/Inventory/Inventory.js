// ================================================================
// FILE: src/pages/Inventory/Products.jsx
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Card, CardBody, Col, Row, Container, Input, Button, Badge,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import Cookies from "js-cookie";
import CountUp from "react-countup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import ProductCard from "./ProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import AddProductDialog from "./AddProductDialog";
import QRCodeGenerator from "./QRCodeGenerator";
import { useNavigate } from "react-router-dom";

const Products = () => {
  document.title = "Products | PNP";
  const navigate = useNavigate();
  const apipost = new APIClient();
  const authUser = JSON.parse(sessionStorage.getItem("authUser") || "{}");
  const role = authUser.role;
  const isAdmin = authUser?.role === "Admin";
  
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [qrOpen, setQrOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);
  const openQr = (product) => { setQrProduct(product); setQrOpen(true); };

  // filters
  const searchRef = useRef("");
  const categoryRef = useRef("");
  const statusRef = useRef("");
  const stockRef = useRef("");
  const warehouseRef = useRef("");
  const [tagChips, setTagChips] = useState([]);
  const [tagUniverse] = useState(["Plaques", "Trophies", "Signage"]);

  // at the top of Products component
  const [filtersOpen, setFiltersOpen] = useState(true);

  // view + pageSize
  const [view, setView] = useState("grid");
  const [pageSize, setPageSize] = useState(10);

  // details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const handleViewDetails = (id) => { navigate(`/products/${id}`); };

  // add/edit product modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    sku: "", name: "", category: "", status: "active", price: "", cost: "",
    default_warehouse_id: "", reorder_point: "", brand: "", model: "", description: "", tags: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- Restore state from cookies on mount ---
  useEffect(() => {
    const saved = Cookies.get("products_state");
    if (saved) {
      debugger; 
        try {
        const parsed = JSON.parse(saved);
        searchRef.current = parsed.search || "";
        categoryRef.current = parsed.category || "";
        statusRef.current = parsed.status || "";
        stockRef.current = parsed.stock || "";
        warehouseRef.current = parsed.warehouse || "";
        setTagChips(parsed.tags || []);
        setView(parsed.view || "grid");
        setPageSize(parsed.pageSize || 10);
        setCurrentPage(parsed.currentPage || 1);
        setFiltersOpen(parsed.filtersOpen !== undefined ? parsed.filtersOpen : true); // ✅ restore
      } catch (e) {
        console.error("Failed to parse cookie state", e);
      }
    }
  }, []);
  const getStatusBadge = (status) => {
    switch (status) {
      case "CREATED": return <Badge className="created-status mw-70">CREATED</Badge>;
      case "AVAILABLE": return <Badge color="success" className="mw-70">AVAILABLE</Badge>;
      case "IN_TRANSIT": return <Badge color="info" className="mw-70">IN-TRANSIT</Badge>;
      case "IN_STOCK": return <Badge color="primary" className="mw-70">IN-STOCK</Badge>;
      case "SOLD": return <Badge color="dark" className="mw-70">SOLD</Badge>;
      case "DISPOSED": return <Badge color="danger" className="mw-70">DISPOSED</Badge>;
      case "RETURNED": return <Badge className="returned-status mw-70">RETURNED</Badge>;
      case "CHECK_IN": return <Badge className="returned-status mw-70">CHECK-IN</Badge>;
      default: return <Badge color="secondary" className="mw-70">{status}</Badge>;
    }
  };
  // --- Save state to cookies ---
  useEffect(() => {
    Cookies.set(
      "products_state",
      JSON.stringify({
        search: searchRef.current,
        category: categoryRef.current,
        status: statusRef.current,
        stock: stockRef.current,
        warehouse: warehouseRef.current,
        tags: tagChips,
        view,
        pageSize,
        currentPage,
        filtersOpen, // ✅ save
      }),
      { expires: 30 }
    );
  }, [view, pageSize, currentPage, tagChips, filtersOpen]);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const toggleView = () => setView(view === "grid" ? "list" : "grid");

  const openAdd = () => { setIsEditing(false); setEditingId(null); setCreateOpen(true); };
  const closeAdd = () => setCreateOpen(false);

  const openEdit = (row) => {
    setIsEditing(true);
    setEditingId(row.id);
    setCreateForm({ ...row });
    setCreateOpen(true);
  };

  const onDeleteProduct = async (id) => {
    try {
      await apipost.post(`/products/${id}/delete`, {});
      toast.success("Product deleted");
      load(currentPage);
    } catch { toast.error("Delete failed"); }
  };

  // ✅ accepts optional limit
  const load = async (page, limit = pageSize) => {
    setLoading(true);
    try {
      debugger; 
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const r = await apipost.post(`/products`, {
        page, limit,
        search: searchRef.current, category: categoryRef.current,
        status: statusRef.current, stockLevel: stockRef.current,
        warehouse: warehouseRef.current, tags: tagChips,
        uid: obj.id
      });
      setRows(r?.products || []);
      const total = r?.totalRecords ?? 0;
      setTotalRecords(total);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
      setSummary(r?.summary || summary);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(currentPage); }, [currentPage, pageSize]);

  const onFilterChange = () => { setCurrentPage(1); load(1); };
  const clearFilters = () => {
    searchRef.current = ""; categoryRef.current = ""; statusRef.current = "";
    stockRef.current = ""; warehouseRef.current = ""; setTagChips([]);
    onFilterChange();
  };

  // ✅ Pagination helper
  const getVisiblePages = (currentPage, totalPages, maxVisible = 7) => {
    const pages = [];
    const half = Math.floor(maxVisible / 2);
    pages.push(1);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);
    if (currentPage <= half) { start = 2; end = Math.min(totalPages - 1, maxVisible); }
    else if (currentPage + half >= totalPages) { start = Math.max(2, totalPages - maxVisible + 1); end = totalPages - 1; }
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const columns = [
    { header: "ID", enableColumnFilter: false,accessorKey: "id" },
    {
      header: "Name",enableColumnFilter: false, accessorKey: "name",
      cell: (c) => (
        <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => handleViewDetails(c.row.original.id)}>
          <img src={prefixUrl(c.row.original.primary_image)} alt="" width="60" height="45" className="me-2 rounded" />
          <span>{c.getValue()}</span>
        </div>
      )
    },
    { header: "SKU", enableColumnFilter: false,accessorKey: "sku" },
    { header: "Category", enableColumnFilter: false,accessorKey: "category" },
    { header: "Price", enableColumnFilter: false,accessorKey: "price", cell: (c) => `₱${Number(c.getValue() || 0).toFixed(2)}` },
    { header: "Available", enableColumnFilter: false,accessorKey: "available_qty" },
    {
      header: "Action",
      cell: (c) => (
        <UncontrolledDropdown>
          <DropdownToggle tag="button" className="btn btn-sm btn-soft-primary">
            <i className="ri-more-fill" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => handleViewDetails(c.row.original.id)}>View</DropdownItem>
            <DropdownItem onClick={() => openEdit(c.row.original)}>Edit</DropdownItem>
            <DropdownItem onClick={() => onDeleteProduct(c.row.original.id)}>Delete</DropdownItem>
            <DropdownItem onClick={() => openQr(c.row.original)}>QR</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      )
    },
  ];

  return (
    <div className="page-content">
      <ToastContainer limit={5} />
      <Container fluid>
        {/* Header */}
        <Row className="mb-2">
          <Col><h2>Products</h2></Col>

            {isAdmin && (
              <Col className="text-end">
                <Button color="primary" onClick={openAdd}>
                  <i className="ri-add-line me-1" /> Add Product
                </Button>
              </Col>
            )}
        </Row>

        {/* Summary Widgets */}
        <Row className="g-3 mb-3">

          {/* TOTAL PRODUCTS */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Total Products</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-primary-subtle fs-3">
                    <i className="ri-box-3-line text-primary"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.totalProducts} duration={2} />
              </h4>
            </CardBody></Card>
          </Col>

          {/* AVAILABLE */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Available</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-success-subtle fs-3">
                    <i className="ri-checkbox-circle-line text-success"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.available_qty || 0} duration={2} />
              </h4>
            </CardBody></Card>
          </Col>

          {/* IN-TRANSIT */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">In-Transit</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-info-subtle fs-3">
                    <i className="ri-truck-line text-info"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.in_transit_qty || 0} duration={2} />
              </h4>
            </CardBody></Card>
          </Col>

          {/* SOLD */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Sold</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-danger-subtle fs-3">
                    <i className="ri-shopping-bag-3-line text-danger"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.sold_qty || 0} duration={2} />
              </h4>
            </CardBody></Card>
          </Col>

        </Row>

        {/* Filters */}
        <Card className="mb-3">
          <CardBody>
            {/* Header with toggle icon */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="ri-filter-3-line me-2" /> Filters
              </h5>
              <Button
                color="light"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <i
                  className={`ri-arrow-${filtersOpen ? "up" : "down"}-s-line`}
                  style={{ fontSize: "1.2rem" }}
                />
              </Button>
            </div>

            {/* Collapsible content */}
            {filtersOpen && (
              <>
                <Row className="g-2 mb-2">
                  <Col md={4}>
                    <Input
                      placeholder="Search products..."
                      value={searchRef.current}
                      onChange={(e) => {
                        searchRef.current = e.target.value;
                        onFilterChange();
                      }}
                    />
                  </Col>
                  <Col md={2}>
                    <Input
                      type="select"
                      value={categoryRef.current}
                      onChange={(e) => {
                        categoryRef.current = e.target.value;
                        onFilterChange();
                      }}
                    >
                      <option value="">All Categories</option>
                      <option>Plaques</option>
                      <option>Trophies</option>
                      <option>Signage</option>
                    </Input>
                  </Col>
                  {role === "Admin" && (
                    <Col md={2}>
                      <Input
                        type="select"
                        value={warehouseRef.current}
                        onChange={(e) => {
                          warehouseRef.current = e.target.value;
                          onFilterChange();
                        }}
                      >
                        <option value="">All Warehouses</option>
                      </Input>
                    </Col>
                  )}
                  <Col md={2}>
                    <Input
                      type="select"
                      value={statusRef.current}
                      onChange={(e) => {
                        statusRef.current = e.target.value;
                        onFilterChange();
                      }}
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </Input>
                  </Col>
                  <Col md={2}>
                    <Input
                      type="select"
                      value={stockRef.current}
                      onChange={(e) => {
                        stockRef.current = e.target.value;
                        onFilterChange();
                      }}
                    >
                      <option value="">All Stock Levels</option>
                      <option value="low">Low Stock</option>
                      <option value="out">Out of Stock</option>
                    </Input>
                  </Col>
                </Row>

                <div className="text-end mt-2 d-flex justify-content align-items-center gap-2">
                  <Button
                    className="btn btn-light waves-effect waves-light"
                    onClick={clearFilters}
                  >
                    <i className="ri-filter-off-line me-1" /> Clear Filters
                  </Button>
                  <Button
                    className="btn btn-light waves-effect waves-light"
                    onClick={toggleView}
                  >
                    <i
                      className={`me-1 ${view === "grid" ? "ri-list-check-2" : "ri-layout-grid-line"}`}
                    />{" "}
                    {view === "grid" ? "List" : "Grid"} View
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Table or Grid */}
        {view === "list" ? (
          <Card>
            <CardBody>
              <TableContainer
                columns={[
                  { header: "ID", enableColumnFilter: false, accessorKey: "id" },
                  {
                    header: "Name", enableColumnFilter: false, accessorKey: "name",
                    cell: (c) => (
                      <div
                        className="d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewDetails(c.row.original.id)}
                      >
                        <img
                          src={prefixUrl(c.row.original.primary_image)}
                          alt=""
                          width="60"
                          height="45"
                          className="me-2 rounded"
                        />
                        <span>{c.getValue()}</span>
                      </div>
                    ),
                  },
                  { header: "Category", enableColumnFilter: false, accessorKey: "category" },
                  {
                    header: "Status",
                    enableColumnFilter: false,
                    accessorKey: "status",
                    cell: (c) => getStatusBadge(c.getValue()),
                  },
                  { header: "Quantity", enableColumnFilter: false, accessorKey: "total_qty" }, // ✅ NEW
                  {
                    header: "Price",
                    enableColumnFilter: false,
                    accessorKey: "price",
                    cell: (c) => `${Number(c.getValue() || 0).toFixed(2)}`,
                  },
                  {
                    header: "Available",
                    enableColumnFilter: false,
                    accessorKey: "available_qty",
                  },
                  {
                    header: "Action",
                    cell: (c) => (
                      <UncontrolledDropdown>
                        <DropdownToggle tag="button" className="btn btn-sm btn-soft-primary">
                          <i className="ri-more-fill" />
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={() => handleViewDetails(c.row.original.id)}>View</DropdownItem>
                          <DropdownItem onClick={() => openEdit(c.row.original)}>Edit</DropdownItem>
                          <DropdownItem onClick={() => onDeleteProduct(c.row.original.id)}>Delete</DropdownItem>
                          <DropdownItem onClick={() => openQr(c.row.original)}>QR</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    ),
                  },
                ]}
                data={rows}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(s) => {
                  debugger; 
                  let newSize = s === "all" ? totalRecords : Number(s);
                  setPageSize(newSize);
                  setCurrentPage(1);
                  load(1, newSize); // ✅ ensure limit updates
                }}
                theadClass="table-light"
                tableClass="align-middle table-nowrap"
                divClass="table-responsive"
              />
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Row Count */}
            <Row className="mb-2">
              <Col>
                <small className="text-muted">
                  Showing <strong>{totalRecords}</strong> {totalRecords === 1 ? "record" : "records"}
                </small>
              </Col>
            </Row>    

            {/* Grid View */}
            <Row className="g-3">{rows.map((p) => (
              <Col key={p.id} xl={3}><ProductCard product={p} onView={() => handleViewDetails(p.id)} onEdit={() => openEdit(p)} onDelete={() => onDeleteProduct(p.id)} /></Col>
            ))}</Row>

            {/* Grid Pagination */}
            <Row className="align-items-center mt-3 g-3">
              <div className="col-sm d-flex gap-3 align-items-center">
                <Input
                  className="w-auto"
                  type="select"
                  value={pageSize === totalRecords ? "all" : pageSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    const newSize = val === "all" ? totalRecords : +val;
                    setPageSize(newSize);
                    setCurrentPage(1);
                    load(1, newSize);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </Input>
                <div className="text-muted">Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}</div>
              </div>
              <div className="col-sm-auto">
                <ul className="pagination pagination-separated pagination-md mb-0 flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <a href="#!" className="page-link" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>Previous</a>
                  </li>
                  {getVisiblePages(currentPage, totalPages, window.innerWidth < 576 ? 3 : 7).map((item, idx) => (
                    <li key={idx} className="page-item">
                      {item === "..." ? <span className="page-link">…</span> :
                        <a href="#!" className={`page-link ${currentPage === item ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setCurrentPage(item); }}>{item}</a>}
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <a href="#!" className="page-link" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>Next</a>
                  </li>
                </ul>
              </div>
            </Row>
          </>
        )}

        {/* Modals */}
        <ProductDetailsModal productId={activeProductId} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
        <AddProductDialog open={createOpen} onClose={closeAdd} form={createForm} setForm={setCreateForm} isEditing={isEditing} editingId={editingId} />
        <QRCodeGenerator product={qrProduct} open={qrOpen} onClose={() => setQrOpen(false)} />
      </Container>
    </div>
  );
};

export default Products;
