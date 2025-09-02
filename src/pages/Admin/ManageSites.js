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

const ReferralLinks = () => {
  document.title = "Admin - Manage Sites";
  const api = new APIClient();
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ categories state
  const obj = JSON.parse(sessionStorage.getItem("authUser"));

  const [newSite, setNewSite] = useState({
    uid: obj.id,
    site_name: "",
    site_url_format: "",
    category_id: "", // ✅ include category
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchCategories();
  }, []);

  const fetchSites = async () => {
    try {
      const data = { uid: obj.id };
      const response = await api.post("/getsites", data);
      debugger; 
      if (response.success) {
        setSites(response.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.post("/getcategories", { uid: obj.id });
      debugger; 
      if (response.status == "success") {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSite((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSite = async () => {
    if (!newSite.site_name || !newSite.site_url_format || !newSite.category_id) {
      Swal.fire("Error", "Please fill all fields.", "error");
      return;
    }

    try {
      const response = await api.post("/addsite", newSite, { showLoader: true });
      if (response.success) {
        Swal.fire("Success", "Site added successfully.", "success");
        setIsAddModalOpen(false);
        setNewSite({ uid: obj.id, site_name: "", site_url_format: "", category_id: "" });
        fetchSites();
      }
    } catch (err) {
      console.error("Add error:", err);
      Swal.fire("Error", "Failed to add site.", "error");
    }
  };

  const handleUpdateSite = async (id, updatedData) => {
    try {
      const response = await api.post(
        "/updatesite",
        { id, uid: obj.id, ...updatedData },
        { showLoader: true }
      );

      if (response.success) {
        Swal.fire("Success", "Site updated successfully.", "success");
        fetchSites();
      } else {
        Swal.fire("Error", response.message || "Update failed.", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", "Failed to update site.", "error");
    }
  };

  const handleDeleteSite = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await api.post(
          "/deletesite",
          { id, uid: obj.id },
          { showLoader: true }
        );

        if (response.success) {
          Swal.fire("Deleted!", "Site has been deleted.", "success");
          fetchSites();
        } else {
          Swal.fire("Error", response.message || "Delete failed.", "error");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Failed to delete site.", "error");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Manage Sites" pageTitle="Dashboard" url="/dashboard" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Sites List</h5>
                <Button
                  className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add New Site
                </Button>
              </CardHeader>
              <CardBody className="pt-0">
                <Table bordered responsive className="table-responsive">
                  <thead>
                    <tr>
                      <th style={{ width: "4%" }}>ID</th>
                      <th style={{ width: "20%" }}>Site Name</th>
                      <th>URL Format</th>
                      <th style={{ width: "20%" }}>Category</th>
                      <th style={{ whiteSpace: "nowrap", width: "1%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((site) => (
                      <tr key={site.id}>
                        <td>{site.id}</td>
                        <td>
                          <Input
                            type="text"
                            value={site.site_name}
                            onChange={(e) => {
                              const updatedSites = sites.map((s) =>
                                s.id === site.id ? { ...s, site_name: e.target.value } : s
                              );
                              setSites(updatedSites);
                            }}
                          />
                        </td>
                        <td>
                          <Input
                            type="text"
                            value={site.site_url_format}
                            onChange={(e) => {
                              const updatedSites = sites.map((s) =>
                                s.id === site.id ? { ...s, site_url_format: e.target.value } : s
                              );
                              setSites(updatedSites);
                            }}
                          />
                        </td>
                        <td>
                          <Input
                            type="select"
                            value={site.category_id || ""}
                            onChange={(e) => {
                              const updatedSites = sites.map((s) =>
                                s.id === site.id ? { ...s, category_id: e.target.value } : s
                              );
                              setSites(updatedSites);
                            }}
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.category_name}
                              </option>
                            ))}
                          </Input>
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              color="success"
                              onClick={() =>
                                handleUpdateSite(site.id, {
                                  site_name: site.site_name,
                                  site_url_format: site.site_url_format,
                                  category_id: site.category_id,
                                })
                              }
                              size="sm"
                            >
                              Update
                            </Button>
                            <Button
                              color="danger"
                              onClick={() => handleDeleteSite(site.id)}
                              size="sm"
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

      {/* Add New Site Modal */}
      <Modal isOpen={isAddModalOpen} toggle={() => setIsAddModalOpen(false)}>
        <ModalHeader toggle={() => setIsAddModalOpen(false)}>Add New Site</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Site Name</Label>
            <Input
              type="text"
              name="site_name"
              value={newSite.site_name}
              onChange={handleInputChange}
              placeholder="Enter site name"
            />
          </FormGroup>
          <FormGroup>
            <Label>URL Format</Label>
            <Input
              type="text"
              name="site_url_format"
              value={newSite.site_url_format}
              onChange={handleInputChange}
              placeholder="e.g., https://example.com?ref={sharing}"
            />
          </FormGroup>
          <FormGroup>
            <Label>Category</Label>
            <Input
              type="select"
              name="category_id"
              value={newSite.category_id}
              onChange={handleInputChange}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddSite}>
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

export default ReferralLinks;
