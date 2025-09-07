// ================================================================
// FILE: src/pages/Inventory/AddProductDialog.jsx
// ================================================================
import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import ImageGallery from "./ImageGallery"; // use only if product is saved

const AddProductDialog = ({ open, onClose, onSubmit, form, setForm, isEditing, editingId }) => {
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleChange = (field, value) => {
    setForm((s) => ({ ...s, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.category) {
      alert("Please complete required fields.");
      return;
    }
    onSubmit();
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader className="bg-light p-3" toggle={onClose}>
        {isEditing ? "Edit Product" : "Add Product"}
      </ModalHeader>
      <ModalBody>
        {/* Tabs Header */}
        <Nav tabs className="nav-tabs-custom nav-success">
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "1" })}
              onClick={() => toggleTab("1")}
            >
              Overview
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "2" })}
              onClick={() => toggleTab("2")}
            >
              Images
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "3" })}
              onClick={() => toggleTab("3")}
            >
              Quantity
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "4" })}
              onClick={() => toggleTab("4")}
            >
              Tracking
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({ active: activeTab === "5" })}
              onClick={() => toggleTab("5")}
            >
              Specs
            </NavLink>
          </NavItem>
        </Nav>

        {/* Tabs Content */}
        <TabContent activeTab={activeTab} className="p-3">
          {/* Overview Tab */}
          <TabPane tabId="1">
            <FormGroup>
              <Label>Product Name</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Premium Wooden Plaque"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="e.g., APF747"
              />
            </FormGroup>
            <FormGroup>
              <Label>Category</Label>
              <Input
                type="select"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="">Select Category</option>
                <option>Awards</option>
                <option>Trophies</option>
                <option>Nameplates</option>
                <option>Plaques</option>
                <option>Certificates</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Status</Label>
              <Input
                type="select"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Input>
            </FormGroup>
          </TabPane>

          {/* Images Tab */}
          <TabPane tabId="2">
            {isEditing && editingId ? (
              <ImageGallery productId={editingId} images={form.images || []} />
            ) : (
              <div className="text-muted">
                Images can be uploaded <strong>after saving</strong> the product.
              </div>
            )}
          </TabPane>

          {/* Quantity Tab */}
          <TabPane tabId="3">
            <FormGroup>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={form.quantity || ""}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Reorder Point</Label>
              <Input
                type="number"
                value={form.reorder_point || ""}
                onChange={(e) => handleChange("reorder_point", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Default Warehouse</Label>
              <Input
                type="select"
                value={form.default_warehouse_id || ""}
                onChange={(e) => handleChange("default_warehouse_id", e.target.value)}
              >
                <option value="">Select Warehouse</option>
                <option value="1">Main Warehouse</option>
                <option value="2">Secondary Warehouse</option>
              </Input>
            </FormGroup>
          </TabPane>

          {/* Tracking Tab */}
          <TabPane tabId="4">
            <div className="text-muted small">
              Tracking options (QR codes, serial numbers, lot info) will be managed here.
            </div>
          </TabPane>

          {/* Specs Tab */}
          <TabPane tabId="5">
            <FormGroup>
              <Label>Brand</Label>
              <Input
                value={form.brand || ""}
                onChange={(e) => handleChange("brand", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Model</Label>
              <Input
                value={form.model || ""}
                onChange={(e) => handleChange("model", e.target.value)}
              />
            </FormGroup>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {isEditing ? "Update Product" : "Save Product"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddProductDialog;
