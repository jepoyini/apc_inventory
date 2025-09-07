import React, { useMemo, useState } from "react";
import {
  CardBody,
  Row,
  Col,
  Card,
  Container,
  CardHeader,
  Button,
  Input,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import ReactApexChart from "react-apexcharts";
import CountUp from "react-countup";

const Reports = () => {
  document.title = "Reports & Analytics | APC Inventory";

  // ---- Static sample data to mirror the screenshot ----
  const warehouses = [
    {
      id: 1,
      name: "Clarkfield Main Warehouse",
      sub: "Clarkfield, Pampanga, Philippines",
      items: 2,
    },
    {
      id: 2,
      name: "Tokyo Distribution Center",
      sub: "Tokyo, Japan",
      items: 1,
    },
    {
      id: 3,
      name: "Singapore Hub",
      sub: "Singapore",
      items: 0,
    },
  ];

  const [period, setPeriod] = useState("7"); // "Last 7 days" default

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

  // Chart: Daily Activity (all zeros to match screenshot)
  const dailyActivity = {
    series: [{ name: "Scans", data: new Array(categories.length).fill(0) }],
    options: {
      chart: { type: "line", height: 300, toolbar: { show: false } },
      stroke: { width: 2, curve: "straight" },
      dataLabels: { enabled: false },
      grid: { borderColor: "#e9ecef", strokeDashArray: 4 },
      xaxis: { categories, labels: { rotate: 0 } },
      yaxis: { min: 0, max: 4, tickAmount: 4 },
      tooltip: { theme: "light" },
    },
  };

  // Chart: Activity Breakdown (also zeros; can be wired later)
  const breakdown = {
    series: [
      { name: "Received", data: new Array(categories.length).fill(0) },
      { name: "Assigned", data: new Array(categories.length).fill(0) },
      { name: "Moved", data: new Array(categories.length).fill(0) },
    ],
    options: {
      chart: { type: "line", height: 300, toolbar: { show: false } },
      stroke: { width: 2, curve: "straight" },
      dataLabels: { enabled: false },
      grid: { borderColor: "#e9ecef", strokeDashArray: 4 },
      xaxis: { categories, labels: { rotate: 0 } },
      yaxis: { min: 0, max: 4, tickAmount: 4 },
      legend: { position: "top" },
      tooltip: { theme: "light" },
    },
  };

  // --- Export helpers (CSV stubs you can swap with API calls) ---
  const downloadCSV = (filename, rows) => {
    const csv =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInventory = () => {
    const rows = [
      ["Warehouse", "Location", "Items"],
      ...warehouses.map((w) => [w.name, w.sub, w.items]),
    ];
    downloadCSV("inventory-summary.csv", rows);
  };

  const handleExportMovement = () => {
    const rows = [["Date", "Received", "Assigned", "Moved"], ...categories.map((d) => [d, 0, 0, 0])];
    downloadCSV("movement-report.csv", rows);
  };

  const MetricRow = ({ label, value }) => (
    <div className="d-flex align-items-center justify-content-between py-2">
      <span className="text-muted">{label}</span>
      <strong className="fs-5">
        <CountUp start={0} end={value} duration={0.6} />
      </strong>
    </div>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
          <div>
            <BreadCrumb title="Reports & Analytics" pageTitle="Dashboard" url="/dashboard" />
            <div className="text-muted">Comprehensive inventory and movement reports for American Plaque</div>
          </div>
          <div className="d-flex gap-2">
            <Button color="light" onClick={handleExportInventory}>
              <i className="ri-download-2-line me-1"></i> Export Inventory
            </Button>
            <Button color="primary" onClick={handleExportMovement}>
              <i className="ri-file-text-line me-1"></i> Export Movement Report
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <Card className="mt-3 mb-3">
          <CardBody>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-medium">Report Period:</span>
              <div style={{ maxWidth: 220 }}>
                <Input
                  type="select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="0">This Month (to date)</option>
                </Input>
              </div>
            </div>
          </CardBody>
        </Card>

        <Row>
          <Col xl={6}>
            <Card className="h-100">
              <CardHeader>
                <h6 className="mb-0">Daily Activity</h6>
              </CardHeader>
              <CardBody>
                <ReactApexChart
                  dir="ltr"
                  options={dailyActivity.options}
                  series={dailyActivity.series}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>
          <Col xl={6}>
            <Card className="h-100">
              <CardHeader>
                <h6 className="mb-0">Activity Breakdown</h6>
              </CardHeader>
              <CardBody>
                <ReactApexChart
                  dir="ltr"
                  options={breakdown.options}
                  series={breakdown.series}
                  type="line"
                  height={300}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-3">
          {/* Inventory Summary */}
          <Col xl={8}>
            <Card>
              <CardHeader>
                <h6 className="mb-0">Inventory Summary</h6>
              </CardHeader>
              <CardBody>
                {warehouses.map((w, idx) => (
                  <div
                    key={w.id}
                    className={`d-flex align-items-start justify-content-between ${idx !== warehouses.length - 1 ? "mb-3" : ""}`}
                  >
                    <div>
                      <div className="fw-semibold">{w.name}</div>
                      <div className="text-muted small">{w.sub}</div>
                    </div>
                    <div className="fw-semibold">
                      <CountUp start={0} end={w.items} duration={0.6} />{" "}
                      <span className="text-muted">items</span>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>

          {/* System Performance */}
          <Col xl={4}>
            <Card>
              <CardHeader>
                <h6 className="mb-0">System Performance</h6>
              </CardHeader>
              <CardBody>
                <MetricRow label="Total Scans Today" value={0} />
                <MetricRow label="Active Warehouses" value={3} />
                <MetricRow label="Items in Transit" value={1} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Reports;
