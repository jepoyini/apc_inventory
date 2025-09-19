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
  Row,
  Col
} from "reactstrap";
import classnames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";


const AddProductDialog = ({ open, onClose,  form, setForm, isEditing, editingId  }) => {

  const apipost = new APIClient();

  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleChange = (field, value) => {
    setForm((s) => ({ ...s, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      debugger; 
      if (!form.name || !form.category) {
        alert("Please complete required fields.");
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price || 0),
        cost: Number(form.cost || 0),
        default_warehouse_id: form.default_warehouse_id
          ? Number(form.default_warehouse_id)
          : null,
        reorder_point: Number(form.reorder_point || 0),
        max_stock: Number(form.max_stock || 0),
      };

      if (isEditing && editingId) {
        await apipost.post(`/products/${editingId}/update`, payload);
        toast.success("Product updated");
      } else {
        await apipost.post(`/products/create`, payload);
        toast.success("Product created");
      }

      onClose();

      // reload page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
      toast.error(isEditing ? "Update failed" : "Create failed");
    }
  };

const handleSubmit2 = () => {
  debugger; 
  if (!form.name || !form.category) {
    alert("Please complete required fields.");
    return;
  }
  if (typeof onSubmit === "function") {
    onSubmit();   // ✅ safe call
  } else {
    console.error("onSubmit prop is missing or not a function");
  }
};

  const handleSubmit3 = () => {
    debugger;
    if (!form.name || !form.category) {
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
        <ToastContainer limit={5} />
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
              Specifications
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
                value={form.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Premium Wooden Plaque"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>

            <Row>
              {/* <Col md={6}>
                <FormGroup>
                  <Label>Serial/SKU</Label>
                  <Input
                    value={form.sku || ""}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="e.g., APF747"
                  />
                </FormGroup>
              </Col> */}
              <Col md={6}>
                <FormGroup>
                  <Label>Category</Label>
                  <Input
                    type="select"
                    value={form.category || ""}
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
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Status</Label>
                  <Input
                    type="select"
                    value={form.status || "active"}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Brand</Label>
                  <Input
                    value={form.brand || ""}
                    onChange={(e) => handleChange("brand", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Model</Label>
                  <Input
                    value={form.model || ""}
                    onChange={(e) => handleChange("model", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Reorder Point</Label>
                  <Input
                    type="number"
                    value={form.reorder_point || ""}
                    onChange={(e) => handleChange("reorder_point", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Max Stock</Label>
                  <Input
                    type="number"
                    value={form.max_stock || ""}
                    onChange={(e) => handleChange("max_stock", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          </TabPane>

          {/* Specifications Tab */}
          <TabPane tabId="2">
            <h6 className="text-muted">Dimensions</h6>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Length</Label>
                  <Input
                    value={form.length || ""}
                    onChange={(e) => handleChange("length", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Width</Label>
                  <Input
                    value={form.width || ""}
                    onChange={(e) => handleChange("width", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Height</Label>
                  <Input
                    value={form.height || ""}
                    onChange={(e) => handleChange("height", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Weight</Label>
                  <Input
                    value={form.weight || ""}
                    onChange={(e) => handleChange("weight", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            <h6 className="mt-4 text-muted">Technical</h6>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Material</Label>
                  <Input
                    value={form.material || ""}
                    onChange={(e) => handleChange("material", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Base</Label>
                  <Input
                    value={form.base || ""}
                    onChange={(e) => handleChange("base", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Engraving</Label>
                  <Input
                    value={form.engraving || ""}
                    onChange={(e) => handleChange("engraving", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Packaging</Label>
                  <Input
                    value={form.packaging || ""}
                    onChange={(e) => handleChange("packaging", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

            <h6 className="mt-4 text-muted">Additional Info</h6>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Supplier</Label>
                  <Input
                    value={form.supplier || ""}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Manufactured</Label>
                  <Input
                    value={form.manufactured || ""}
                    onChange={(e) => handleChange("manufactured", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Warranty</Label>
                  <Input
                    value={form.warranty || ""}
                    onChange={(e) => handleChange("warranty", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>

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
