// ================================================================
// FILE: src/pages/Users/Settings.jsx
// ================================================================
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Spinner,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import classnames from "classnames";
import Swal from "sweetalert2";
import { APIClient } from "../../helpers/api_helper";
import { api } from "../../config";

// Import ActivityLogs component
import ActivityLogs from "..//Users/ActivityLogs";

const Settings = () => {
  const apipost = new APIClient();
  const [pageloading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const [logsOpen, setLogsOpen] = useState(false);
  const [logsMaximized, setLogsMaximized] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [user, setUser] = useState({
    id: "",
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zip: "",
    status: "",
    avatar: null, // backend path or null
    avatarFile: null, // file object for preview
  });

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const countryList = [
    "United States", "United Kingdom", "Philippines", "Canada", "Australia",
    "Germany", "France", "Japan", "Singapore", "India", "China", "Brazil",
    "South Africa", "Mexico", "Italy", "Spain", "Vietnam", "Thailand",
    "Malaysia", "Netherlands", "Sweden", "Norway", "Switzerland", "Others"
  ];

  // ✅ Prefix for avatar & images
  const prefixUrl = (url) => {
    const base = api?.IMAGE_URL ? api.IMAGE_URL.replace(/\/$/, "") : "";
    if (!url) return base + "/images/noavatar.png";
    if (url.startsWith("http")) return url;
    return base + "/" + url.replace(/^\//, "");
  };

  // ================================
  // Load user profile
  // ================================
  const fetchUser = async () => {
    try {
      debugger; 
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const r = await apipost.post("/users/details", { id: obj.id, uid: obj.id });

      if (r?.status == "error")
      {
        debugger; 
             Swal.fire({ icon: "error", text: "Missing ID not found. Try to reopen the page.", confirmButtonText: "OK" });
      } else {

        if (r?.user) {
          setUser((prev) => ({
            ...prev,
            ...r.user,
            avatar: r.user.avatar,
            avatarFile: null, // reset preview
          }));
        }
        setPageLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ================================
  // Load activity logs
  // ================================
  const loadLogs = async () => {
    if (!user.id) return;
    setLoadingLogs(true);
    try {
      const r = await apipost.post("/users/activitylogs", { id: user.id });
      setLogs(r?.logs || []);
    } catch {
      Swal.fire({ icon: "error", text: "Failed to load activity logs", confirmButtonText: "OK" });
    } finally {
      setLoadingLogs(false);
    }
  };

  // ================================
  // Handlers
  // ================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUser((prevUser) => ({
        ...prevUser,
        avatarFile: file, // keep file for upload
      }));
    }
  };

  const handleInputPasswordChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // ================================
  // Save profile
  // ================================
  const updateProfile = async () => {
    debugger; 
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(user).forEach((k) => {
        if (user[k] !== null && user[k] !== "") {
          if (k === "avatarFile" && user.avatarFile) {
            fd.append("avatar", user.avatarFile);
          } else if (k !== "avatarFile") {
            fd.append(k, user[k]);
          }
        }
      });

      const response = await apipost.post("/users/save", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: response.status === "success" ? "success" : "error",
        text: response.message || "Profile updated",
        confirmButtonText: "OK",
      });

      if (response.status === "success") {
        fetchUser(); // reload from backend
      }
    } catch (error) {
      Swal.fire({ icon: "error", text: "Error while saving!", confirmButtonText: "OK" });
    }
    setLoading(false);
  };

  // ================================
  // Change password
  // ================================
  const validatePasswords = async () => {
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({ icon: "error", text: "All fields are required.", confirmButtonText: "OK" });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        text: "New password and confirm password do not match.",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      debugger; 
      const response = await apipost.post("/users/changepass", {
        id: user.id,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      Swal.fire({
        icon: response.status === "success" ? "success" : "error",
        text: response.message || "Password updated",
        confirmButtonText: "OK",
      });

      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      Swal.fire({ icon: "error", text: "Error while changing password!", confirmButtonText: "OK" });
    }
    setLoading(false);
  };

  const tabChange = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <div className="page-content">
      {pageloading ? (
        <Container fluid>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
          </div>
        </Container>
      ) : (
        <Container fluid>
          {/* Profile Header */}
          <Row className="mb-4">
            <Col lg="9">
              <Card className="shadow-sm border-0">
                <CardBody>
                  <Row className="align-items-center">
                    {/* Avatar */}
                    <Col md="4" className="text-center">
                      <img
                        src={
                          user.avatarFile
                            ? URL.createObjectURL(user.avatarFile) // ✅ show preview if file selected
                            : prefixUrl(user.avatar)               // ✅ fallback to server path
                        }
                        alt="User Avatar"
                        className="rounded-circle shadow-sm mb-2"
                        style={{ objectFit: "cover", width: "120px", height: "120px" }}
                      />
                      <Input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </Col>
                    {/* Info */}
                    <Col md="8">
                      <h5 className="mt-3">{user.firstname} {user.lastname}</h5>
                      <p className="text-muted d-inline-flex align-items-center" style={{ gap: "10px" }}>
                        @{user.username}
                        <Badge color={user.status === "active" ? "success" : "danger"} pill>
                          {user.status}
                        </Badge>
                      </p>
                      <p><i className="ri-mail-line me-1"></i> {user.email}</p>
                      <p><i className="ri-phone-line me-1"></i> {user.phone}</p>
                      <p>
                        <i className="ri-map-pin-line me-1"></i>
                        {user.address}, {user.city}, {user.country} {user.zip}
                      </p>
                      <Button
                        size="sm"
                        color="info"
                        onClick={() => {
                          setLogsOpen(true);
                          loadLogs();
                        }}
                      >
                        <i className="ri-file-list-2-line me-1"></i> View Activity Logs
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Row>
            <Col xxl={9}>
              <Card>
                <CardHeader>
                  <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0">
                    <NavItem>
                      <NavLink
                        to="#"
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => tabChange("1")}
                      >
                        Account Details
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        to="#"
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => tabChange("2")}
                      >
                        Change Password
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardHeader>
                <CardBody className="p-4">
                  <TabContent activeTab={activeTab}>
                    {/* Account Details */}
                    <TabPane tabId="1">
                      <Form>
                        <Row className="g-3">
                          <Col lg={6}>
                            <Label>First Name</Label>
                            <Input type="text" name="firstname" value={user.firstname || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={6}>
                            <Label>Last Name</Label>
                            <Input type="text" name="lastname" value={user.lastname || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={6}>
                            <Label>Phone</Label>
                            <Input type="text" name="phone" value={user.phone || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={6}>
                            <Label>Email</Label>
                            <Input type="email" name="email" value={user.email || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={12}>
                            <Label>Address</Label>
                            <Input type="text" name="address" value={user.address || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={4}>
                            <Label>City</Label>
                            <Input type="text" name="city" value={user.city || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={4}>
                            <Label>Country</Label>
                            <Input type="select" name="country" value={user.country || ""} onChange={handleInputChange}>
                              <option value="">Select Country</option>
                              {countryList.map((c, idx) => (
                                <option key={idx} value={c}>{c}</option>
                              ))}
                            </Input>
                          </Col>
                          <Col lg={4}>
                            <Label>zip</Label>
                            <Input type="text" name="zip" value={user.zip || ""} onChange={handleInputChange} />
                          </Col>
                          <Col lg={12} className="mt-3">
                            <Button 
                              color="warning" 
                              onClick={updateProfile} 
                              disabled={loading}
                              className="d-flex align-items-center justify-content-center"
                              style={{ minWidth: "150px" }}  // adjust width so spinner + text fit
                            >
                              {loading ? (
                                <Spinner size="sm" />
                              ) : (
                                "Update Profile"
                              )}
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </TabPane>

                    {/* Change Password */}
                    <TabPane tabId="2">
                      <Form>
                        <Row className="g-3">
                          <Col lg={4}>
                            <Label>Old Password</Label>
                            <Input type="password" id="oldPassword" value={formData.oldPassword} onChange={handleInputPasswordChange} />
                          </Col>
                          <Col lg={4}>
                            <Label>New Password</Label>
                            <Input type="password" id="newPassword" value={formData.newPassword} onChange={handleInputPasswordChange} />
                          </Col>
                          <Col lg={4}>
                            <Label>Confirm Password</Label>
                            <Input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleInputPasswordChange} />
                          </Col>
                          <Col lg={12} className="mt-3">
                            <Button color="warning" onClick={validatePasswords} disabled={loading}>
                              {loading ? <Spinner size="sm" /> : "Update Password"}
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Activity Logs Modal */}
          <Modal
            isOpen={logsOpen}
            toggle={() => setLogsOpen(false)}
            size={logsMaximized ? "xl" : "lg"}
            fullscreen={logsMaximized}
            centered
          >
<ModalHeader toggle={() => setLogsOpen(false)}>
  <div className="d-flex align-items-center w-100">
    <div>
      <i className="ri-file-list-2-line me-2"></i> Activity Logs
    </div>
    <div  style={{ marginLeft: "10px" }}>
      <Button
        size="sm"
        color="light"
        onClick={() => setLogsMaximized(!logsMaximized)}
        title={logsMaximized ? "Restore" : "Maximize"}
      >
        {logsMaximized ? (
          <i className="ri-contract-left-right-line"></i>
        ) : (
          <i className="ri-fullscreen-line"></i>
        )}
      </Button>
    </div>
  </div>
</ModalHeader>
            <ModalBody>
              <ActivityLogs logs={logs} loading={loadingLogs} />
            </ModalBody>
          </Modal>
        </Container>
      )}
    </div>
  );
};

export default Settings;
