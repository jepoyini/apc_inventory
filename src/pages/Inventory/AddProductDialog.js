// ================================================================
// FILE: src/pages/Inventory/AddProductDialog.jsx
// ================================================================
import React, { useEffect, useState } from "react";
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
import Select from "react-select";
import classnames from "classnames";
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";

const AddProductDialog = ({ open, onClose, form, setForm, isEditing, editingId }) => {
  const apipost = new APIClient();
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => { if (activeTab !== tab) setActiveTab(tab); };

  // --------------------------
  // CATEGORY
  // --------------------------
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [inputCategoryValue, setInputCategoryValue] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apipost.post("/products/categories");
        const mapped = data.map((c) => ({ value: c.name, label: c.name }));
        setCategories(mapped);
        if (form.category) {
          setSelectedCategory({ value: form.category, label: form.category });
        }
      } catch (e) { console.error("Failed to load categories", e); }
    };
    fetchCategories();
  }, [form.category]);

  const handleCategoryChange = async (selected) => {
    if (selected) {
      setSelectedCategory(selected);
      handleChange("category", selected.value);

      const exists = categories.some((c) => c.value.toLowerCase() === selected.value.toLowerCase());
      if (!exists) {
        try {
          await apipost.post("/products/categories/create", { name: selected.value });
          const data = await apipost.post("/products/categories");
          setCategories(data.map((c) => ({ value: c.name, label: c.name })));
        } catch (err) { console.error("Failed to save new category", err); }
      }
    } else {
      setSelectedCategory(null);
      handleChange("category", "");
    }
  };

  const handleCategoryKeyDown = async (event) => {
    if (event.key === "Enter" && inputCategoryValue) {
      event.preventDefault();
      const exists = categories.some((c) => c.value.toLowerCase() === inputCategoryValue.toLowerCase());
      if (!exists) {
        try {
          await apipost.post("/products/categories/create", { name: inputCategoryValue });
          const newCategory = { value: inputCategoryValue, label: inputCategoryValue };
          setCategories((prev) => [...prev, newCategory]);
          setSelectedCategory(newCategory);
          handleChange("category", inputCategoryValue);
          setInputCategoryValue("");
        } catch (err) { console.error("Failed to save new category", err); }
      }
    }
  };

  // --------------------------
  // SIZE
  // --------------------------
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [inputSizeValue, setInputSizeValue] = useState("");

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const data = await apipost.post("/products/sizes");
        const mapped = data.map((s) => ({ value: s.name, label: s.name }));
        setSizes(mapped);
        if (form.size) {
          setSelectedSize({ value: form.size, label: form.size });
        }
      } catch (e) { console.error("Failed to load sizes", e); }
    };
    fetchSizes();
  }, [form.size]);

  const handleSizeChange = async (selected) => {
    if (selected) {
      setSelectedSize(selected);
      handleChange("size", selected.value);

      const exists = sizes.some((s) => s.value.toLowerCase() === selected.value.toLowerCase());
      if (!exists) {
        try {
          await apipost.post("/products/sizes/create", { name: selected.value });
          const data = await apipost.post("/products/sizes");
          setSizes(data.map((s) => ({ value: s.name, label: s.name })));
        } catch (err) { console.error("Failed to save new size", err); }
      }
    } else {
      setSelectedSize(null);
      handleChange("size", "");
    }
  };

  const handleSizeKeyDown = async (event) => {
    if (event.key === "Enter" && inputSizeValue) {
      event.preventDefault();
      const exists = sizes.some((s) => s.value.toLowerCase() === inputSizeValue.toLowerCase());
      if (!exists) {
        try {
          await apipost.post("/products/sizes/create", { name: inputSizeValue });
          const newSize = { value: inputSizeValue, label: inputSizeValue };
          setSizes((prev) => [...prev, newSize]);
          setSelectedSize(newSize);
          handleChange("size", inputSizeValue);
          setInputSizeValue("");
        } catch (err) { console.error("Failed to save new size", err); }
      }
    }
  };

  // --------------------------
  // FORM + SUBMIT
  // --------------------------

  // ✅ enhanced handleChange so that when price or markup_percent changes,
  //    warehouse_price is auto recalculated.
  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "price" || field === "markup_percent") {
        const priceNum = parseFloat(
          field === "price" ? value : updated.price
        ) || 0;
        const markupNum = parseFloat(
          field === "markup_percent" ? value : updated.markup_percent
        ) || 0;

        // warehouse price = price + (price * markup% / 100)
        const warehousePrice = priceNum + (priceNum * markupNum / 100);
        updated.warehouse_price = warehousePrice ? warehousePrice.toFixed(2) : "";
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.category) {
        alert("Please complete required fields.");
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price || 0),
        max_stock: Number(form.max_stock || 0),
        markup_percent: form.markup_percent !== undefined
          ? Number(form.markup_percent || 0)
          : undefined,
        warehouse_price: form.warehouse_price !== undefined
          ? Number(form.warehouse_price || 0)
          : undefined,
      };

      if (isEditing && editingId) {
        await apipost.post(`/products/${editingId}/update`, payload);
        toast.success("Product updated");
      } else {
        await apipost.post(`/products/create`, payload);
        toast.success("Product created");
      }

      onClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      console.error(e);
      toast.error(isEditing ? "Update failed" : "Create failed");
    }
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader className="bg-light p-3" toggle={onClose}>
        {isEditing ? "Edit Product" : "Add Product"}
      </ModalHeader>
      <ModalBody>
        <ToastContainer limit={5} />

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
        </Nav>

        <TabContent activeTab={activeTab} className="p-3">
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
              <Col md={6}>
                <FormGroup>
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    onInputChange={setInputCategoryValue}
                    onKeyDown={handleCategoryKeyDown}
                    inputValue={inputCategoryValue}
                    options={categories}
                    placeholder="Select or type category..."
                    isClearable
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Size</Label>
                  <Select
                    value={selectedSize}
                    onChange={handleSizeChange}
                    onInputChange={setInputSizeValue}
                    onKeyDown={handleSizeKeyDown}
                    inputValue={inputSizeValue}
                    options={sizes}
                    placeholder="Select or type size..."
                    isClearable
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Item Price</Label>
                  <Input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Markup %</Label>
                  <Input
                    type="number"
                    value={form.markup_percent || ""}
                    onChange={(e) => handleChange("markup_percent", e.target.value)}
                    placeholder="e.g. 20"
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Warehouse Price</Label>
                  <Input
                    type="number"
                    value={form.warehouse_price || ""}
                    onChange={(e) => handleChange("warehouse_price", e.target.value)}
                    placeholder="Auto-calculated or custom"
                  />
                </FormGroup>
              </Col>
            </Row>

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
