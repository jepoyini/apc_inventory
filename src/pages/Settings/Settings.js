// ================================================================
// FILE: src/pages/Inventory/Settings.js
// Full version with all sections
// Velzon + Reactstrap (no TSX, no shadcn/ui)
// ================================================================
import React, { useState } from "react";
import {
  Card, CardBody, CardHeader, CardTitle,
  Button, Input, Label, Row, Col, FormGroup,
  Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [settings, setSettings] = useState({
    profile: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@company.com",
      phone: "+1 (555) 123-4567",
      department: "Inventory Management",
      role: "Manager",
    },
    notifications: {
      emailNotifications: true,
      lowStockAlerts: true,
      movementAlerts: false,
      alertThreshold: 10,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      password: "",
    },
    display: {
      theme: "light",
      language: "en",
      currency: "USD",
      itemsPerPage: 20,
      compactView: false,
      showImages: true,
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      debugMode: false,
    },
  });

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = (section) => {
    toast.success(`${section} settings saved`);
  };

  const handleReset = (section) => {
    toast.info(`${section} settings reset to default`);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute(
      "download",
      `settings_export_${new Date().toISOString().split("T")[0]}.json`
    );
    linkElement.click();
    toast.success("Settings exported");
  };

  return (
    <div className="page-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Settings</h2>
          <p className="text-muted">Manage your account and preferences</p>
        </div>
        <div>
          <Button color="secondary" className="me-2" onClick={handleExport}>
            Export Settings
          </Button>
          <Button color="primary" onClick={() => handleSave("All")}>
            Save All
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {/* Tabs */}
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "profile" })}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "notifications" })}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "security" })}
                onClick={() => setActiveTab("security")}
              >
                Security
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "display" })}
                onClick={() => setActiveTab("display")}
              >
                Display
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "system" })}
                onClick={() => setActiveTab("system")}
              >
                System
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "danger" })}
                onClick={() => setActiveTab("danger")}
              >
                Danger Zone
              </NavLink>
            </NavItem>
          </Nav>

          {/* Tab Panels */}
          <TabContent activeTab={activeTab} className="p-3">
            {/* Profile */}
            <TabPane tabId="profile">
              <Card className="mb-3">
                <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>First Name</Label>
                        <Input
                          value={settings.profile.firstName}
                          onChange={(e) =>
                            updateSetting("profile", "firstName", e.target.value)
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Last Name</Label>
                        <Input
                          value={settings.profile.lastName}
                          onChange={(e) =>
                            updateSetting("profile", "lastName", e.target.value)
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      value={settings.profile.email}
                      onChange={(e) =>
                        updateSetting("profile", "email", e.target.value)
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone</Label>
                    <Input
                      value={settings.profile.phone}
                      onChange={(e) =>
                        updateSetting("profile", "phone", e.target.value)
                      }
                    />
                  </FormGroup>
                  <Button
                    color="primary"
                    className="me-2"
                    onClick={() => handleSave("Profile")}
                  >
                    Save
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => handleReset("Profile")}
                  >
                    Reset
                  </Button>
                </CardBody>
              </Card>
            </TabPane>

            {/* Notifications */}
            <TabPane tabId="notifications">
              <Card>
                <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                <CardBody>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) =>
                        updateSetting("notifications", "emailNotifications", e.target.checked)
                      }
                    />
                    <Label check>Email Notifications</Label>
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) =>
                        updateSetting("notifications", "lowStockAlerts", e.target.checked)
                      }
                    />
                    <Label check>Low Stock Alerts</Label>
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.notifications.movementAlerts}
                      onChange={(e) =>
                        updateSetting("notifications", "movementAlerts", e.target.checked)
                      }
                    />
                    <Label check>Movement Alerts</Label>
                  </FormGroup>
                  <FormGroup>
                    <Label>Alert Threshold</Label>
                    <Input
                      type="number"
                      value={settings.notifications.alertThreshold}
                      onChange={(e) =>
                        updateSetting("notifications", "alertThreshold", parseInt(e.target.value, 10))
                      }
                    />
                  </FormGroup>
                  <Button
                    color="primary"
                    className="me-2"
                    onClick={() => handleSave("Notifications")}
                  >
                    Save
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => handleReset("Notifications")}
                  >
                    Reset
                  </Button>
                </CardBody>
              </Card>
            </TabPane>

            {/* Security */}
            <TabPane tabId="security">
              <Card>
                <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                <CardBody>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) =>
                        updateSetting("security", "twoFactorEnabled", e.target.checked)
                      }
                    />
                    <Label check>Two-Factor Authentication</Label>
                  </FormGroup>
                  <FormGroup>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        updateSetting("security", "sessionTimeout", parseInt(e.target.value, 10))
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Change Password</Label>
                    <Input
                      type="password"
                      value={settings.security.password}
                      onChange={(e) =>
                        updateSetting("security", "password", e.target.value)
                      }
                    />
                  </FormGroup>
                  <Button color="primary" onClick={() => handleSave("Security")}>
                    Save
                  </Button>
                </CardBody>
              </Card>
            </TabPane>

            {/* Display */}
            <TabPane tabId="display">
              <Card>
                <CardHeader><CardTitle>Display</CardTitle></CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label>Theme</Label>
                    <Input
                      type="select"
                      value={settings.display.theme}
                      onChange={(e) =>
                        updateSetting("display", "theme", e.target.value)
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label>Items per Page</Label>
                    <Input
                      type="number"
                      value={settings.display.itemsPerPage}
                      onChange={(e) =>
                        updateSetting("display", "itemsPerPage", parseInt(e.target.value, 10))
                      }
                    />
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.display.compactView}
                      onChange={(e) =>
                        updateSetting("display", "compactView", e.target.checked)
                      }
                    />
                    <Label check>Compact View</Label>
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.display.showImages}
                      onChange={(e) =>
                        updateSetting("display", "showImages", e.target.checked)
                      }
                    />
                    <Label check>Show Images</Label>
                  </FormGroup>
                </CardBody>
              </Card>
            </TabPane>

            {/* System */}
            <TabPane tabId="system">
              <Card>
                <CardHeader><CardTitle>System</CardTitle></CardHeader>
                <CardBody>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.system.autoBackup}
                      onChange={(e) =>
                        updateSetting("system", "autoBackup", e.target.checked)
                      }
                    />
                    <Label check>Auto Backup</Label>
                  </FormGroup>
                  <FormGroup>
                    <Label>Backup Frequency</Label>
                    <Input
                      type="select"
                      value={settings.system.backupFrequency}
                      onChange={(e) =>
                        updateSetting("system", "backupFrequency", e.target.value)
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Input>
                  </FormGroup>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      checked={settings.system.debugMode}
                      onChange={(e) =>
                        updateSetting("system", "debugMode", e.target.checked)
                      }
                    />
                    <Label check>Debug Mode</Label>
                  </FormGroup>
                </CardBody>
              </Card>
            </TabPane>

            {/* Danger Zone */}
            <TabPane tabId="danger">
              <Card>
                <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
                <CardBody>
                  <p className="text-danger fw-bold">
                    Proceed with caution. These actions cannot be undone.
                  </p>
                  <Button color="danger" className="me-2">
                    Delete Account
                  </Button>
                  <Button color="warning">
                    Reset All Data
                  </Button>
                </CardBody>
              </Card>
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
