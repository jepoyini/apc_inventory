import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Container, Row, Col, Card, CardBody, Spinner, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";
import { useNavigate } from "react-router-dom";
import QRCodeGenerator from "./QRCodeGenerator";
import DeleteModal from "../../Components/Common/DeleteModal";



// reuse components
import AddProductDialog from "./AddProductDialog";
import ProductOverview from "./ProductOverview";
import ImageGallery from "./ImageGallery";
import QuantityManager from "./QuantityManager";
import TrackingHistory from "./TrackingHistory";
import ProductSpecs from "./ProductSpecs";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetails = () => {
  const navigate = useNavigate();    
  const { id } = useParams();
  const apipost = new APIClient();
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [productimages, setProductImages] = useState(null);
  const [producttracking, setProductTracking] = useState(null);
  const [productspecs, setProductSpecs] = useState(null);
  const [productId, setProductId] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  const [qrOpen, setQrOpen] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);
  const openQr = (product) => { 
    setQrProduct(product); 
    setQrOpen(true);
 };

// inside ProductDetails.jsx
const loadProduct = async () => {
  setLoading(true);
  try {
    debugger; 
    const res = await apipost.post(`/products/${id}/details`, {});
    setProduct(res?.product || null);
    setProductImages(res?.images || null);
    setProductId(res?.product?.id || null);
    setProductTracking(res?.tracking || null);
    setProductSpecs(res?.productspecs || null);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    debugger; 
  loadProduct();
}, [activeTab]);



  const handleDelete = () => {
    setDeleteModal(true);
    //onDelete(product.id);
  };

  const handleEdit = () => {
     navigate(`/products/${product.id}/edit`);
  };


  const onDeleteProduct = async () => {
    try {
      console.log(product.id)
      await apipost.post(`/products/${id}/delete`, {});
      toast.success("Product deleted");
      navigate("/inventory");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

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

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apipost.post(`/products/${id}/details`, {});
        setProduct(res?.product || null);
        setProductImages(res?.images || null);
        setProductId(res?.product.id || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner color="primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <CardBody className="text-center text-muted">Product not found</CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
<Row className="align-items-center mb-3">
  <Col className="d-flex flex-column">
    <a
      href="#!"
      onClick={(e) => {
        e.preventDefault();
        navigate("/inventory");
      }}
      className="d-inline-flex align-items-center mb-2 fw-semibold text-primary"
      style={{ fontSize: "0.9rem", textDecoration: "none" }}
    >
      <i
        className="ri-arrow-left-line me-2"
        style={{ fontSize: "1.1rem", color: "#0d6efd" }}
      ></i>
      <span style={{ color: "#0d6efd" }}>Back to Products</span>
    </a>

    <h2 className="mb-0">{product.name}</h2>
    <div className="text-muted">SKU: {product.sku}</div>
  </Col>
</Row>




        <Card className="mt-3">
          <CardBody>
            {/* Tabs */}
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  Overview
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => toggleTab("2")}
                >
                  Images
                </NavLink>
              </NavItem>
              {/* <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "3" })}
                  onClick={() => toggleTab("3")}
                >
                  Quantity
                </NavLink>
              </NavItem> */}
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "4" })}
                  onClick={() => toggleTab("4")}
                >
                  Tracking
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "5" })}
                  onClick={() => toggleTab("5")}
                >
                  Specs
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab} className="pt-3">
              <TabPane tabId="1">
                <ProductOverview
                    product={product}
                    onGenerateQr={() => openQr(product)}
                    onDelete={() => handleDelete()}
                    onEdit={() => handleEdit()}
                    reloadProduct={loadProduct}
                    active={activeTab === "1"}   
                />
              </TabPane>
              <TabPane tabId="2">
                <ImageGallery productId={productId} />
              </TabPane>
              <TabPane tabId="4">
                 <TrackingHistory events={producttracking || []} />
              </TabPane>
              <TabPane tabId="5">
                <ProductSpecs specs={productspecs || {}} />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>

        <QRCodeGenerator
            product={qrProduct}
            open={qrOpen}
            onClose={() => setQrOpen(false)}
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
        <DeleteModal
            show={deleteModal}
            onDeleteClick={onDeleteProduct}
            onCloseClick={() => setDeleteModal(false)}
        />
      </Container>
    </div>
  );
};

export default ProductDetails;
