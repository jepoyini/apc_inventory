// ================================================================
// FILE: src/pages/Users/Users.jsx
// ================================================================
import React, { useState, useEffect, useRef } from "react";
import {
  Card, CardBody, Col, Row, Container, Input, Button, Badge,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Spinner
} from "reactstrap";
import CountUp from "react-countup";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import UserCard from "./UserCard";
import AddUserDialog from "./AddUserDialog";
import UserDetailsModal from "./UserDetailsModal";
import RolesPermissions from "./RolesPermissions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hasPermission } from "../../helpers/permissions";
import Swal from "sweetalert2";

const Users = () => {
  document.title = "User Management | APC";
  const apipost = new APIClient();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, roles: 0, locked: 0 });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("grid"); // kept grid/list support

  // modals
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [rolesOpen, setRolesOpen] = useState(false);

  // filters
  const searchRef = useRef("");
  const roleRef = useRef("");
  const statusRef = useRef("");

  const authUser = JSON.parse(sessionStorage.getItem("authUser") || "{}");

  const load = async () => {
    setLoading(true);
    try {
      debugger;
      const r = await apipost.post("/users", {
        search: searchRef.current,
        role: roleRef.current,
        status: statusRef.current
      });
      setUsers(r?.users || []);
      setSummary(r?.summary || summary);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingUser(null);
    setCreateOpen(true);
  };

  const openEdit = (user) => {
    debugger; 
    setEditingUser(user);
    setCreateOpen(true);
  };

  const handleView = (id) => { setActiveUserId(id); setDetailsOpen(true); };

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noavatar.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  const handleDeleteUser = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will mark the user as deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
              debugger; 
        try {
          const r = await apipost.post("/users/delete", { id });
          Swal.fire("Deleted!", "User status has been set to deleted.", "success");
          load(); // ✅ refresh list
        } catch {
          Swal.fire("Error", "Failed to delete user.", "error");
        }
      }
    });
  };

  const columns = [
    { header: "ID", accessorKey: "id" },
    {
      header: "Name", accessorKey: "name",
      cell: (c) => (
        <div className="d-flex align-items-center" style={{ cursor: "pointer" }}
          onClick={() => handleView(c.row.original.id)}>
          <img src={prefixUrl(c.row.original.avatar)} alt="" width="40" height="40"
            className="me-2 rounded-circle" />
          <span>{c.getValue()}</span>
        </div>
      )
    },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role_name" },
    {
      header: "Status", accessorKey: "status",
      cell: (c) => (
        <Badge color={c.getValue() === "active" ? "success" : "secondary"}>
          {c.getValue()}
        </Badge>
      )
    },
    {
      header: "Action",
      cell: (c) => (
        <UncontrolledDropdown>
          <DropdownToggle tag="button" className="btn btn-sm btn-soft-primary">
            <i className="ri-more-fill" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => handleView(c.row.original.id)}>View</DropdownItem>

            {hasPermission(authUser, "users", "edit") && (
              <DropdownItem onClick={() => openEdit(c.row.original)}>Edit</DropdownItem>
            )}

            {hasPermission(authUser, "users", "delete") && (
              <DropdownItem onClick={() => handleDeleteUser(c.row.original.id)}>Delete</DropdownItem>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      )
    }
  ];

  return (
    <div className="page-content">
      <ToastContainer limit={1} />
      <Container fluid>
        {/* Header */}
        <Row className="mb-2">
          <Col><h2>User Management</h2></Col>
          <Col className="text-end">
            {hasPermission(authUser, "users", "add") && (
              <Button color="primary" onClick={openAdd}>
                <i className="ri-add-line me-1" /> Add User
              </Button>
            )}{" "}
            {hasPermission(authUser, "users", "edit") && (
              <Button color="warning" onClick={() => setRolesOpen(true)}>
                <i className="ri-shield-user-line me-1" /> Roles
              </Button>
            )}
          </Col>
        </Row>

        {/* Summary */}
        <Row className="g-3 mb-3">
          {/* Total Users */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Total Users</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-primary-subtle fs-3">
                    <i className="ri-team-line text-primary"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.total || 0} duration={2} />
              </h4>
            </CardBody></Card>
          </Col>

          {/* Active Users */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Active Users</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-success-subtle fs-3">
                    <i className="ri-checkbox-circle-line text-success"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.active || 0} duration={2} />
              </h4>
            </CardBody></Card>
          </Col>

          {/* Roles */}
          {/* <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Roles</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-info-subtle fs-3">
                    <i className="ri-shield-user-line text-info"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.roles || 0} duration={2} />
              </h4>
            </CardBody></Card>
          </Col> */}

          {/* Locked Users */}
          <Col xl={3} md={4}>
            <Card className="card-animate"><CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <p className="text-muted mb-0">Locked</p>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title rounded bg-danger-subtle fs-3">
                    <i className="ri-error-warning-line text-danger"></i>
                  </span>
                </div>
              </div>
              <h4 className="fs-22 fw-semibold mt-3 mb-0">
                <CountUp end={summary.locked || 0} duration={2} />
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

            {/* Collapsible filter form */}
            {filtersOpen && (
              <Row className="g-2">
                <Col md={3}>
                  <Input
                    type="select"
                    onChange={(e) => {
                      roleRef.current = e.target.value;
                      load();
                    }}
                  >
                    <option value="">All Roles</option>
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>Staff</option>
                  </Input>
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    onChange={(e) => {
                      statusRef.current = e.target.value;
                      load();
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                  </Input>
                </Col>
                <Col md={4}>
                  <Input
                    placeholder="Search users..."
                    onChange={(e) => {
                      searchRef.current = e.target.value;
                    }}
                  />
                </Col>                
                <Col md={2}>
                  <Button
                     className="btn btn-light waves-effect waves-light"
                    onClick={() => load()} // now applies current searchRef, roleRef, statusRef
                    disabled={loading}
                  >
                    <i className="ri-refresh-line me-1"></i> Refresh
                  </Button>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>

        {/* Row Count */}
        <Row className="mb-2">
          <Col>
            <small className="text-muted">
              Showing <strong>{users.length}</strong> {users.length === 1 ? "user" : "users"}
            </small>
          </Col>
        </Row>

        {/* Spinner or Table/Grid */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "250px" }}>
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
          </div>
        ) : (
          view === "list" ? (
            <Card><CardBody>
              <TableContainer
                columns={columns}
                data={users}
                loading={loading}
                theadClass="table-light"
                tableClass="align-middle table-nowrap"
                divClass="table-responsive"
              />
            </CardBody></Card>
          ) : (
            <Row className="g-3">
              {users.map((u) => (
                <Col xl={3} key={u.id}>
                  <UserCard
                    user={u}
                    onView={() => handleView(u.id)}
                    onEdit={() => openEdit(u)}
                    onDelete={() => handleDeleteUser(u.id)} 
                  />
                </Col>
              ))}
            </Row>
          )
        )}

        {/* Modals */}
        <UserDetailsModal
          userId={activeUserId}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />

        <AddUserDialog
          open={createOpen}
          onClose={(refresh) => {
            setCreateOpen(false);
            if (refresh) load();
          }}
          editingUser={editingUser}
        />

        <RolesPermissions open={rolesOpen} onClose={() => setRolesOpen(false)} />
      </Container>
    </div>
  );
};

export default Users;
