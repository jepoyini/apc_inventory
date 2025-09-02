import React, { useState, useEffect } from "react";
import {
  CardBody,
  Row,
  Col,
  Card,
  Container,
  CardHeader,
  Button,
  Input,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { APIClient } from "../../helpers/api_helper";

const ManageCategories = () => {
  document.title = "Admin - Manage Categories";
  const api = new APIClient();
  const obj = JSON.parse(sessionStorage.getItem("authUser"));

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    uid: obj.id,
    category_name: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = { uid: obj.id };
      debugger; 
      const response = await api.post("/getcategories", data);
      if (response.status=="success") {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.category_name) {
      Swal.fire("Error", "Category name is required.", "error");
      return;
    }

    try {
      const response = await api.post("/addcategory", newCategory, { showLoader: true });
      if (response.status == "success") {
        Swal.fire("Success", "Category added successfully.", "success");
        setIsAddModalOpen(false);
        setNewCategory({ uid: obj.id, category_name: "" });
        fetchCategories();
      }
    } catch (err) {
      console.error("Add error:", err);
      Swal.fire("Error", "Failed to add category.", "error");
    }
  };

  const handleUpdateCategory = async (id, updatedData) => {
    try {
      const response = await api.post(
        "/updatecategory",
        { id, uid: obj.id, ...updatedData },
        { showLoader: true }
      );

      if (response.status == "success") {
        Swal.fire("Success", "Category updated successfully.", "success");
        fetchCategories();
      } else {
        Swal.fire("Error", response.message || "Update failed.", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", "Failed to update category.", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will remove the category!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await api.post(
          "/deletecategory",
          { id, uid: obj.id },
          { showLoader: true }
        );

        if (response.status == "success") {
          Swal.fire("Deleted!", "Category has been deleted.", "success");
          fetchCategories();
        } else {
          Swal.fire("Error", response.message || "Delete failed.", "error");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Failed to delete category.", "error");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Manage Categories" pageTitle="Dashboard" url="/dashboard" />
        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Project Categories</h5>
                <Button
                  className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add New Category
                </Button>
              </CardHeader>
              <CardBody className="pt-0">
                <Table bordered responsive>
                  <thead>
                    <tr>
                      <th style={{ width: "10%" }}>ID</th>
                      <th style={{ width: "80%" }}>Category Name</th>
                      <th style={{ whiteSpace: "nowrap", width: "8%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>
                          <Input
                            type="text"
                            value={cat.category_name}
                            onChange={(e) => {
                              const updated = categories.map((c) =>
                                c.id === cat.id
                                  ? { ...c, category_name: e.target.value }
                                  : c
                              );
                              setCategories(updated);
                            }}
                          />
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              color="success"
                              size="sm"
                              onClick={() =>
                                handleUpdateCategory(cat.id, {
                                  category_name: cat.category_name,
                                })
                              }
                            >
                              Update
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add New Category Modal */}
      <Modal isOpen={isAddModalOpen} toggle={() => setIsAddModalOpen(false)}>
        <ModalHeader toggle={() => setIsAddModalOpen(false)}>Add New Category</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Category Name</Label>
            <Input
              type="text"
              name="category_name"
              value={newCategory.category_name}
              onChange={handleInputChange}
              placeholder="Enter category name"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddCategory}>
            Save
          </Button>
          <Button color="secondary" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default ManageCategories;
