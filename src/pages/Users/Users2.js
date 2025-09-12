// src/pages/Users/index.jsx
import React, { useMemo, useState } from "react";
import {
  Card, CardHeader, CardBody,
  Container, Row, Col,
  Button, Input
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const MOCK_USERS = [
  {
    id: 1,
    name: "Bryan Hamer",
    email: "owner@americanplaque.com",
    role: "Owner",
    status: "Active",
    warehouse: "Main Warehouse",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "manager@americanplaque.com",
    role: "Manager",
    status: "Active",
    warehouse: "Main Warehouse",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "staff@americanplaque.com",
    role: "Staff",
    status: "Active",
    warehouse: "Japan Warehouse",
  },
];

const roleBadge = (role) =>
  role === "Owner"
    ? "badge bg-purple-subtle text-purple"
    : role === "Manager"
    ? "badge bg-primary-subtle text-primary"
    : "badge bg-success-subtle text-success";

const statusBadge = (status) =>
  status === "Active"
    ? "badge bg-success-subtle text-success"
    : "badge bg-danger-subtle text-danger";

const Users = () => {
  document.title = "User Management | APC Inventory";
  const [users] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }, [users, search]);

  const stats = useMemo(
    () => ({
      owners: users.filter((u) => u.role === "Owner").length,
      managers: users.filter((u) => u.role === "Manager").length,
      staff: users.filter((u) => u.role === "Staff").length,
      active: users.filter((u) => u.status === "Active").length,
    }),
    [users]
  );

  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="page-content">
      <Container fluid>
        {/* Header + CTA */}
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
          <div>
            <BreadCrumb title="User Management" pageTitle="Dashboard" url="/dashboard" />
            <div className="text-muted">Manage team members and their access permissions</div>
          </div>
          <Button color="dark">
            <i className="ri-user-add-line me-2" />
            Add User
          </Button>
        </div>

        {/* Summary cards */}
        <Row className="mt-3 g-3">
          <Col md={6} xl={3}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div className="text-muted fw-medium">Total Users</div>
                <i className="ri-group-line text-muted" />
              </CardHeader>
              <CardBody>
                <div className="fs-3 fw-semibold">{users.length}</div>
                <div className="text-success small mt-1">{stats.active} active</div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} xl={3}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div className="text-muted fw-medium">Owners</div>
                <i className="ri-shield-keyhole-line text-purple" />
              </CardHeader>
              <CardBody>
                <div className="fs-3 fw-semibold">{stats.owners}</div>
                <div className="small text-purple">full access</div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} xl={3}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div className="text-muted fw-medium">Managers</div>
                <i className="ri-shield-user-line text-primary" />
              </CardHeader>
              <CardBody>
                <div className="fs-3 fw-semibold">{stats.managers}</div>
                <div className="small text-primary">management access</div>
              </CardBody>
            </Card>
          </Col>
          <Col md={6} xl={3}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div className="text-muted fw-medium">Staff</div>
                <i className="ri-shield-check-line text-success" />
              </CardHeader>
              <CardBody>
                <div className="fs-3 fw-semibold">{stats.staff}</div>
                <div className="small text-success">standard access</div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Search */}
        <Card className="mt-3">
          <CardBody>
            <div className="position-relative">
              <i className="ri-search-line position-absolute top-50 translate-middle-y ms-3 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name, email, or role..."
                className="ps-5"
              />
            </div>
          </CardBody>
        </Card>

        {/* User cards */}
        <Row className="g-3 mt-1">
          {filtered.map((u) => (
            <Col md={6} lg={4} key={u.id}>
              <Card className="h-100 hover-shadow">
                <CardBody>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="avatar-lg">
                      <span className="avatar-title rounded-circle bg-primary-subtle text-primary fs-5">
                        {initials(u.name)}
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{u.name}</h6>
                      <div className="text-muted small">{u.email}</div>
                    </div>
                    <span className={statusBadge(u.status)}>{u.status}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={roleBadge(u.role)}>{u.role}</span>
                  </div>

                  {u.warehouse && (
                    <div className="text-muted small mb-2">
                      <i className="ri-map-pin-2-line me-1" />
                      {u.warehouse}
                    </div>
                  )}

                  <hr className="my-2" />
                  <div className="text-muted small">
                    <div>User ID: {u.id}</div>
                    <div>
                      Access Level:{" "}
                      {u.role === "Owner"
                        ? "Full System Access"
                        : u.role === "Manager"
                        ? "Management Functions"
                        : "Standard Operations"}
                    </div>
                  </div>

                  <div className="d-flex gap-2 pt-3">
                    <Button color="light" outline className="flex-grow-1">
                      <i className="ri-edit-line me-1" />
                      Edit
                    </Button>
                    <Button color="light" outline className="text-danger">
                      <i className="ri-delete-bin-6-line" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {filtered.length === 0 && (
          <div className="text-center text-muted py-5">No users found matching your search</div>
        )}

        {/* Team Overview */}
        <Card className="mt-3">
          <CardHeader>
            <h6 className="mb-0">Team Overview</h6>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              <Col md={6} lg={4}>
                <div className="p-3 rounded border border-purple-200 bg-purple-subtle">
                  <div className="fw-medium text-purple mb-1">Bryan Hamer - Owner</div>
                  <div className="small text-purple">
                    Full system access with complete administrative privileges. Manages overall
                    operations and strategic decisions.
                  </div>
                </div>
              </Col>
              <Col md={6} lg={4}>
                <div className="p-3 rounded border border-primary-200 bg-primary-subtle">
                  <div className="fw-medium text-primary mb-1">Sarah Johnson - Manager</div>
                  <div className="small text-primary">
                    Manages daily operations, inventory oversight, and team coordination at the
                    main warehouse.
                  </div>
                </div>
              </Col>
              <Col md={6} lg={4}>
                <div className="p-3 rounded border border-success-200 bg-success-subtle">
                  <div className="fw-medium text-success mb-1">Mike Chen - Staff</div>
                  <div className="small text-success">
                    Handles inventory operations, QR scanning, and product management at the Japan
                    warehouse.
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Users;
