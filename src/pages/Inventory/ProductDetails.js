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
  const [productname, setProductName] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

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
    const res = await apipost.post(`/products/${id}/details`, {});
    debugger;
    setProduct(res?.product || null);
    setProductName(res?.product?.name || null);
    setProductImages(res?.images || null);
    setProductId(res?.product?.id || null);
    setProductTracking(res?.tracking || null);
    setProductSpecs(res?.productspecs || null);

    // ✅ load items tied to this product
    if (res?.items) {
      setItems(res.items);
    }

    // ✅ load warehouses for dropdown
    const w = await apipost.post(`/warehouses/list`, {});
    setWarehouses(w?.warehouses || []);
    
    
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadProduct();
}, [activeTab]);

// update items callback
const handleItemsChange = async (newItems) => {
  try {
    setItems(newItems); // update UI immediately
    await apipost.post(`/items/sync`, {
      product_id: productId,
      items: newItems,
    });
    toast.success("Items updated");
  } catch (e) {
    console.error(e);
    toast.error("Failed to save items");
  }
};


  const handleDelete = () => {
    setDeleteModal(true);
    //onDelete(product.id);
  };

  const handleEdit = () => {
    debugger; 
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
    max_stock: "",
    brand: "",
    model: "",
    description: "",
    tags: [],
    length: "",
    width: "",
    height: "",
    weight: "",
    material: "",
    base: "",
    engraving: "",
    packaging: "",
    supplier: "",
    manufactured: "",
    warranty: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const openAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setCreateForm({
      sku: "",
      name: "",
      category: "",
      status: "active",
      price: "",
      cost: "",
      default_warehouse_id: "",
      reorder_point: "",
      max_stock: "",
      brand: "",
      model: "",
      description: "",
      tags: [],
      length: "",
      width: "",
      height: "",
      weight: "",
      material: "",
      base: "",
      engraving: "",
      packaging: "",
      supplier: "",
      manufactured: "",
      warranty: "",
    });
    setCreateOpen(true);
  };

  const closeAdd = () => setCreateOpen(false);

  const openEdit = (row) => {
    setIsEditing(true);
    setEditingId(row.id);
    setCreateForm({
      sku: row.sku || "",
      name: row.name || "",
      category: row.category || "",
      status: row.status || "active",
      price: row.price ?? "",
      cost: row.cost ?? "",
      default_warehouse_id: row.default_warehouse_id ?? "",
      reorder_point: row.reorder_point ?? "",
      max_stock: row.max_stock ?? "",
      brand: row.brand || "",
      model: row.model || "",
      description: row.description || "",
      tags: row.tags || [],
      length: row.length || "",
      width: row.width || "",
      height: row.height || "",
      weight: row.weight || "",
      material: row.material || "",
      base: row.base || "",
      engraving: row.engraving || "",
      packaging: row.packaging || "",
      supplier: row.supplier || "",
      manufactured: row.manufactured || "",
      warranty: row.warranty || "",
    });
    setCreateOpen(true);
  };

const submitAdd = async () => {
  debugger; 
  try {
    const payload = { ...createForm };
    if (isEditing && editingId) {
      await apipost.post(`/products/${editingId}/update`, payload);
      toast.success("Product updated");
    } else {
      await apipost.post(`/products/create`, payload);
      toast.success("Product created");
    }
    closeAdd();
    setTimeout(() => window.location.reload(), 1000);
  } catch (e) {
    console.error(e);
    toast.error(isEditing ? "Update failed" : "Create failed");
  }
};

  const submitAdd2 = async () => {
    try {
      const payload = {
        ...createForm,
        price: Number(createForm.price || 0),
        cost: Number(createForm.cost || 0),
        default_warehouse_id: createForm.default_warehouse_id ? Number(createForm.default_warehouse_id) : null,
        reorder_point: Number(createForm.reorder_point || 0),
        max_stock: Number(createForm.max_stock || 0)
      };
      debugger; 
      if (isEditing && editingId) {
        await apipost.post(`/products/${editingId}/update`, payload);
        toast.success("Product updated");
      } else {
        await apipost.post(`/products/create`, payload);
        toast.success("Product created");
      }
      setIsEditing(false); 
      setEditingId(null); 
      closeAdd(); 
      //load(currentPage);
      
    // ✅ delay reload by 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 1000);

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
      <Col>
        <div className="d-flex justify-content-between align-items-center w-100">
          {/* Left side: Title + SKU */}
          <div>
            <h2 className="mb-0">{product.name}</h2>

            {/* ▼▼▼ ADDED: Markup + Warehouse Price + Base Price (Admin Only) ▼▼▼ */}
            <div className="text-muted small mt-1">

              {product.sku && <div>SKU: {product.sku}</div>}

              {/* Only show if user is Admin */}
              {JSON.parse(sessionStorage.getItem("authUser") || "{}").role === "Admin" && (
                <>
                  {product.price !== undefined && (
                    <div>
                      <i className="ri-price-tag-3-line me-1"></i>
                      Base Price: <strong>${Number(product.price).toFixed(2)}</strong>
                    </div>
                  )}

                  {product.markup_percent !== undefined && (
                    <div>
                      <i className="ri-percent-line me-1"></i>
                      Markup: <strong>{product.markup_percent}%</strong>
                    </div>
                  )}

                  {product.warehouse_price !== undefined && (
                    <div>
                      <i className="ri-store-2-line me-1"></i>
                      Warehouse Price:{" "}
                      <strong className="text-success">
                        ${Number(product.warehouse_price).toFixed(2)}
                      </strong>
                    </div>
                  )}
                </>
              )}

            </div>
            {/* ▲▲▲ END ADMIN-ONLY BLOCK ▲▲▲ */}

          </div>

          {/* Right side: Actions */}
          <div className="d-flex gap-2">
            <Button
              color="light"
              size="sm"
              onClick={() => navigate("/inventory")}
              className="d-flex align-items-center shadow-sm"
            >
              <i className="ri-arrow-left-line me-1"></i>
              Back to List
            </Button>
          </div>
        </div>
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
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "3" })}
                  onClick={() => toggleTab("3")}
                >
                  Items
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "4" })}
                  onClick={() => toggleTab("4")}
                >
                  Tracking
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
                    specs={productspecs || {}}
                    active={activeTab === "1"}   
                />
              </TabPane>
              <TabPane tabId="2">
                <ImageGallery productId={productId} />
              </TabPane>
              <TabPane tabId="3">
                <TabPane tabId="3">
                  <QuantityManager
                    productId={productId}
                    productname = {productname}
                    items={items}
                    onItemsChange={handleItemsChange}
                    warehouses={warehouses}
                    readonly={false}
                  />
                </TabPane>
              </TabPane>              
              <TabPane tabId="4">
                 <TrackingHistory events={producttracking || []} load={loadProduct}   />
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
          onSubmit={submitAdd}
          onClose={closeAdd}
          form={createForm}
          setForm={setCreateForm}
          isEditing={isEditing}
          editingId={editingId}
        />
        <DeleteModal
            show={deleteModal}
            onDeleteClick={onDeleteProduct}
            onCloseClick={() => setDeleteModal(false)}
        />
        <ToastContainer limit={5} />
      </Container>
    </div>
  );
};

export default ProductDetails;
