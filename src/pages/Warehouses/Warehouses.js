// src/pages/Inventory/Warehouses.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Col, Container, Row,
  Button, Input, UncontrolledDropdown, DropdownToggle,
  DropdownMenu, DropdownItem, Modal, ModalHeader,
  ModalBody, ModalFooter, Progress, Badge, Nav,
  NavItem, NavLink, TabContent, TabPane, FormGroup, Label, Collapse
} from "reactstrap";
import classnames from "classnames";
import CountUp from "react-countup";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { APIClient } from "../../helpers/api_helper";
import DeleteModal from "../../Components/Common/DeleteModal";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import { api } from "../../config";
import Cookies from "js-cookie";
import WarehouseViewModal from "./WarehouseViewModal";

const Warehouses = () => {
  document.title = "Warehouses | IBOPRO";
  const apipost = new APIClient();
  const fmt = (n) => Number(n || 0).toLocaleString();
  const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

  // state
  const [rows, setRows] = useState([]);
  const [gridView, setGridView] = useState(false);

  const [summary, setSummary] = useState({
    totalWarehouses: 0,
    totalCapacity: 0,
    averageUtilization: 0,
    highUtilization: 0,
  });

  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    manager: "",
    status: "Active",
    capacity: 0,
    current_stock: 0,
    logo: null, // existing DB path
    logoFile: null, // file object for upload
  });

  useEffect(() => {
    const savedView = Cookies.get("warehouseView");
    if (savedView) {
      setGridView(savedView === "grid");
    }
  }, []);

  const toggleGridView = (view) => {
    setGridView(view === "grid");
    Cookies.set("warehouseView", view, { expires: 7 }); // save 7 days
  };

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/warehouse.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const [details, setDetails] = useState({
    warehouse: null,
    products: [],
    stats: {},
    metrics: {},
  });

  const [activeTab, setActiveTab] = useState("1");

  // filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(true);

  // columns
  const columns = useMemo(
    () => [
      { header: "WAREHOUSE", accessorKey: "name", enableColumnFilter: false },
      { header: "LOCATION", accessorKey: "location", enableColumnFilter: false },
      { header: "MANAGER", accessorKey: "manager", enableColumnFilter: false },
      {
        header: "STATUS",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (c) => (
          <Badge color={c.getValue() === "Active" ? "success" : "warning"}>
            {c.getValue()}
          </Badge>
        ),
      },
      {
        header: "CAPACITY",
        accessorKey: "capacity",
        enableColumnFilter: false,
        cell: (c) => fmt(c.getValue()),
      },
      {
        header: "CURRENT",
        accessorKey: "current_stock",
        enableColumnFilter: false,
        cell: (c) => fmt(c.getValue()),
      },
      {
        header: "UTIL%",
        accessorKey: "capacity",
        enableColumnFilter: false,
        cell: (c) => {
          const row = c.row.original;
          const per = pct(row.current_stock, row.capacity);
          const color =
            per > 80 ? "text-danger" : per > 60 ? "text-warning" : "text-success";
          return <span className={color}>{per}%</span>;
        },
      },
      {
        header: "ACTION",
        enableColumnFilter: false,
        cell: (cell) => (
          <UncontrolledDropdown>
            <DropdownToggle className="btn btn-soft-primary btn-sm" tag="button">
              <i className="ri-more-fill align-middle" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => onView(cell.row.original.id)}>
                View
              </DropdownItem>
              <DropdownItem onClick={() => onEditAsk(cell.row.original)}>
                Edit
              </DropdownItem>
              <DropdownItem onClick={() => onDeleteAsk(cell.row.original.id)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      },
    ],
    []
  );

  // load warehouses
  const load = async () => {
    try {
      const r = await apipost.post(`/warehouses`, { page: 1, limit: 50 });
      let data = r?.warehouses || [];

      if (search) {
        data = data.filter(
          (x) =>
            x.name.toLowerCase().includes(search.toLowerCase()) ||
            x.location.toLowerCase().includes(search.toLowerCase()) ||
            x.manager.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (statusFilter) {
        data = data.filter((x) => x.status === statusFilter);
      }

      setRows(data);
      setSummary(r?.summary || summary);
    } catch {
      toast.error("Error loading warehouses");
    }
  };

  useEffect(() => {
    load();
  }, [search, statusFilter]);

  // CRUD
  const onCreateSubmit = async () => {
    try {
      if (!form.name || !form.location || !form.manager) {
        Swal.fire("Missing fields", "Name, Location, Manager required.", "warning");
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("location", form.location);
      fd.append("manager", form.manager);
      fd.append("status", form.status);
      fd.append("capacity", form.capacity);
      fd.append("current_stock", form.current_stock);
      if (form.logoFile) fd.append("logo", form.logoFile);

      await apipost.post(`/warehouses/create`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCreateModal(false);
      load();
      toast.success("Warehouse added");
    } catch {
      toast.error("Create failed");
    }
  };

  const onEditAsk = (row) => {
    setCurrentId(row.id);
    setForm({
      ...row,
      logo: row.logo || null,
      logoFile: null,
    });
    setEditModal(true);
  };

  const onEditSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("location", form.location);
      fd.append("manager", form.manager);
      fd.append("status", form.status);
      fd.append("capacity", form.capacity);
      fd.append("current_stock", form.current_stock);
      if (form.logoFile) fd.append("logo", form.logoFile);

      await apipost.post(`/warehouses/${currentId}/update`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditModal(false);
      load();
      toast.success("Warehouse updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const onDeleteAsk = (id) => {
    setCurrentId(id);
    setDeleteModal(true);
  };

  const onDeleteConfirm = async () => {
    try {
      await apipost.post(`/warehouses/${currentId}/delete`, {});
      setDeleteModal(false);
      load();
      toast.success("Warehouse deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const onView = async (id) => {
    try {
      const r = await apipost.post(`/warehouses/${id}/details`, {});
      setDetails({
        warehouse: r?.warehouse || null,
        products: r?.products || [],
        stats: r?.stats || {},
        metrics: r?.metrics || {},
      });
      setActiveTab("1");
      setViewModal(true);
    } catch {
      toast.error("Failed to load details");
    }
  };

  return (
    <div className="page-content">
      <DeleteModal
        show={deleteModal}
        onDeleteClick={onDeleteConfirm}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        {/* Header */}
        <Row className="align-items-center mb-3">
          <Col>
            <h2>Warehouses</h2>
            <p className="text-muted">Monitor warehouse capacity and manage location</p>
          </Col>
          <Col className="text-end">
            <Button
              color={!gridView ? "secondary" : "light"}
              className="me-2"
              onClick={() => toggleGridView("list")}
            >
              <i className="ri-list-unordered"></i>
            </Button>
            <Button
              color={gridView ? "secondary" : "light"}
              className="me-2"
              onClick={() => toggleGridView("grid")}
            >
              <i className="ri-grid-fill"></i>
            </Button>
            <Button color="primary" onClick={() => setCreateModal(true)}>
              Add Warehouse
            </Button>
          </Col>
        </Row>

        {/* Widgets */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="card-animate">
              <CardBody>
                <p className="text-muted">Total Warehouses</p>
                <h4><CountUp end={summary.totalWarehouses} duration={2} /></h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-animate">
              <CardBody>
                <p className="text-muted">Total Capacity</p>
                <h4><CountUp end={summary.totalCapacity} duration={2} separator="," /></h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-animate">
              <CardBody>
                <p className="text-muted">Avg Utilization</p>
                <h4><CountUp end={summary.averageUtilization} duration={2} suffix="%" /></h4>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-animate">
              <CardBody>
                <p className="text-muted">High Utilization</p>
                <h4><CountUp end={summary.highUtilization} duration={2} /></h4>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Filter Card */}
        <Card className="mb-4">
          <CardHeader
            className="d-flex justify-content-between align-items-center"
            onClick={() => setFilterOpen(!filterOpen)}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-semibold">Filters</span>
            <i className={filterOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
          </CardHeader>
          <Collapse isOpen={filterOpen}>
            <CardBody>
              <Row className="g-3">
                <Col md={6}>
                  <Input
                    placeholder="Search name / location / manager"
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
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </Input>
                </Col>
              </Row>
            </CardBody>
          </Collapse>
        </Card>

        {/* List vs Grid */}
        {!gridView ? (
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={rows}
                    isGlobalFilter={false}
                    customPageSize={10}
                    className="custom-header-css"
                    divClass="table-responsive table-card mb-3"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light"
                  />
                  <div className="text-muted small mt-2">
                    Showing {rows.length} records
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        ) : (
          <>
            {/* Row Count */}
            <Row className="mb-2">
              <Col>
                <small className="text-muted">
                  Showing <strong>{rows.length}</strong> {rows.length === 1 ? "warehouse" : "warehouses"}
                </small>
              </Col>
            </Row>
            <Row>
              {rows.map((r) => (
                <Col md={4} key={r.id} className="mb-3">
                  <Card className="shadow-sm h-100">
                    <CardBody>
                      <Row className="align-items-center">
                        {/* Logo / Image */}
                        <Col xs={4} className="text-center">
                          <img
                            src={prefixUrl(r.logo)}
                            alt={r.name}
                            className="img-fluid rounded shadow-sm"
                            style={{ maxHeight: "110px", objectFit: "contain" }}
                          />
                        </Col>

                        {/* Warehouse Details */}
                        <Col xs={8}>
                          <h5>{r.name}</h5>
                          <p className="text-muted mb-1">{r.location}</p>
                          <p className="mb-1">
                            <Badge
                              color={r.status === "Active" ? "success" : "warning"}
                              pill
                            >
                              {r.status}
                            </Badge>
                          </p>
                          <p className="mb-2">
                            Capacity: {fmt(r.capacity)} | Current Stock: {fmt(r.current_stock)}
                          </p>

                          {/* Action Buttons */}
                          <div>
                            <Button
                              size="sm"
                              color="info"
                              onClick={() => onView(r.id)}
                              className="me-2"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              color="warning"
                              onClick={() => onEditAsk(r)}
                              className="me-2"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => onDeleteAsk(r.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>

      {/* Create Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} centered>
        <ModalHeader toggle={() => setCreateModal(false)}>Add Warehouse</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Logo</Label>
            <div className="mb-2 text-center">
              <img
                src={
                  form.logoFile
                    ? URL.createObjectURL(form.logoFile)
                    : "/images/warehouse.png"
                }
                alt="Warehouse Logo"
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "120px", objectFit: "contain" }}
              />
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  logoFile: e.target.files[0],
                }))
              }
            />
          </FormGroup>
          <FormGroup><Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </FormGroup>
          <FormGroup><Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
          </FormGroup>
          <FormGroup><Label>Manager</Label>
            <Input value={form.manager} onChange={(e) => setForm((s) => ({ ...s, manager: e.target.value }))} />
          </FormGroup>
          <FormGroup><Label>Capacity</Label>
            <Input type="number" value={form.capacity} onChange={(e) => setForm((s) => ({ ...s, capacity: Number(e.target.value) }))} />
          </FormGroup>
          <FormGroup><Label>Current Stock</Label>
            <Input type="number" value={form.current_stock} onChange={(e) => setForm((s) => ({ ...s, current_stock: Number(e.target.value) }))} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          <Button color="primary" onClick={onCreateSubmit}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered>
        <ModalHeader toggle={() => setEditModal(false)}>Edit Warehouse</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Logo</Label>
            <div className="mb-2 text-center">
              <img
                src={
                  form.logoFile
                    ? URL.createObjectURL(form.logoFile)
                    : form.logo
                    ? prefixUrl(form.logo)
                    : "/images/warehouse.png"
                }
                alt="Warehouse Logo"
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "120px", objectFit: "contain" }}
              />
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  logoFile: e.target.files[0],
                }))
              }
            />
          </FormGroup>
          <FormGroup><Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </FormGroup>
          <FormGroup><Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
          </FormGroup>
          <FormGroup><Label>Manager</Label>
            <Input value={form.manager} onChange={(e) => setForm((s) => ({ ...s, manager: e.target.value }))} />
          </FormGroup>
          <FormGroup><Label>Capacity</Label>
            <Input type="number" value={form.capacity} onChange={(e) => setForm((s) => ({ ...s, capacity: Number(e.target.value) }))} />
          </FormGroup>
          <FormGroup><Label>Current Stock</Label>
            <Input type="number" value={form.current_stock} onChange={(e) => setForm((s) => ({ ...s, current_stock: Number(e.target.value) }))} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button color="primary" onClick={onEditSubmit}>Update</Button>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <WarehouseViewModal
        isOpen={viewModal}
        toggle={() => setViewModal(false)}
        details={details}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fmt={fmt}
        pct={pct}
      />

      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default Warehouses;
