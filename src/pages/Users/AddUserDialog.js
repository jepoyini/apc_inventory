// ================================================================
// FILE: src/pages/Users/AddUserDialog.jsx
// ================================================================
import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Input, Label, FormGroup
} from "reactstrap";
import { toast } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";

// Simple country list (you can expand/replace with full ISO list if needed)
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (Swaziland)", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const AddUserDialog = ({ open, onClose, editingUser = null }) => {
  const apipost = new APIClient();

  const [form, setForm] = useState({
    id: null,
    username: "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zipcode: "",
    password: "",
    confirmPassword: "",
    role_id: "",
    warehouse_id: "",   // ✅ NEW
    status: "active",
    avatar: null,
  });

  const [roles, setRoles] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // ✅ NEW

  // Load roles from backend
  const loadRoles = async () => {
    try {
      const r = await apipost.post("/roles/list", {});
      setRoles(r?.roles || []);
    } catch {
      toast.error("Failed to load roles");
    }
  };

  // ✅ Load warehouses from backend
  const loadWarehouses = async () => {
    try {
      const r = await apipost.post("/warehouses/list", {});
      setWarehouses(r?.warehouses || []);
    } catch {
      toast.error("Failed to load warehouses");
    }
  };

  useEffect(() => {
    if (open) {
      loadRoles();
      loadWarehouses(); // ✅ also load warehouses

      if (editingUser) {
        setForm({
          id: editingUser.id,
          username: editingUser.username || "",
          firstname: editingUser.firstname || "",
          lastname: editingUser.lastname || "",
          phone: editingUser.phone || "",
          email: editingUser.email || "",
          address: editingUser.address || "",
          city: editingUser.city || "",
          country: editingUser.country || "",
          zip: editingUser.zip || "",
          password: "",
          confirmPassword: "",
          role_id: editingUser.role_id || "",
          warehouse_id: editingUser.warehouse_id || "", // ✅ fill from user
          status: editingUser.status || "active",
          avatar: null,
        });
      } else {
        setForm({
          id: null,
          username: "",
          firstname: "",
          lastname: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          country: "",
          zip: "",
          password: "",
          confirmPassword: "",
          role_id: "",
          warehouse_id: "", // ✅ reset
          status: "active",
          avatar: null,
        });
      }
    }
  }, [open, editingUser]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, avatar: e.target.files[0] }));
  };

  const handleSave = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      debugger;
      const fd = new FormData();
      Object.keys(form).forEach((k) => {
        if (form[k] !== null && form[k] !== "") {
          fd.append(k, form[k]);
        }
      });
 
      await apipost.post("/users/save", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("User saved successfully");
      onClose(true); // refresh list
    } catch {
      toast.error("Failed to save user");
    }
  };

  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noavatar.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  return (
    <Modal isOpen={open} toggle={() => onClose(false)} size="lg" centered>
      <ModalHeader toggle={() => onClose(false)}>
        {form.id ? "Edit User" : "Add User"}
      </ModalHeader>
      <ModalBody>
        <Row className="g-3">
          {/* Avatar */}
          <Col md={12} className="text-center mb-3">
            <img
              src={
                form.avatar
                  ? URL.createObjectURL(form.avatar)
                  : prefixUrl(editingUser?.avatar)
              }
              alt="Avatar"
              className="rounded-circle mb-2"
              width="100"
              height="100"
              style={{ objectFit: "cover" }}
            />
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </Col>

          {/* Username */}
          <Col md={8}>
            <FormGroup>
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Unique username"
                disabled={!!form.id} // ✅ disable if editing
              />
            </FormGroup>
          </Col>

          {/* ✅ Warehouse Dropdown (after Username) */}
          <Col md={4}>
            <FormGroup>
              <Label>Warehouse</Label>
              <Input
                type="select"
                value={form.warehouse_id || ""}
                onChange={(e) => handleChange("warehouse_id", e.target.value)}
              >
                <option value="">-- Select Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name || w.warehouse_name || `Warehouse #${w.id}`}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Firstname */}
          <Col md={6}>
            <FormGroup>
              <Label>Firstname</Label>
              <Input
                value={form.firstname}
                onChange={(e) => handleChange("firstname", e.target.value)}
                placeholder="Firstname"
              />
            </FormGroup>
          </Col>

          {/* Lastname */}
          <Col md={6}>
            <FormGroup>
              <Label>Lastname</Label>
              <Input
                value={form.lastname}
                onChange={(e) => handleChange("lastname", e.target.value)}
                placeholder="Lastname"
              />
            </FormGroup>
          </Col>

          {/* Phone */}
          <Col md={6}>
            <FormGroup>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone number"
              />
            </FormGroup>
          </Col>

          {/* Email */}
          <Col md={6}>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email address"
              />
            </FormGroup>
          </Col>

          {/* Address */}
          <Col md={12}>
            <FormGroup>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address"
              />
            </FormGroup>
          </Col>

          {/* City */}
          <Col md={6}>
            <FormGroup>
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
              />
            </FormGroup>
          </Col>

          {/* Country */}
          <Col md={4}>
            <FormGroup>
              <Label>Country</Label>
              <Input
                type="select"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              >
                <option value="">-- Select Country --</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Zipcode */}
          <Col md={2}>
            <FormGroup>
              <Label>Zipcode</Label>
              <Input
                value={form.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
                placeholder="Zip"
              />
            </FormGroup>
          </Col>

          {/* Password */}
          <Col md={6}>
            <FormGroup>
              <Label>New Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="New password"
              />
            </FormGroup>
          </Col>

          {/* Confirm Password */}
          <Col md={6}>
            <FormGroup>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Confirm password"
              />
            </FormGroup>
          </Col>

          {/* Role */}
          <Col md={6}>
            <FormGroup>
              <Label>Role</Label>
              <Input
                type="select"
                value={form.role_id}
                onChange={(e) => handleChange("role_id", e.target.value)}
              >
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          {/* Status */}
          <Col md={6}>
            <FormGroup>
              <Label>Status</Label>
              <Input
                type="select"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="locked">Locked</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={() => onClose(false)}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          <i className="ri-save-3-line me-1"></i> Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddUserDialog;
