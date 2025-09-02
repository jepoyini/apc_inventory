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
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { APIClient } from "../../helpers/api_helper";

const ReferralLinks = () => {
  const api = new APIClient();
  const [categories, setCategories] = useState({});
  const [refMap, setRefMap] = useState({});
  const [sitePasswordMap, setSitePasswordMap] = useState({});
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    if (obj) {
      setUserId(obj.id);
      fetchSiteLinks(obj.id);
    }
  }, []);

  const fetchSiteLinks = async (uid) => {
    try {
      const response = await api.post("/getsitelinks", { uid }, { showLoader: true });
      if (response.success) {
        const data = response.data;

        const grouped = {};
        const refs = {};
        const passwords = {};
        const showMap = {};

        data.forEach((item) => {
          if (!grouped[item.category_id]) {
            grouped[item.category_id] = {
              name: item.category_name,
              sites: []
            };
          }
          grouped[item.category_id].sites.push(item);

          refs[item.site_id] = item.reference || "";
          passwords[item.site_id] = item.site_password || "";
          showMap[item.site_id] = false;
        });

        setCategories(grouped);
        setRefMap(refs);
        setSitePasswordMap(passwords);
        setShowPasswordMap(showMap);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleRefChange = (id, value) => {
    setRefMap((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (id, value) => {
    setSitePasswordMap((prev) => ({ ...prev, [id]: value }));
  };

  const togglePassword = (id) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getFormattedUrl = (siteUrl, ref) => {
    if (!siteUrl) return "";
    return siteUrl.replace("{sharing}", ref || "");
  };

  const handleUpdate = async () => {
    const payload = Object.keys(refMap).map((id) => ({
      id,
      site_reference: refMap[id],
      site_password: sitePasswordMap[id],
    }));

    try {
      const res = await api.post(
        "/updatesitelinks",
        { uid: userId, links: payload },
        { showLoader: true }
      );

      if (res.success) {
        Swal.fire("Updated!", "Your referral links have been updated.", "success");
        fetchSiteLinks(userId);
      } else {
        Swal.fire("Error", res.message || "Update failed.", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Initiatives" pageTitle="Dashboard" url="/dashboard" />
        <Row>
          <Col lg={12}>
            <Card id="referralLinksList">
              <CardHeader className="border-0"></CardHeader>
              <CardBody className="pt-0">
                <Row className="g-4 align-items-center mb-15">
                  <Col md={12}>
                    {Object.keys(categories).map((catId) => (
                      <div key={catId}>
                        <h4 className="mt-5 mb-3">{categories[catId].name}</h4>
                        <Table bordered responsive>
                          <thead>
                            <tr>
                              <th>Project ID</th>
                              <th>Project Name</th>
                              <th>Project Reference ID</th>
                              <th>Project Password</th>
                              <th>Project Sites</th>
                            </tr>
                          </thead>
<tbody>
  {categories[catId].sites.map((link) => (
    <tr
      key={link.site_id}
      className={link.sponsor_has_record === 1 ? "text-success" : ""}
    >
      <td>{link.site_id}</td>
      <td>{link.site_name}</td>
      <td>
        <Input
          type="text"
          placeholder="Reference"
          value={refMap[link.site_id] || ""}
          onChange={(e) => handleRefChange(link.site_id, e.target.value)}
        />
      </td>
      <td style={{ display: "flex", gap: "5px" }}>
        <Input
          type={showPasswordMap[link.site_id] ? "text" : "password"}
          placeholder="Password"
          value={sitePasswordMap[link.site_id] || ""}
          onChange={(e) => handlePasswordChange(link.site_id, e.target.value)}
          disabled={!refMap[link.site_id]}
        />
        <Button
          size="sm"
          className="btn btn-outline-warning"
          onClick={() => togglePassword(link.site_id)}
        >
          {showPasswordMap[link.site_id] ? "Hide" : "Show"}
        </Button>
      </td>
      <td>
        <a
          href={getFormattedUrl(link.site_url_format, refMap[link.site_id])}
          target="_blank"
          rel="noreferrer"
          className={link.sponsor_has_record === 1 ? "text-success" : ""}
        >
          {getFormattedUrl(link.site_url_format, refMap[link.site_id])}
        </a>
      </td>
    </tr>
  ))}
</tbody>

                        </Table>
                      </div>
                    ))}

                    <div className="text-start mt-3">
                      <Button
                        className="btn btn-soft-warning waves-effect waves-light w-100 mw-250"
                        onClick={handleUpdate}
                      >
                        Update
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default ReferralLinks;
