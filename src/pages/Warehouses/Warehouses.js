// src/pages/Inventory/Warehouses.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  CardBody, Row, Col, Input, Card, Container, CardHeader,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Label, FormGroup,
  Progress, Badge
} from "reactstrap";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import { APIClient } from "../../helpers/api_helper";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const Warehouses = () => {
  document.title = "Warehouses | IBOPRO";
  const api = new APIClient();
  const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);
  const fmt = (n) => Number(n || 0).toLocaleString();
  // table state
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // filters (useRef like your base)
  const searchRef = useRef("");
  const statusRef = useRef("");

  // summary cards
  const [summary, setSummary] = useState({
    totalWarehouses: 0,
    totalCapacity: 0,
    totalStock: 0,
    averageUtilization: 0,
    activeWarehouses: 0,
    highUtilization: 0,
  });

  // modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    manager: "",
    status: "Active",
    capacity: 0,
    current_stock: 0,
  });

  const [details, setDetails] = useState({
    warehouse: null,
    products: [],
    utilization: 0,
  });

  const [prodAction, setProdAction] = useState({
    product_id: "",
    quantity: 1,
    to_warehouse_id: "",
  });

  const columns = useMemo(
    () => [
      {
        header: "WAREHOUSE",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (c) => c.getValue(),
      },
      {
        header: "LOCATION",
        accessorKey: "location",
        enableColumnFilter: false,
        cell: (c) => c.getValue(),
      },
      {
        header: "MANAGER",
        accessorKey: "manager",
        enableColumnFilter: false,
        cell: (c) => c.getValue(),
      },
      {
        header: "STATUS",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (c) => {
          const s = c.getValue();
          const cls = s === "Active" ? "badge bg-success" : "badge bg-warning";
          return <span className={cls}>{s}</span>;
        },
      },
      {
        header: "CAPACITY",
        accessorKey: "capacity",
        enableColumnFilter: false,
        cell: (c) => Number(c.getValue()).toLocaleString(),
      },
      {
        header: "CURRENT",
        accessorKey: "current_stock",
        enableColumnFilter: false,
        cell: (c) => Number(c.getValue()).toLocaleString(),
      },
      {
        header: "UTIL%",
        accessorKey: "capacity",
        enableColumnFilter: false,
        cell: (c) => {
          const row = c.row.original;
          const pct =
            row.capacity > 0
              ? Math.round((row.current_stock / row.capacity) * 100)
              : 0;
          const color =
            pct > 80 ? "text-danger" : pct > 60 ? "text-warning" : "text-success";
          return <span className={color}>{pct}%</span>;
        },
      },
      {
        header: "ACTION",
        cell: (cell) => (
          <UncontrolledDropdown>
            <DropdownToggle className="btn btn-soft-primary btn-sm dropdown" tag="button">
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

  // LOAD (POST instead of GET)
  const load = async (page) => {
    try {
      debugger; 
      const body = {
        page,
        limit: pageSize,
        search: searchRef.current || "",
        status: statusRef.current || "",
      };
      const r = await api.post(`/warehouses`, body); // POST list
      const list = r?.warehouses || [];
      setRows(list);
      const total = r?.totalRecords || list.length;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      setSummary(r?.summary || summary);
    } catch (e) {
      toast.error("Error loading warehouses");
    }
  };

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const handlePageChange = (p) => setCurrentPage(p);
  const onFilterChange = () => {
    setCurrentPage(1);
    load(1);
  };

  // CRUD (respecting your routes: POST /warehouses/create for create)
  const onCreate = () => {
    setCurrentId(null);
    setForm({
      name: "",
      location: "",
      manager: "",
      status: "Active",
      capacity: 0,
      current_stock: 0,
    });
    setCreateModal(true);
  };

  const onCreateSubmit = async () => {
    try {
      if (!form.name || !form.location || !form.manager) {
        Swal.fire("Missing fields", "Name, Location, Manager required.", "warning");
        return;
      }
      await api.post(`/warehouses/create`, {
        name: form.name,
        location: form.location,
        manager: form.manager,
        status: form.status,
        capacity: Number(form.capacity || 0),
        current_stock: Number(form.current_stock || 0),
      });
      setCreateModal(false);
      load(currentPage);
      toast.success("Warehouse added");
    } catch {
      toast.error("Create failed");
    }
  };

  const onEditAsk = (row) => {
    setCurrentId(row.id);
    setForm({
      name: row.name,
      location: row.location,
      manager: row.manager,
      status: row.status,
      capacity: row.capacity,
      current_stock: row.current_stock,
    });
    setEditModal(true);
  };

const onEditSubmit = async () => {
  try {
    debugger; 
    await api.post(`/warehouses/${currentId}/update`, {
      name: form.name,
      location: form.location,
      manager: form.manager,
      status: form.status,
      capacity: Number(form.capacity || 0),
      current_stock: Number(form.current_stock || 0),
    });
    setEditModal(false);
    load(currentPage);
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
    await api.post(`/warehouses/${currentId}/delete`, {});
    setDeleteModal(false);
    load(currentPage);
    toast.success("Warehouse deleted");
  } catch {
    toast.error("Delete failed");
  }
};

  // Details (POST instead of GET)
  const onView = async (id) => {
    try {
      const r = await api.post(`/warehouses/${id}/details`, {}); // POST details
      setDetails({
        warehouse: r?.warehouse || null,
        products: r?.products || [],
        utilization: r?.utilization || 0,
      });
      setDetailsModal(true);
    } catch {
      toast.error("Failed to load details");
    }
  };

  // Actions inside details (same POST endpoints)
  const addProduct = async () => {
    try {
      if (!details.warehouse || !prodAction.product_id || !prodAction.quantity) return;
      await api.post(`/warehouses/${details.warehouse.id}/add-product`, {
        product_id: prodAction.product_id,
        quantity: Number(prodAction.quantity),
      });
      await onView(details.warehouse.id);
      toast.success("Product added");
    } catch {
      toast.error("Add failed");
    }
  };

  const moveProduct = async () => {
    try {
      if (
        !details.warehouse ||
        !prodAction.product_id ||
        !prodAction.quantity ||
        !prodAction.to_warehouse_id
      )
        return;
      await api.post(`/warehouses/${details.warehouse.id}/move-product`, {
        product_id: prodAction.product_id,
        quantity: Number(prodAction.quantity),
        to_warehouse_id: prodAction.to_warehouse_id,
      });
      await onView(details.warehouse.id);
      toast.success("Product moved");
    } catch {
      toast.error("Move failed");
    }
  };

  const removeProduct = async () => {
    try {
      if (!details.warehouse || !prodAction.product_id || !prodAction.quantity) return;
      await api.post(`/warehouses/${details.warehouse.id}/remove-product`, {
        product_id: prodAction.product_id,
        quantity: Number(prodAction.quantity),
      });
      await onView(details.warehouse.id);
      toast.success("Removed (disposed)");
    } catch {
      toast.error("Remove failed");
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
        {/* <BreadCrumb title="Warehouses" pageTitle="Dashboard" /> */}

      <Row className="align-items-center"> {/* Change align-items-end to align-items-center */}
          <Col sm={12}>
              <div className="">
                  <h2>Warehouses</h2>
                  <p className=" mb-0 mt-10">
                      <div className="flex-grow-1 text-truncate">
                          <span className="fs-16 mb-1 fb text-muted">Monitor warehouse capacity and manage location</span> 
                      </div>
                  </p>
              </div>
          </Col>
          
          <Col sm={4} className="d-flex justify-content-center align-items-center"> {/* Centers image vertically */}
              {/* <div className="px-3">
                  <img src={illustarator} className="img-fluid illustarator-img" alt="" />
              </div> */}
          </Col>
      </Row>
      <br></br>


        {/* Summary Cards */}
        <Row className="mb-3">
          {/* Total Warehouses */}
          <Col xl={3} md={4}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                      Total Warehouses
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-4">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                      <CountUp end={summary.totalWarehouses} duration={2} />
                    </h4>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title rounded fs-3 bg-primary-subtle">
                      <i className="text-primary ri-building-2-line"></i>
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Total Capacity */}
          <Col xl={3} md={4}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                      Total Capacity
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-4">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                      <CountUp end={summary.totalCapacity} duration={2} separator="," />
                    </h4>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title rounded fs-3 bg-success-subtle">
                      <i className="text-primary ri-database-2-line"></i>
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Average Utilization */}
          <Col xl={3} md={4}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                      Avg Utilization
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-4">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                      <CountUp end={summary.averageUtilization} duration={2} suffix="%" />
                    </h4>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title rounded fs-3 bg-warning-subtle">
                      <i className="text-warning ri-bar-chart-2-line"></i>
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* High Utilization */}
          <Col xl={3} md={4}>
            <Card className="card-animate">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                      High Utilization
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-end justify-content-between mt-4">
                  <div>
                    <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                      <CountUp end={summary.highUtilization} duration={2} />
                    </h4>
                  </div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title rounded fs-3 bg-danger-subtle">
                      <i className="text-primary ri-alert-line"></i>
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>


        {/* Filters + Create */}
        <Row className="mb-3">
          <Col md={6} className="d-flex gap-2 align-items-center">
            <Input
              placeholder="Search name/location/manager"
              className="form-control"
              value={searchRef.current}
              onChange={(e) => {
                searchRef.current = e.target.value;
                onFilterChange();
              }}
            />
            <Input
              type="select"
              className="form-select"
              value={statusRef.current}
              onChange={(e) => {
                statusRef.current = e.target.value;
                onFilterChange();
              }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
            </Input>
          </Col>
          <Col md={6} className="text-end">
            <Button color="primary" onClick={onCreate}>
              Add Warehouse
            </Button>
          </Col>
        </Row>


        {/* Table */}
        <Row>
          <Col lg={12}>
            <Card id="warehouseList">
              <CardHeader className="border-0">
                <Row className="g-4">
                  <Col sm={6}>
                    <span className="table-caption">Warehouse Management</span>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="pt-0">
                <TableContainer
                  columns={columns}
                  data={rows}
                  customPageSize={pageSize}
                  maxLength={totalPages}
                  currentPage={currentPage}
                  isAddUserList={false}
                  totalPages={totalPages}
                  isGlobalFilter={true}
                  className="custom-header-css"
                  theadClass="table-light "
                  divClass="table-responsive table-card mb-3"
                  tableClass="align-middle table-nowrap"
                  handlePageClick={handlePageChange}
                  isExtraFeature={true}
                  isAddOptions={false}
                  SearchPlaceholder="Search warehouse..."
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} centered>
        <ModalHeader className="bg-light p-3" toggle={() => setCreateModal(false)}>
          Add Warehouse
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Manager</Label>
            <Input
              value={form.manager}
              onChange={(e) => setForm((s) => ({ ...s, manager: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Status</Label>
            <Input
              type="select"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
            >
              <option>Active</option>
              <option>Maintenance</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Capacity</Label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm((s) => ({ ...s, capacity: e.target.value }))
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Current Stock</Label>
            <Input
              type="number"
              value={form.current_stock}
              onChange={(e) =>
                setForm((s) => ({ ...s, current_stock: e.target.value }))
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCreateModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={onCreateSubmit}>
            Add
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered>
        <ModalHeader className="bg-light p-3" toggle={() => setEditModal(false)}>
          Edit Warehouse
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Manager</Label>
            <Input
              value={form.manager}
              onChange={(e) => setForm((s) => ({ ...s, manager: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Status</Label>
            <Input
              type="select"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
            >
              <option>Active</option>
              <option>Maintenance</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Capacity</Label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm((s) => ({ ...s, capacity: e.target.value }))
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Current Stock</Label>
            <Input
              type="number"
              value={form.current_stock}
              onChange={(e) =>
                setForm((s) => ({ ...s, current_stock: e.target.value }))
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={onEditSubmit}>
            Update
          </Button>
        </ModalFooter>
      </Modal>

      {/* Details Modal */}
      <Modal
        className="mw-1650"

        isOpen={detailsModal}
        toggle={() => setDetailsModal(false)}
        centered
      >
        <ModalHeader className="bg-light p-3 mw-1650" toggle={() => setDetailsModal(false)}>
          {details?.warehouse?.name || "Warehouse"} <span className="text-muted ms-2">— Warehouse Details</span>
        </ModalHeader>

          <ModalBody className="bg-light">
            {!details?.warehouse ? (
              <>Loading…</>
            ) : (
              <>
                {/* Top info cards */}
                <Row className="g-3">
                  <Col md={4}>
                    <Card className="h-100 shadow-sm">
                      <CardBody className="d-flex align-items-center gap-3">
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title rounded fs-3 bg-primary-subtle">
                            <i className="text-primary ri-map-pin-line"></i>
                          </span>
                        </div>
                        <div>
                          <div className="text-muted small">Location</div>
                          <div className="fw-semibold">{details.warehouse.location}</div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100 shadow-sm">
                      <CardBody className="d-flex align-items-center gap-3">
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title rounded fs-3 bg-success-subtle">
                            <i className="text-success ri-user-3-line"></i>
                          </span>
                        </div>
                        <div>
                          <div className="text-muted small">Manager</div>
                          <div className="fw-semibold">{details.warehouse.manager}</div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100 shadow-sm">
                      <CardBody className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title rounded fs-3 bg-info-subtle">
                              <i className="text-info ri-shield-check-line"></i>
                            </span>
                          </div>
                          <div>
                            <div className="text-muted small">Status</div>
                            <div className="fw-semibold">
                              <Badge color={details.warehouse.status === "Active" ? "success" : "warning"} pill>
                                {details.warehouse.status}
                              </Badge>{" "}
                              <span className="text-muted">Operational</span>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* Utilization */}
                <Card className="mt-3 border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-1">Capacity Utilization</h5>
                      <div className="text-warning fw-semibold">
                        {pct(details.warehouse.current_stock, details.warehouse.capacity)}%
                      </div>
                    </div>
                    <div className="text-muted small mb-2">Current Utilization</div>
                    <Progress
                      value={pct(details.warehouse.current_stock, details.warehouse.capacity)}
                      className="progress-sm"
                      style={{ height: 10 }}
                    />

                    <Row className="text-center mt-3">
                      <Col md={4}>
                        <div className="fs-4 fw-semibold">{fmt(details.warehouse.current_stock)}</div>
                        <div className="text-muted small">Current Stock</div>
                      </Col>
                      <Col md={4}>
                        <div className="fs-4 fw-semibold text-success">
                          {fmt(Math.max(0, (details.warehouse.capacity || 0) - (details.warehouse.current_stock || 0)))}
                        </div>
                        <div className="text-muted small">Available Space</div>
                      </Col>
                      <Col md={4}>
                        <div className="fs-4 fw-semibold">{fmt(details.warehouse.capacity)}</div>
                        <div className="text-muted small">Total Capacity</div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Products table */}
                <Card className="mt-3 border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h5 className="mb-0">Products in Warehouse</h5>
                    </div>
                    <Table className="mb-0" hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th>Category</th>
                          <th className="text-end">Quantity</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.products.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No products
                            </td>
                          </tr>
                        ) : (
                          details.products.map((p) => {
                            const tag =
                              p.status === "IN_STOCK"
                                ? { color: "dark", text: "In Stock" }
                                : p.status === "IN_TRANSIT"
                                ? { color: "info", text: "In Transit" }
                                : p.status === "DISPOSED"
                                ? { color: "secondary", text: "Disposed" }
                                : { color: "success", text: "Received" };
                            return (
                              <tr key={p.id}>
                                <td className="fw-medium">{p.name}</td>
                                <td className="font-monospace">{p.sku}</td>
                                <td>{p.category}</td>
                                <td className="text-end fw-semibold">{fmt(p.quantity)}</td>
                                <td className="text-center">
                                  <Badge color={tag.color} pill>{tag.text}</Badge>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>

                {/* Bottom stats row */}
                <Row className="mt-3 g-3">
                  <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm">
                      <CardBody>
                        <h5 className="mb-3">Monthly Statistics</h5>
                        <Row className="gy-2">
                          <Col xs={7} className="text-muted">Items Received</Col>
                          <Col xs={5} className="text-end fw-semibold">{fmt(details.stats?.received || 0)}</Col>
                          <Col xs={7} className="text-muted">Items Shipped</Col>
                          <Col xs={5} className="text-end fw-semibold">{fmt(details.stats?.shipped || 0)}</Col>
                          <Col xs={7} className="text-muted">Transfers</Col>
                          <Col xs={5} className="text-end fw-semibold">{fmt(details.stats?.transfers || 0)}</Col>
                          <Col xs={7} className="text-muted">Returns</Col>
                          <Col xs={5} className="text-end fw-semibold">{fmt(details.stats?.returns || 0)}</Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm">
                      <CardBody>
                        <h5 className="mb-3">Performance Metrics</h5>
                        <Row className="gy-2">
                          <Col xs={7} className="text-muted">Accuracy Rate</Col>
                          <Col xs={5} className="text-end fw-semibold text-success">
                            {(details.metrics?.accuracy ?? 99.2)}%
                          </Col>
                          <Col xs={7} className="text-muted">Processing Time</Col>
                          <Col xs={5} className="text-end fw-semibold">
                            {(details.metrics?.processing_time ?? "2.3 hrs avg")}
                          </Col>
                          <Col xs={7} className="text-muted">Efficiency Score</Col>
                          <Col xs={5} className="text-end fw-semibold text-primary">
                            {(details.metrics?.efficiency ?? "A+")}
                          </Col>
                          <Col xs={7} className="text-muted">Last Audit</Col>
                          <Col xs={5} className="text-end fw-semibold">
                            {(details.metrics?.last_audit ?? "2 weeks ago")}
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* Actions (optional) */}
                <Row className="mt-3 g-3 hide">
                  <Col md={4}>
                    <Card className="p-3 h-100 shadow-sm">
                      <div className="fw-bold mb-2">Add Product</div>
                      <Input
                        placeholder="Product ID"
                        className="mb-2"
                        value={prodAction.product_id}
                        onChange={(e) => setProdAction((s) => ({ ...s, product_id: e.target.value }))}
                      />
                      <Input
                        placeholder="Quantity"
                        type="number"
                        className="mb-2"
                        value={prodAction.quantity}
                        onChange={(e) => setProdAction((s) => ({ ...s, quantity: e.target.value }))}
                      />
                      <Button color="primary" onClick={addProduct}>Add</Button>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="p-3 h-100 shadow-sm">
                      <div className="fw-bold mb-2">Move Product</div>
                      <Input
                        placeholder="Product ID"
                        className="mb-2"
                        value={prodAction.product_id}
                        onChange={(e) => setProdAction((s) => ({ ...s, product_id: e.target.value }))}
                      />
                      <Input
                        placeholder="Quantity"
                        type="number"
                        className="mb-2"
                        value={prodAction.quantity}
                        onChange={(e) => setProdAction((s) => ({ ...s, quantity: e.target.value }))}
                      />
                      <Input
                        placeholder="To Warehouse ID"
                        className="mb-2"
                        value={prodAction.to_warehouse_id}
                        onChange={(e) => setProdAction((s) => ({ ...s, to_warehouse_id: e.target.value }))}
                      />
                      <Button color="warning" onClick={moveProduct}>Move</Button>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="p-3 h-100 shadow-sm">
                      <div className="fw-bold mb-2">Dispose Product</div>
                      <Input
                        placeholder="Product ID"
                        className="mb-2"
                        value={prodAction.product_id}
                        onChange={(e) => setProdAction((s) => ({ ...s, product_id: e.target.value }))}
                      />
                      <Input
                        placeholder="Quantity"
                        type="number"
                        className="mb-2"
                        value={prodAction.quantity}
                        onChange={(e) => setProdAction((s) => ({ ...s, quantity: e.target.value }))}
                      />
                      <Button color="danger" onClick={removeProduct}>Remove</Button>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="secondary" onClick={() => setDetailsModal(false)}>Close</Button>
          </ModalFooter>
      </Modal>


      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default Warehouses;
