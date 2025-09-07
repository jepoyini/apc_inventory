// ================================================================
// FILE: src/pages/Inventory/Products.jsx (full with cookie persistence)
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import {
  Card, CardBody, Col, Row, Container, Input, Button, Badge,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Spinner
} from "reactstrap";
import Cookies from "js-cookie";
import CountUp from "react-countup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { APIClient, apipost } from "../../helpers/api_helper";
import { api } from "../../config";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import ProductCard from "./ProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import AddProductDialog from "./AddProductDialog";
import QRCodeGenerator from "./QRCodeGenerator";

const Products = () => {
  document.title = "Products | IBOPRO";
  const apipost = new APIClient();

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

  // view + pageSize
  const [view, setView] = useState("grid");
  const [pageSize, setPageSize] = useState(10);

  // details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const onViewProduct = (id) => { setActiveProductId(id); setDetailsOpen(true); };

  // add/edit product modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    sku: "",
    name: "",
    category: "",
    status: "active",
    price: "",
    cost: "",
    default_warehouse_id: "",
    reorder_point: "",
    brand: "",
    model: "",
    description: "",
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Restore state from cookies on mount ---
  useEffect(() => {
    const saved = Cookies.get("products_state");
    if (saved) {
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
      } catch (e) {
        console.error("Failed to parse cookie state", e);
      }
    }
  }, []);

  // --- Save state to cookies whenever relevant changes ---
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
      }),
      { expires: 30 }
    );
  }, [view, pageSize, currentPage, tagChips]);

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noimage.png?a=14234";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const toggleView = () => {
    const nextView = view === "grid" ? "list" : "grid";
    setView(nextView);
  };

  const changePageSize = (size) => { setPageSize(size); };

  const openAdd = () => { setIsEditing(false); setEditingId(null); setCreateForm({
    sku: "", name: "", category: "", status: "active", price: "", cost: "",
    default_warehouse_id: "", reorder_point: "", brand: "", model: "", description: "", tags: []
  }); setCreateOpen(true); };
  const closeAdd = () => setCreateOpen(false);

  const openEdit = (row) => { setIsEditing(true); setEditingId(row.id); setCreateForm({
    sku: row.sku || "", name: row.name || "", category: row.category || "", status: row.status || "active",
    price: row.price ?? "", cost: row.cost ?? "", default_warehouse_id: row.default_warehouse_id ?? "",
    reorder_point: row.reorder_point ?? "", brand: row.brand || "", model: row.model || "", description: row.description || "", tags: row.tags || []
  }); setCreateOpen(true); };

  const onDeleteProduct = async (id) => {
    try {
      await apipost.post(`/products/${id}/delete`, {});
      toast.success("Product deleted");
      load(currentPage);
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  const submitAdd = async () => {
    try {
      const payload = {
        ...createForm,
        price: Number(createForm.price || 0),
        cost: Number(createForm.cost || 0),
        default_warehouse_id: createForm.default_warehouse_id ? Number(createForm.default_warehouse_id) : null,
        reorder_point: Number(createForm.reorder_point || 0),
      };
      if (isEditing && editingId) {
        await apipost.post(`/products/${editingId}/update`, payload);
        toast.success("Product updated");
      } else {
        await apipost.post(`/products/create`, payload);
        toast.success("Product created");
      }
      setIsEditing(false); setEditingId(null); closeAdd(); load(currentPage);
    } catch (e) {
      console.error(e);
      toast.error(isEditing ? "Update failed" : "Create failed");
    }
  };

  const load = async (page) => {
    setLoading(true);
    try {
      const r = await apipost.post(`/products`, {
        page,
        limit: pageSize,
        search: searchRef.current || "",
        category: categoryRef.current || "",
        status: statusRef.current || "",
        stockLevel: stockRef.current || "",
        warehouse: warehouseRef.current || "",
        tags: tagChips,
      });
      const list = r?.products || [];
      setRows(list);
      const total = r?.totalRecords ?? 0;
      setTotalRecords(total);
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      setSummary(r?.summary || summary);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(currentPage); }, [currentPage, pageSize]);

  const onFilterChange = () => { setCurrentPage(1); load(1); };
  const clearFilters = () => {
    searchRef.current = ""; categoryRef.current = ""; statusRef.current = "";
    stockRef.current = ""; warehouseRef.current = "";
    setTagChips([]); onFilterChange();
  };

  const tagActive = (t) => tagChips.includes(t);
  const toggleTag = (t) => {
    setTagChips((prev) => tagActive(t) ? prev.filter((x) => x !== t) : [...prev, t]);
    onFilterChange();
  };

  const columns = [
    {
      header: "Image", accessorKey: "primary_image", enableColumnFilter: false,
      cell: (c) => (
        <div className="avatar-sm">
          <img
            src={prefixUrl(c.getValue())}
            alt="Product"
            className="img-thumbnail rounded"
            style={{ objectFit: "cover", width: "60px", height: "45px", padding: "0px" }}
          />
        </div>
      )
    },
    { header: "SKU", accessorKey: "sku", enableColumnFilter: false },
    { header: "Name", accessorKey: "name", enableColumnFilter: false },
    { header: "Category", accessorKey: "category", enableColumnFilter: false },
    {
      header: "Status", accessorKey: "status", enableColumnFilter: false,
      cell: (c) => (
        <Badge color={c.getValue() === "active" ? "success" : "secondary"} pill>
          {c.getValue()}
        </Badge>
      )
    },
    { header: "Price", accessorKey: "price", enableColumnFilter: false, cell: (c) => `₱${Number(c.getValue() || 0).toFixed(2)}` },
    { header: "Available", accessorKey: "available_qty", enableColumnFilter: false },
    { header: "Reserved", accessorKey: "reserved_qty", enableColumnFilter: false },
    { header: "Shipped", accessorKey: "shipped_qty", enableColumnFilter: false },
    {
      header: "ACTION", enableColumnFilter: false,
      cell: (cell) => (
        <UncontrolledDropdown>
          <DropdownToggle className="btn btn-soft-primary btn-sm dropdown" tag="button">
            <i className="ri-more-fill align-middle" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem onClick={() => onViewProduct(cell.row.original.id)}>
              <i className="ri-eye-line me-1" /> View
            </DropdownItem>
            <DropdownItem onClick={() => openEdit(cell.row.original)}>
              <i className="ri-pencil-line me-1" /> Edit
            </DropdownItem>
            <DropdownItem onClick={() => onDeleteProduct(cell.row.original.id)}>
              <i className="ri-delete-bin-6-line me-1 text-danger" /> Delete
            </DropdownItem>
            <DropdownItem onClick={() => openQr(cell.row.original)}>
              <i className="ri-qr-code-line me-1" /> Generate QR
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      )
    }
  ];


  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        {/* Header */}
        <Row className="align-items-center mb-2">
          <Col>
            <h2 className="mb-0">Products</h2>
            <div className="text-muted">APC Exclusive product management with powerful features</div>
          </Col>
          <Col className="text-end">
            <Button color="primary" onClick={openAdd}>
              <i className="ri-add-line me-1" /> Add Product
            </Button>
          </Col>
        </Row>

        {/* Summary cards with CountUp */}
        <Row className="g-3 mb-3">
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Total Products</p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <CountUp end={summary.totalProducts} duration={2} />
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded fs-3 bg-primary-subtle">
                    <i className="text-primary ri-box-3-line"></i>
                  </span>
                </div>
              </div>
            </CardBody></Card>
          </Col>

          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Inventory Value</p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    ₱<CountUp end={summary.totalValue} duration={2} separator="," decimals={2} />
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded fs-3 bg-success-subtle">
                    <i className="text-success ri-currency-line"></i>
                  </span>
                </div>
              </div>
            </CardBody></Card>
          </Col>

          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Active Products</p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <CountUp end={summary.activeProducts} duration={2} />
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded fs-3 bg-info-subtle">
                    <i className="text-info ri-checkbox-circle-line"></i>
                  </span>
                </div>
              </div>
            </CardBody></Card>
          </Col>

          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Low / Out</p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <CountUp end={summary.lowStock} duration={2} /> / <CountUp end={summary.outOfStock} duration={2} />
                  </h4>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded fs-3 bg-danger-subtle">
                    <i className="text-danger ri-error-warning-line"></i>
                  </span>
                </div>
              </div>
            </CardBody></Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3"><i className="ri-filter-3-line me-2" />Filters</h5>
            <Row className="g-2 align-items-center">
              <Col md={4}>
                <Input
                  placeholder="Search products..."
                  value={searchRef.current}
                  onChange={(e) => { searchRef.current = e.target.value; onFilterChange(); }}
                />
              </Col>
              <Col md={2}>
                <Input
                  type="select"
                  value={categoryRef.current}
                  onChange={(e) => { categoryRef.current = e.target.value; onFilterChange(); }}
                >
                  <option value="">All Categories</option>
                  <option>Plaques</option>
                  <option>Trophies</option>
                  <option>Signage</option>
                </Input>
              </Col>
              <Col md={2}>
                <Input
                  type="select"
                  value={warehouseRef.current}
                  onChange={(e) => { warehouseRef.current = e.target.value; onFilterChange(); }}
                >
                  <option value="">All Warehouses</option>
                </Input>
              </Col>
              <Col md={2}>
                <Input
                  type="select"
                  value={statusRef.current}
                  onChange={(e) => { statusRef.current = e.target.value; onFilterChange(); }}
                >
                  <option value="">All Statuses</option>
                  <option value="active">active</option>
                  <option value="archived">archived</option>
                </Input>
              </Col>
              <Col md={2}>
                <Input
                  type="select"
                  value={stockRef.current}
                  onChange={(e) => { stockRef.current = e.target.value; onFilterChange(); }}
                >
                  <option value="">All Stock Levels</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </Input>
              </Col>
            </Row>

            <div className="mt-3">Filter by Tags:</div>
            <div className="d-flex flex-wrap mt-2">
              {tagUniverse.map((t) => (
                <Badge
                  key={t}
                  color={tagActive(t) ? 'primary' : 'info'}
                  pill
                  className="me-2 mb-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>

<div className="text-end mt-2 d-flex justify-content-end align-items-center gap-2">
  <Button
    className="btn btn-secondary waves-effect waves-light"
    onClick={clearFilters}
  >
    <i className="ri-filter-off-line me-1" /> Clear Filters
  </Button>

  <Button
    className="btn btn-info waves-effect waves-light"
    onClick={toggleView}
  >
    <i
      className={`me-1 ${
        view === "grid" ? "ri-list-check-2" : "ri-layout-grid-line"
      }`}
    />{" "}
    {view === "grid" ? "List" : "Grid"} View
  </Button>


</div>




          </CardBody>
        </Card>



        {/* Table or Grid */}
        {/* {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
        </div> */}
        { view === "list" ? (
            <Card className="mt-3">
                <CardBody>

                        <TableContainer
                        columns={columns}
                        data={rows}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRecords={totalRecords}
                        pageSize={pageSize}
                        onPageChange={(p) => setCurrentPage(p)}       // 👈 will fire AJAX reload
                        onPageSizeChange={(s) => {                   // 👈 handle page size change
                            setPageSize(s);
                            setCurrentPage(1); // reset to page 1
                            load(1);           // reload with new size
                        }}
                        theadClass="table-light"
                        tableClass="align-middle table-nowrap"
                        divClass="table-responsive"
                        />

                </CardBody>
            </Card>
        ) : (
            <>
                {/* Grid Pagination */}
                {rows.length > 0 && (
                <Row className="align-items-center mt-3 g-3 text-center text-sm-start">
                    <div className="col-sm d-flex align-items-center gap-3">
                    {/* Page size dropdown */}
                    <Input
                        type="select"
                        value={pageSize}
                        onChange={(e) => {
                        const newSize = parseInt(e.target.value, 10);
                        setPageSize(newSize);
                        setCurrentPage(1); // reset
                        load(1);
                        changePageSize(parseInt(e.target.value, 10));
                        }}
                        style={{ width: "auto", minWidth: "120px" }}
                        className="form-select"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </Input>

                    {/* Showing info */}
                    <div className="text-muted">
                        Showing{" "}
                        <span className="fw-semibold">
                        {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, totalRecords)}
                        </span>{" "}
                        of <span className="fw-semibold">{totalRecords}</span> Results
                    </div>
                    </div>

                    {/* Pagination links */}
                    <div className="col-sm-auto">
                    <ul className="pagination pagination-separated pagination-md mb-0">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <a
                            href="#!"
                            className="page-link"
                            onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                        >
                            Previous
                        </a>
                        </li>

                        {(() => {

                        // Helper: limit visible pages based on screen size
                        const getVisiblePages = (pageIndex, pageCount) => {
                        const isMobile = window.innerWidth < 576; // Bootstrap sm breakpoint
                        const maxVisible = isMobile ? 3 : 10;     // 👈 fewer on mobile

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

                        return getVisiblePages(currentPage - 1, totalPages, 10).map(
                            (item, idx) => (
                            <li key={idx} className="page-item">
                                {item === "start-ellipsis" || item === "end-ellipsis" ? (
                                <span className="page-link">...</span>
                                ) : (
                                <a
                                    href="#!"
                                    className={`page-link ${
                                    currentPage === item + 1 ? "active" : ""
                                    }`}
                                    onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(item + 1);
                                    }}
                                >
                                    {item + 1}
                                </a>
                                )}
                            </li>
                            )
                        );
                        })()}

                        <li
                        className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                        }`}
                        >
                        <a
                            href="#!"
                            className="page-link"
                            onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                        >
                            Next
                        </a>
                        </li>
                    </ul>
                    </div>
                </Row>
                )}

                {/* Grid View */}
                <Row className="g-3 mt-3">
                {rows.length === 0 ? (
                    <Col>
                    <Card>
                        <CardBody className="text-center text-muted">No products found</CardBody>
                    </Card>
                    </Col>
                ) : (
                    rows.map((p) => (
                    <Col key={p.id} xxl={3} xl={4} lg={6}>
                        <ProductCard
                        product={p}
                        onView={() => onViewProduct(p.id)}
                        onEdit={() => openEdit(p)}
                        onDelete={() => onDeleteProduct(p.id)}
                        />
                    </Col>
                    ))
                )}
                </Row>

                {/* Grid Pagination */}
                {rows.length > 0 && (
                <Row className="align-items-center mt-3 g-3 text-center text-sm-start">
                    <div className="col-sm d-flex align-items-center gap-3">
                    {/* Page size dropdown */}
                    <Input
                        type="select"
                        value={pageSize}
                        onChange={(e) => {
                        const newSize = parseInt(e.target.value, 10);
                        setPageSize(newSize);
                        setCurrentPage(1); // reset
                        load(1);
                        changePageSize(parseInt(e.target.value, 10));
                        }}
                        style={{ width: "auto", minWidth: "120px" }}
                        className="form-select"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </Input>

                    {/* Showing info */}
                    <div className="text-muted">
                        Showing{" "}
                        <span className="fw-semibold">
                        {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, totalRecords)}
                        </span>{" "}
                        of <span className="fw-semibold">{totalRecords}</span> Results
                    </div>
                    </div>

                    {/* Pagination links */}
                    <div className="col-sm-auto">
                    <ul className="pagination pagination-separated pagination-md mb-0">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <a
                            href="#!"
                            className="page-link"
                            onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                        >
                            Previous
                        </a>
                        </li>

                        {(() => {
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

                        return getVisiblePages(currentPage - 1, totalPages, 10).map(
                            (item, idx) => (
                            <li key={idx} className="page-item">
                                {item === "start-ellipsis" || item === "end-ellipsis" ? (
                                <span className="page-link">...</span>
                                ) : (
                                <a
                                    href="#!"
                                    className={`page-link ${
                                    currentPage === item + 1 ? "active" : ""
                                    }`}
                                    onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(item + 1);
                                    }}
                                >
                                    {item + 1}
                                </a>
                                )}
                            </li>
                            )
                        );
                        })()}

                        <li
                        className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                        }`}
                        >
                        <a
                            href="#!"
                            className="page-link"
                            onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                        >
                            Next
                        </a>
                        </li>
                    </ul>
                    </div>
                </Row>
                )}
            </>
        )}


        {/* Details Modal */}
        <ProductDetailsModal
          productId={activeProductId}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />

        {/* Add/Edit Product Dialog */}
        <AddProductDialog
          open={createOpen}
          onClose={closeAdd}
          form={createForm}
          setForm={setCreateForm}
          onSubmit={submitAdd}
          isEditing={isEditing}
          editingId={editingId}
        />

      </Container>
    </div>
  );


};

export default Products;




