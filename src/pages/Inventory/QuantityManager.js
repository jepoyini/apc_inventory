
  // src/pages/Inventory/QuantityManager.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import QRCodeGenerator from "./QRCodeGenerator";
import {
  Card, CardBody, CardHeader, CardTitle,
  Button, Input, Label, Modal, ModalHeader,
  ModalBody, ModalFooter, Table, Badge, Row, Col, FormGroup
} from "reactstrap";
import {
  RiAddLine, RiArchiveLine,
  RiMapPinLine, RiCalendarLine, RiEditBoxLine, RiQrCodeLine
} from "react-icons/ri";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";

const QuantityManager = ({ productId, productname, readonly = false }) => {
  const obj = JSON.parse(sessionStorage.getItem("authUser"));
  const apipost = new APIClient();
  const [qrModal, setQrModal] = useState(false);
  const [qrProducts, setQrProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lastBatch, setLastBatch] = useState("");

  // modals
  const [transferModal, setTransferModal] = useState(false);
  const [addModal, setAddModal] = useState(false);

  const [targetWarehouse, setTargetWarehouse] = useState("");

  const [batchModal, setBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batchNumber: lastBatch,
    warehouse_id: "1",
    qty: 1,
    condition: "new",
    status: "available"
  });

  const [statusModal, setStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "",
    warehouse_id: "",
    notes: ""
  });
  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      toast.warning("Please select at least one item to delete");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selected.length} item(s). This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete them!",
    });

    if (!result.isConfirmed) return;

    try {
      await apipost.post(`/products/${productId}/items/delete`, {
        uid: obj.id,
        product_id: productId,
        item_ids: selected
      });
      toast.success(`${selected.length} item(s) deleted`);
      setSelected([]);
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Bulk delete failed");
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusForm.status) {
      toast.warning("Please select a status");
      return;
    }
    try {
      await apipost.post(`/products/${productId}/items/update`, {
        uid: obj.id,
        product_id: productId,
        item_ids: selected,
        status: statusForm.status,
        notes: statusForm.notes,
        warehouse_id: statusForm.warehouse_id
      });
      toast.success("Item updated");
      setStatusModal(false);
      setSelected([]);
      setStatusForm({ status: "", notes: "", warehouse_id: "" });
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Item update failed");
    }
  };

  const handleAddBatch = async () => {
    if (!batchForm.warehouse_id || !batchForm.qty) {
      toast.warning("Warehouse and Quantity are required");
      return;
    }
    try {
      await apipost.post(`/products/${productId}/items/add`, {
        uid: obj.id,
        product_id: productId,
        batch: batchForm.batchNumber,
        warehouse_id: batchForm.warehouse_id,
        qty: Number(batchForm.qty),
        condition: newItem.condition,
        status: newItem.status,
        acquired_at: newItem.acquiredDate,
        notes: newItem.notes
      });

      // ✅ remember last batch
      setLastBatch(batchForm.batchNumber);

      toast.success("Batch added");
      setBatchModal(false);

      setBatchForm({
        batchNumber: batchForm.batchNumber,
        warehouse_id: batchForm.warehouse_id,
        qty: 1,
        condition: newItem.condition,
        status: newItem.status
      });
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Add batch failed");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CREATED": return <Badge className="created-status mw-70">CREATED</Badge>;
      case "AVAILABLE": return <Badge color="success" className="mw-70">AVAILABLE</Badge>;
      case "IN_TRANSIT": return <Badge color="info" className="mw-70">IN-TRANSIT</Badge>;
      case "IN_STOCK": return <Badge color="primary" className="mw-70">IN-STOCK</Badge>;
      case "SOLD": return <Badge color="dark" className="mw-70">SOLD</Badge>;
      case "DISPOSED": return <Badge color="danger" className="mw-70">DISPOSED</Badge>;
      case "RETURNED": return <Badge className="returned-status mw-70">RETURNED</Badge>;
      case "CHECK_IN": return <Badge className="returned-status mw-70">CHECK-IN</Badge>;
      default: return <Badge color="secondary" className="mw-70">{status}</Badge>;
    }
  };

  useEffect(() => {
    if (!statusModal) {
      setStatusForm({ status: "", notes: "", warehouse_id: "" });
      setTargetWarehouse("");
    }
  }, [statusModal]);

  const [newItem, setNewItem] = useState({
    serialNumber: "",
    batchNumber: "",
    warehouse_id: "1",
    condition: "new",
    status: "available",
    acquiredDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: ""
  });

  // 🔹 Load items
  const loadItems = async () => {
    try {
      const r = await apipost.post(`/products/${productId}/items`, {});
      setItems(r?.items || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load items");
    }
  };

  // 🔹 Load warehouses
  const loadWarehouses = async () => {
    try {
      const r = await apipost.post(`/warehouses/list`, { page: 1, limit: 100 });
      setWarehouses(r?.warehouses || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load warehouses");
    }
  };

  useEffect(() => {
    if (productId) {
      loadItems();
      loadWarehouses();
    }
  }, [productId]);

  // 🔹 Handle bulk selection
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🔹 Add item
  const handleAddItem = async () => {
    if (!newItem.warehouse_id) {
      toast.warning("Select a warehouse");
      return;
    }
    try {
      await apipost.post(`/products/${productId}/items/add`, {
        uid: obj.id,
        product_id: productId,
        serial: newItem.serialNumber,
        batch: newItem.batchNumber,
        warehouse_id: newItem.warehouse_id,
        condition: newItem.condition,
        status: newItem.status,
        notes: newItem.notes,
      });

      // ✅ remember last batch
      setLastBatch(newItem.batchNumber);

      toast.success("Item added");
      setAddModal(false);
      setNewItem({
        serialNumber: "",
        batchNumber: "",
        warehouse_id: "",
        condition: "new",
        status: "available",
        expiryDate: "",
        notes: ""
      });
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Add failed");
    }
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find((x) => x.id === id);
    return w ? w.name : "—";
  };

  // 🔹 Summary counts (based on statuses)
  const availableCount = items.filter((i) => i.status === "AVAILABLE").length;
  const inTransitCount = items.filter((i) => i.status === "IN_TRANSIT").length;
  const inStockCount = items.filter((i) => i.status === "IN_STOCK").length;
  const soldCount = items.filter((i) => i.status === "SOLD").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h5" className="d-flex justify-content-between">
          <span>
            <RiArchiveLine className="me-2" />
            Item Management
            <Badge className="ms-2" color="dark">
              {items.length} items
            </Badge>
          </span>
          {!readonly && (
            <div>
              {selected.length > 0 && (
                <>
                <Button
                  color="info"
                  size="sm"
                  className="me-2"
                  onClick={() => setStatusModal(true)}
                >
                  <RiEditBoxLine className="me-1" /> Update ({selected.length})
                </Button>

            <Button
              color="dark"
              size="sm"
              className="me-2"
              onClick={() => {
                const selectedItems = items.filter((i) =>
                  selected.includes(i.id)
                );
                debugger; 
                setQrProducts(
                  selectedItems.map((i) => ({
                    id: i.id,
                    sku: i.serial || i.sku,
                    name: productname,
                    available_qty: 1,
                  }))
                );
                
                setQrModal(true);
              }}
            >
              <RiQrCodeLine className="me-1" /> Generate QR ({selected.length})
            </Button>
                              <Button
                    color="danger"
                    size="sm"
                    className="me-2"
                    onClick={handleDeleteSelected}
                  >
                    🗑 Delete ({selected.length})
                  </Button>
</>
              )}
              <Button
                color="primary"
                className="me-2"
                size="sm"
                onClick={() => {
                  const nextNumber = String(items.length + 1).padStart(3, "0");
                  const nextSerial = `MP${productId}-${nextNumber}`;
                  setNewItem((s) => ({
                    ...s,
                    serialNumber: nextSerial,
                    batchNumber: lastBatch,
                    warehouse_id: s.warehouse_id || (warehouses[0]?.id || "")
                  }));
                  setAddModal(true);
                }}
              >
                <RiAddLine className="me-1" /> Add Item
              </Button>

              <Button
              className="me-2"
                color="success"
                size="sm"
                onClick={() => setBatchModal(true)}
              >
                <RiAddLine className="me-1" /> Add Batch
              </Button>


            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardBody>
        {/* 🔹 Summary Widgets */}
        <Row className="mb-4 text-center">
          <Col>
            <div className="p-2 bg-light rounded">
              <h5 className="text-success">{availableCount}</h5>
              <small>Available</small>
            </div>
          </Col>
          <Col>
            <div className="p-2 bg-light rounded">
              <h5 className="text-info">{inTransitCount}</h5>
              <small>In-Transit</small>
            </div>
          </Col>
          <Col>
            <div className="p-2 bg-light rounded">
              <h5 className="text-primary">{inStockCount}</h5>
              <small>In-Stock</small>
            </div>
          </Col>
          <Col>
            <div className="p-2 bg-light rounded">
              <h5 className="text-dark">{soldCount}</h5>
              <small>Sold</small>
            </div>
          </Col>
        </Row>

        {/* 🔹 Items Table */}
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              {!readonly && <th></th>}
              <th>Date Created</th>
              <th>Serial/SKU</th>
              <th>Batch</th>
              <th>Warehouse</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Last Update</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={readonly ? 5 : 6} className="text-center text-muted">
                  No items added yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  {!readonly && (
                    <td>
                      <Input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                  )}
                  <td>{item.created_at || <span className="text-muted small">—</span>}</td>
                  <td>{item.serial || <span className="text-muted small">—</span>}</td>
                  <td>{item.batch || <span className="text-muted small">—</span>}</td>
                  <td><RiMapPinLine className="me-1" />{item.warehouse_name}</td>
                  <td>{item.condition_label}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{item.updated_at || <span className="text-muted small">—</span>}</td>
                  <td>{item.notes}</td>
                  <td className="text-center">

<Button
  color="light"
  size="sm"
  className="me-2"
  onClick={() => {
    debugger;
    setQrProducts([
      {
        id: item.id,
        sku: item.serial,
        name: productname,
        available_qty: 1, // single item
      },
    ]);
    setQrModal(true);
  }}
>
  <RiQrCodeLine />
</Button>

                    <Button
                       color="light"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelected([item.id]); 
                        setStatusForm({
                          status: item.status,
                          warehouse_id: item.warehouse_id,
                          notes: item.notes || ""
                        });
                        setStatusModal(true);
                      }}
                    >
                      ✏️
                    </Button>

                    <Button
                      color="light"
                      size="sm"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Are you sure?",
                          text: "This item will be permanently deleted.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#6c757d",
                          confirmButtonText: "Yes, delete it!"
                        });

                        if (!result.isConfirmed) return;

                        try {
                          await apipost.post(`/products/${productId}/items/delete`, {
                            uid: obj.id,
                            product_id: productId,
                            item_id: item.id
                          });
                          toast.success("Item deleted");
                          loadItems();
                        } catch (e) {
                          console.error(e);
                          toast.error("Delete failed");
                        }
                      }}
                    >
                      🗑 
                    </Button>

                  </td>

                </tr>
              ))
            )}
          </tbody>
        </Table>



      </CardBody>

    {/* Add Item Modal */}
      <Modal isOpen={addModal} toggle={() => setAddModal(false)} centered>
        <ModalHeader toggle={() => setAddModal(false)}>Add Item</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Warehouse *</Label>
            <Input
              type="select"
              value={newItem.warehouse_id}
              onChange={(e) => setNewItem({ ...newItem, warehouse_id: e.target.value })}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Input>
          </FormGroup>            
          <FormGroup>
            <Label>Serial Number / SKU</Label>
            <Input
              value={newItem.serialNumber}
              onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label>Batch Code</Label>
            <Input
              value={newItem.batchNumber}
              onChange={(e) => setNewItem({ ...newItem, batchNumber: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Condition</Label>
            <Input
              type="select"
              value={newItem.condition}
              onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
              <option value="damaged">Damaged</option>
            </Input>
          </FormGroup>
          {/* <FormGroup>
            <Label>Status</Label>
            <Input
              type="select"
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="shipped">Shipped</option>
              <option value="returned">Returned</option>
            </Input>
          </FormGroup> */}

          <FormGroup>
            <Label>Notes</Label>
            <Input
              type="textarea"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddItem}>Add</Button>

        </ModalFooter>
      </Modal>
    

{/* Add Batch Modal */}
<Modal isOpen={batchModal} toggle={() => setBatchModal(false)} centered>
  <ModalHeader toggle={() => setBatchModal(false)}>Add Batch</ModalHeader>
  <ModalBody>
    <FormGroup>
      <Label>Warehouse *</Label>
      <Input
        type="select"
        value={batchForm.warehouse_id}
        onChange={(e) => setBatchForm({ ...batchForm, warehouse_id: e.target.value })}
      >
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </Input>
    </FormGroup>

    <FormGroup>
      <Label>Batch Number</Label>
      <Input
        value={batchForm.batchNumber}
        onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
      />
    </FormGroup>

    <FormGroup>
      <Label>Quantity</Label>
      <Input
        type="number"
        min="1"
        value={batchForm.qty}
        onChange={(e) => setBatchForm({ ...batchForm, qty: e.target.value })}
      />
    </FormGroup>

    <FormGroup>
      <Label>Condition</Label>
      <Input
        type="select"
        value={batchForm.condition}
        onChange={(e) => setBatchForm({ ...batchForm, condition: e.target.value })}
      >
        <option value="new">New</option>
        <option value="used">Used</option>
        <option value="refurbished">Refurbished</option>
        <option value="damaged">Damaged</option>
      </Input>
    </FormGroup>

    {/* <FormGroup>
      <Label>Status</Label>
      <Input
        type="select"
        value={batchForm.status}
        onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value })}
      >
        <option value="available">Available</option>
        <option value="reserved">Reserved</option>
        <option value="shipped">Shipped</option>
        <option value="returned">Returned</option>
      </Input>
    </FormGroup> */}

    <FormGroup>
      <Label>Notes</Label>
      <Input
        type="textarea"
        value={batchForm.notes}
        onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
      />
    </FormGroup>
  </ModalBody>
  <ModalFooter>
    <Button color="light" onClick={() => setBatchModal(false)}>Cancel</Button>
    <Button color="success" onClick={handleAddBatch}>Add Batch</Button>
  </ModalFooter>
</Modal>


{/* Update Modal */}
<Modal 
  isOpen={statusModal} 
  toggle={() => setStatusModal(false)} 
  centered
>
  <ModalHeader toggle={() => setStatusModal(false)}>Update Item</ModalHeader>
  <ModalBody>
    <FormGroup>
      <Label>New Status *</Label>
      <Input
        type="select"
        value={statusForm.status}
        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
      >
        <option value="">-- Choose --</option>
        <option value="AVAILABLE">AVAILABLE</option>
        <option value="IN_TRANSIT">IN-TRANSIT</option>
        <option value="CHECK_IN">CHECK-IN</option>
        <option value="IN_STOCK">IN-STOCK</option>
        <option value="SOLD">SOLD</option>
        <option value="RETURNED">RETURNED</option>
        <option value="DISPOSED">DISPOSED</option>
      </Input>
    </FormGroup>

    <FormGroup>
      <Label>New Warehouse (optional)</Label>
      <Input
        type="select"
        value={targetWarehouse}
        onChange={(e) => setStatusForm({ ...statusForm, warehouse_id : e.target.value })}
      >
        <option value="">-- Choose --</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </Input>
    </FormGroup>    

    <FormGroup>
      <Label>Notes</Label>
      <Input
        type="textarea"
        value={statusForm.notes}
        onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
      />
    </FormGroup>

    {/* 🔹 Preview Section */}
    <div className="mt-3 p-3 bg-light rounded border">
      <h6 className="fw-bold mb-2">Tracking Notice</h6>
      <p className="mb-0 text-muted">
        Any changes made here will be recorded and reflected in the item’s tracking history.
      </p>
    </div>
  </ModalBody>

  <ModalFooter>
    <Button color="light" onClick={() => setStatusModal(false)}>Cancel</Button>
    <Button
      color="warning"
      onClick={handleUpdateStatus}
      disabled={!statusForm.status}   // 🔹 disable until status is picked
    >
      Submit
    </Button>
  </ModalFooter>
</Modal>

{/* ✅ QR Code Modal for multiple items */}
{qrModal && (

    <QRCodeGenerator
      open={qrModal}
      onClose={() => setQrModal(false)}
      products={qrProducts}
    />


)}

{/* 🔹 Legend Section */}
<Row className="mb-4">
  <Col>
    <h6 className="fw-bold">Statuses Legend:</h6>
    <ul className="list-unstyled mb-0">
      <li>
        <Badge
          className="created-status mw-70  me-2"
        >
           CREATED
        </Badge>
        Product created/defined
      </li>
      <li>
        <Badge color="success" className=" mw-70 me-2">AVAILABLE</Badge>
        Items entered in system, ready at origin
      </li>
      <li>
        <Badge color="info" className="mw-70 me-2">IN-TRANSIT</Badge>
        On the way to another warehouse
      </li>
      <li>
        <Badge className="mw-70 checkin-status me-2">CHECK-IN</Badge>
        Received but still under verification/audit.
      </li>         
      <li>
        <Badge color="primary" className=" mw-70 me-2">IN-STOCK</Badge>
        Officially received at warehouse
      </li>
      <li>
        <Badge color="dark" className="mw-70 me-2">SOLD</Badge>
        Sold/fulfilled order
      </li>
 
     <li>
        <Badge  className="returned-status mw-70 me-2">RETURNED</Badge>
        If Customer sends it back
      </li>  
      <li>
        <Badge color="danger" className="mw-70 me-2">DISPOSED</Badge>
        Scrapped/destroyed
      </li>
    </ul>
  </Col>
</Row>


    </Card>


  );
};

export default QuantityManager;
