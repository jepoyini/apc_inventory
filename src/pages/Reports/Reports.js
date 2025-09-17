import React, { useEffect, useState, useMemo } from "react";
import { CardBody, Row, Col, Card, Container, CardHeader, Button, Input } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import ReactApexChart from "react-apexcharts";
import CountUp from "react-countup";
import { APIClient } from "../../helpers/api_helper";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Reports = () => {
  document.title = "Reports & Analytics | APC Inventory";
  const apipost = new APIClient();

  const [period, setPeriod] = useState("7");
  const [warehouses, setWarehouses] = useState([]);
  const [daily, setDaily] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [metrics, setMetrics] = useState({ totalScansToday: 0, activeWarehouses: 0, inTransit: 0 });

  useEffect(() => {
    const loadData = async () => {
      const res = await apipost.post("/reports/summary", { period });
      if (res.status === "success") {
        setWarehouses(res.warehouses);
        setDaily(res.daily);
        setBreakdown(res.breakdown);
        setMetrics(res.metrics);
      }
    };
    loadData();
  }, [period]);

  const categories = useMemo(() => {
    const n = Number(period) || 7;
    const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    const arr = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const t = new Date(d);
      t.setDate(d.getDate() - i);
      arr.push(fmt.format(t));
    }
    return arr;
  }, [period]);

  const dailySeries = [
    {
      name: "Scans",
      data: categories.map((c) => {
        const found = daily.find(
          (d) =>
            new Date(d.d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) === c
        );
        return found ? found.scans : 0;
      }),
    },
  ];

  const breakdownSeries = ["AVAILABLE", "IN_TRANSIT", "IN_STOCK"].map((status) => ({
    name: status,
    data: categories.map((c) => {
      const dayKey = new Date(c).toISOString().split("T")[0];
      return breakdown[dayKey]?.[status] || 0;
    }),
  }));

  const MetricRow = ({ label, value }) => (
    <div className="d-flex align-items-center justify-content-between py-2">
      <span className="text-muted">{label}</span>
      <strong className="fs-5">
        <CountUp start={0} end={value} duration={0.6} />
      </strong>
    </div>
  );

  const handleExportPdf = async () => {
    const element = document.querySelector(".page-content"); // or any div you want
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("report.pdf");
  };

  return (
    <div className="page-content">
      <Container fluid>
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
          <div>
            <h2>Products</h2>
            <p className="text-muted">Comprehensive inventory and movement reports</p>
          </div>
          <div className="d-flex gap-2">
            <Button color="danger" onClick={handleExportPdf}>
              <i className="ri-file-pdf-2-line me-1"></i> Export PDF
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <Card className="mt-3 mb-3">
          <CardBody>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-medium">Report Period:</span>
              <div style={{ maxWidth: 220 }}>
                <Input type="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="0">This Month (to date)</option>
                </Input>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Daily & Breakdown */}
        <Row>
          <Col xl={6}>
            <Card className="h-100">
              <CardHeader>
                <h6 className="mb-0">Daily Activity</h6>
              </CardHeader>
              <CardBody>
                <ReactApexChart
                  options={{ chart: { type: "line" }, xaxis: { categories } }}
                  series={dailySeries}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <h6 className="mb-0">Product Tracking Activity Reporting</h6>
              </CardHeader>
              <CardBody>
                <ReactApexChart
                  options={{ chart: { type: "bar" }, xaxis: { categories } }}
                  series={[
                    { name: "Scans", data: dailySeries[0].data },
                    breakdownSeries.find((s) => s.name === "IN_TRANSIT"),
                    breakdownSeries.find((s) => s.name === "IN_STOCK"),
                  ]}
                  type="bar"
                  height={300}
                />
              </CardBody>
            </Card>           
          </Col>
        </Row>

        {/* Inventory & System Performance */}
        <Row className="mt-3">
          <Col xl={8}>
            <Card>
              <CardHeader>
                <h6 className="mb-0">Inventory Summary</h6>
              </CardHeader>
              <CardBody>
                {warehouses.map((w) => (
                  <div
                    key={w.id}
                    className="d-flex align-items-start justify-content-between mb-3"
                  >
                    <div>
                      <div className="fw-semibold">{w.name}</div>
                      <div className="text-muted small">{w.location}</div>
                    </div>
                    <div className="fw-semibold">
                      <CountUp start={0} end={w.items} duration={0.6} /> items
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <Card>
              <CardHeader>
                <h6 className="mb-0">System Performance</h6>
              </CardHeader>
              <CardBody>
                <MetricRow label="Total Scans Today" value={metrics.totalScansToday} />
                <MetricRow label="Active Warehouses" value={metrics.activeWarehouses} />
                <MetricRow label="Items in Transit" value={metrics.inTransit} />
              </CardBody>
            </Card>
          </Col>
        </Row>


      </Container>
    </div>
  );
};

export default Reports;
