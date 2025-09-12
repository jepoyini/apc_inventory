// ================================================================
// FILE: src/pages/Users/RolesPermissions.jsx
// ================================================================
import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Card, CardBody, Input, Label, FormGroup, ListGroup, ListGroupItem
} from "reactstrap";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import PermissionCheckboxes from "./PermissionCheckboxes";

const defaultPermissions = {
  users: { add: false, edit: false, delete: false },
  inventory: { add: false, edit: false, delete: false },
  qr: false,
  reports: false
};

const RolesPermissions = ({ open, onClose }) => {
  const apipost = new APIClient();

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    id: null,
    name: "",
    permissions: defaultPermissions
  });

  // Load roles from backend
  const loadRoles = async () => {
    try {
      const r = await apipost.post("/roles/list", {});
      setRoles(r?.roles || []);
    } catch {
      toast.error("Failed to load roles");
    }
  };

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  const selectRole = (role) => {
    setSelectedRole(role.id);
    setRoleForm({
      id: role.id,
      name: role.name,
      permissions: role.permissions || defaultPermissions
    });
  };

  const handlePermissionChange = (section, key = null) => {
    setRoleForm((prev) => {
      const newPerms = { ...prev.permissions };

      // Make sure section exists
      if (!newPerms[section]) {
        newPerms[section] = key ? {} : false;
      }

      if (key) {
        newPerms[section][key] = !newPerms[section][key];
      } else {
        newPerms[section] = !newPerms[section];
      }

      return { ...prev, permissions: newPerms };
    });
  };

  const handleSave = async () => {
    try {
      await apipost.post("/roles/save", roleForm);
      toast.success("Role saved successfully");
      loadRoles();
    } catch {
      toast.error("Failed to save role");
    }
  };

  const handleAddNew = () => {
    setSelectedRole(null);
    setRoleForm({ id: null, name: "", permissions: defaultPermissions });
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>
        <i className="ri-shield-user-line me-2"></i> Roles & Permissions
      </ModalHeader>
      <ModalBody>
        <Row>
          {/* Left: Roles list */}
          <Col md={4}>
            <Card className="h-100">
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Existing Roles</h6>
                  <Button color="primary" size="sm" onClick={handleAddNew}>
                    <i className="ri-add-line"></i>
                  </Button>
                </div>
                <ListGroup flush>
                  {roles.map((r) => (
                    <ListGroupItem
                      key={r.id}
                      action
                      active={selectedRole === r.id}
                      onClick={() => selectRole(r)}
                    >
                      {r.name}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>

          {/* Right: Role form */}
          <Col md={8}>
            <Card className="h-100">
              <CardBody>
                <FormGroup className="mb-3">
                  <Label>Role Name</Label>
                  <Input
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    placeholder="e.g. Manager"
                  />
                </FormGroup>

                <h6 className="mb-2">Permissions</h6>
                <PermissionCheckboxes
                  permissions={roleForm.permissions || {}}
                  onChange={handlePermissionChange}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
        <Button color="success" onClick={handleSave}>
          <i className="ri-save-3-line me-1"></i> Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RolesPermissions;
