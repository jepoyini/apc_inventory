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
  const [siteLinks, setSiteLinks] = useState([]);
  const [refMap, setRefMap] = useState({});
  const [sitePasswordMap, setSitePasswordMap] = useState({});
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [userId, setUserId] = useState(null);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    setUserId(obj.id);
    fetchSiteLinks(obj.id);
    setRank(obj.rank);
  }, []);

  const fetchSiteLinks = async (uid) => {
    try {
      const response = await api.post("/getsitelinks", { uid: uid }, { showLoader: true });
      if (response.success) {
        setSiteLinks(response.data);

        const initialRefs = {};
        const initialPasswords = {};
        const initialShow = {};
        response.data.forEach((item) => {
          initialRefs[item.id] = item.reference || "";
          initialPasswords[item.id] = item.site_password || "";
          initialShow[item.id] = false; // hide by default
        });
        setRefMap(initialRefs);
        setSitePasswordMap(initialPasswords);
        setShowPasswordMap(initialShow);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleRefChange = (id, value) => {
    setRefMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePasswordChange = (id, value) => {
    setSitePasswordMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const togglePassword = (id) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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

  const renderTable = (title, filterIds) => (
    <>
      <h4 className="mt-5 mb-3">{title}</h4>
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
          {siteLinks
            .filter((link) => filterIds.includes(link.id))
            .map((link) => (
              <tr key={`${title}-${link.id}`}>
                <td>{link.id}</td>
                <td>{link.site_name}</td>
                <td>
                  <Input
                    type="text"
                    placeholder={
                      link.id === "59"
                        ? "Promo Code"
                        : link.id === "48"
                        ? "Referral ID"
                        : link.id === "58"
                        ? "Invitation Code"
                        : link.id === "61"
                        ? "Metamask Address"
                        : link.id === "51"
                        ? "SHARING Financial Email"
                        : "Website Username"
                    }
                    value={refMap[link.id] || ""}
                    onChange={(e) => handleRefChange(link.id, e.target.value)}
                  />
                </td>
                <td style={{ display: "flex", gap: "5px" }}>
                  <Input
                    type={showPasswordMap[link.id] ? "text" : "password"}
                    placeholder="Password"
                    value={sitePasswordMap[link.id] || ""}
                    onChange={(e) => handlePasswordChange(link.id, e.target.value)}
                    disabled={!refMap[link.id]} // Disabled if reference is empty
                  />
                  <Button
                    className="btn btn-outline-warning waves-effect waves-light btn btn-link w-60px mw-250" 
                    size="sm"
                    onClick={() => togglePassword(link.id)}
                  >
                    {showPasswordMap[link.id] ? "Hide" : "Show"}
                  </Button>
                </td>
                <td>
                  <a
                    href={getFormattedUrl(link.site_url_format, refMap[link.id])}
                    target="_blank"
                    rel="noreferrer"
                    className="link-style"
                  >
                    {getFormattedUrl(link.site_url_format, refMap[link.id])}
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Initiatives" pageTitle="Dashboard" url="/dashboard" />
        <Row>
          <Col lg={12}>
            <Card id="donationHistoryList">
              <CardHeader className="border-0"></CardHeader>
              <CardBody className="pt-0">
                <Row className="g-4 align-items-center mb-15">
                  <Col md={12}>
                    {renderTable("LEGACY", ["41", "47"])}
                    {renderTable("LEVERAGE", ["40", "59"])}
                    {renderTable("LIFESTYLE", ["56", "54"])}
                    {renderTable("LEARNING", ["51", "57", "62"])}
                    {renderTable("LONGEVITY", ["49", "55"])}
                    {renderTable("LUXURY", ["52", "53"])}

                    {rank !== "pioneer" && renderTable("LOGISTICS", ["48", "58", "61", "63"])}

                    <div className="text-start mt-3">



                      <Button
                        className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
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

