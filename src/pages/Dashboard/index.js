import React, { useState, useEffect, PureComponent } from 'react';
import { Col, Container, Row, Card, CardBody } from "reactstrap";
import classNames from "classnames";
import Widget from "./Widgets";
import Section from "./Section";
import { APIClient } from "../../helpers/api_helper";
import Swal from 'sweetalert2';
import { useNavigate, Link } from "react-router-dom";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";
import ReactApexChart from "react-apexcharts";

const DashboardEcommerce = () => {
  const api = new APIClient();
  document.title = "APC Inventory";
  const navigate = useNavigate();

  const [siteChecked, setSiteChecked] = useState({}); 
  const [siteSponsorhasrecord, setSiteSponsorhasrecord] = useState({}); 
  const [sponsorhasfirstfive, setSponsorHasFirstFive] = useState(); 


  const [Userbalance, setUserBalance] = useState({
    todays_earnings: 0,
    total_earnings: 0,
    onhold_earnings: 0,
    purchased_plans: 0,
    coded_downlines: 0,
    reward_wallet: 0,
    reward_cap: 0,
    expense_wallet: 0,
    total_withdrawed: 0,
    total_downline_members: 0,
    total_personaly_sponsored: 0,
    ewallet_balance : 0
  });

  const [periodType, setPeriodType] = useState("halfyearly");
  const [growthData, setGrowthData] = useState([]);
  const [downlineStats, setDownlineStats] = useState([]);
  const [countryData, setcountryData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  const totalCountries = downlineStats.length;
  const totalUsers = downlineStats.reduce((sum, item) => sum + item.count, 0);

  const ActionCard = ({ title, description, link }) => (
    <div className="rounded-md border p-4 hover:bg-accent transition-colors cursor-pointer">
      <Link to={link} className="font-semibold text-primary hover:underline">
        {title}
      </Link>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  );

const IBOActionCard = ({ title, description, link, withCheckbox = false, checkboxId }) => {
  const checkboxIdFinal = checkboxId || title.toLowerCase().replace(/\s+/g, "-");

  // get rank & user id (for per-user suppression key)
  const obj = JSON.parse(sessionStorage.getItem("authUser") || "{}");
  const rank = String(obj?.rank || "");
  const uid = String(obj?.id || "");

  let isAllowed = true;
  if (checkboxIdFinal === "48") {
    isAllowed = /^(admin|partner|ambassador|humanitarian)/i.test(rank);
  }

  const suppressKey = `ibo:suppressDialog:${uid}:${checkboxIdFinal}`;
  const SUPPRESS_MS = 48 * 60 * 60 * 1000; // 48 hours

  const openLink = () => {
    if (!link) return; // 🚫 do nothing if no link
    if (link === "SHARING.financial") {
      window.open(`https://${link}`, "_blank", "noopener");
    } else {
      navigate(link);
    }
  };

  const shouldShowDialog = () => {

    //pledging
    if (link === "/sharingdonations/studio" && !sponsorhasfirstfive) {
        return true; 
    }

    if (siteSponsorhasrecord[checkboxIdFinal]) return false;
    try {
      const raw = localStorage.getItem(suppressKey);
      if (!raw) return true;
      const until = Number(raw);
      if (!Number.isFinite(until)) return true;
      return Date.now() <= until;
    } catch {
      return true;
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!isAllowed || !link) return;

    if (shouldShowDialog()) {
      await Swal.fire({
        title: "Please contact the sponsor to join this opportunity.",
        icon: "info",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });

      try {
        localStorage.setItem(suppressKey, String(Date.now() + SUPPRESS_MS));
      } catch {}
    }

    openLink();
  };

  const LinkLike = ({ children }) => {
    const href = link === "SHARING.financial" ? `https://${link}` : link;
    return (
      <a
        href={href}
        onClick={handleClick}
        className="inline-block font-semibold text-primary hover:underline"
        role="link"
      >
        {children}
      </a>
    );
  };

  return (
    <div
      className={classNames(
        "rounded-md border p-4 transition-colors",
        isAllowed && link ? "hover:bg-accent cursor-pointer" : "cursor-not-allowed"
      )}
    >
      {/* Checkbox + title on the same row */}
      <div className="inline-flex items-center gap-[10px]">
        {withCheckbox && (
          <input
            type="checkbox"
            id={checkboxIdFinal}
            className="form-checkbox text-blue-600 pointer-events-none select-none shrink-0 mr10px"
            checked={!!siteChecked[checkboxIdFinal]}
            readOnly
            aria-hidden="true"
          />
        )}

        {isAllowed && link ? (
          <LinkLike>{title}</LinkLike>
        ) : (
          <span
            className="inline-block font-semibold text-red-500 cursor-not-allowed"
            aria-disabled="true"
          >
            {title}
          </span>
        )}
      </div>

      {/* ✅ exact 10px padding so description aligns */}
      <div className="pl-[10px] text-sm text-muted-foreground">{description}</div>
    </div>
  );
};


  const SessionsByCountriesCharts = ({ dataColors, downlineStats }) => {
    const chartColors = getChartColorsArray(dataColors);

    const series = [
      {
        name: "Downlines",
        data: downlineStats.map(item => item.count)
      }
    ];

    const options = {
      chart: {
        type: 'bar',
        height: 436,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          distributed: true,
          dataLabels: { position: 'top' }
        }
      },
      colors: chartColors,
      dataLabels: {
        enabled: true,
        offsetX: 32,
        style: {
          fontSize: '12px',
          fontWeight: 400,
          colors: ['#adb5bd']
        }
      },
      legend: { show: false },
      grid: { show: false },
      xaxis: {
        categories: downlineStats.map(item => item.country)
      }
    };

    return (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <ReactApexChart
          dir="ltr"
          options={options}
          series={series}
          type="bar"
          height={76 * 30}
          className="apex-charts"
        />
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = sessionStorage.getItem("authUser");
        if (!authUser) return;

        const obj = JSON.parse(authUser);
        const uid = obj.id;
        const data = { uid, csrf_token: obj.csrf_token };
debugger;
        const response = await api.post("/checkbalance", data);

        if (response.status === "success") {
          setUserBalance({
            todays_earnings: response.todays_earnings,
            total_earnings: response.total_earnings,
            growth_rate: response.growth_rate,
            onhold_earnings: response.onhold_earnings,
            purchased_plans: response.purchased_plans,
            coded_downlines: response.coded_downlines,
            reward_wallet: response.reward_wallet,
            reward_cap: response.reward_cap,
            expense_wallet: response.expense_wallet,
            total_withdrawed: response.total_withdrawed,
            total_downline_members: response.total_downline_members,
            total_personaly_sponsored: response.total_personaly_sponsored,
            gluapp_url: response.glueapp_url,
            ewallet_balance: response.ewallet_balance
          });

          setGrowthData([
            { name: 'Jan', earnings: 4000 },
            { name: 'Feb', earnings: 3000 },
            { name: 'Mar', earnings: 5000 },
            { name: 'Apr', earnings: 7000 },
            { name: 'May', earnings: 6000 },
            { name: 'Jun', earnings: 8000 },
            { name: 'Jul', earnings: 10000 }
          ]);

          // Fetch chart data
          setLoadingChart(true);
          const statsRes = await api.post("/getalluserstats", { uid });

          if (statsRes.status === "success" && Array.isArray(statsRes.data)) {
            setDownlineStats(statsRes.data);
            const countries = statsRes.data.map(item => item.country);
            const counts = statsRes.data.map(item => item.count);
            setcountryData([{ name: "Downlines", data: counts }]);
          }

          setLoadingChart(false);
        } else if (response.message?.includes("Failed Validation")) {
          navigate('/logout');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message,
            confirmButtonText: 'OK'
          });
        }

        const linksRes = await api.post("/getsitelinks", data); // <-- create this API if needed
        if (linksRes?.success && Array.isArray(linksRes.data)) {

          const map = {};
          const smap = {};
          for (const row of linksRes.data) {
            if (row?.site_id && String(row.reference || "").trim() !== "") {
              map[row.site_id] = true;
            }
            if (row?.site_id && row?.sponsor_has_record ) {
              smap[row.site_id] = true;
            }

          }
          setSiteChecked(map);
          setSiteSponsorhasrecord(smap);
          setSponsorHasFirstFive(linksRes.sponsor_has_first_five);
        }


      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingChart(false);
      }
    };

    fetchData();
  }, []);

  const [rightColumn, setRightColumn] = useState(true);
  const toggleRightColumn = () => setRightColumn(!rightColumn);

  class CustomizedLabel extends PureComponent {
    render() {
      const { x, y, value, width } = this.props;
      return (
        <text x={x + width / 2} y={y - 6} fill="white" fontSize={12} textAnchor="middle">
          {value}
        </text>
      );
    }
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">

                <Row>
                  <Col xl={12} order={{ xs: 2, xl: 1 }}>
                    <Section rightClickBtn={toggleRightColumn} />
                    <Widget Userbalance={Userbalance} />                  
                  </Col>

                </Row>

                <Row>
                  <Col xl={6}>
                    <Card className="card-height-100">
                      <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
                        <h4 className="card-title mb-0 flex-grow-1">Stock per Warehouse</h4>
                        <div className="text-muted small">
                          <span className="me-3">Total Warehouses: {totalCountries}</span>
                          <span>Total Items: {totalUsers}</span>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div id="countries_charts" className="apex-charts" dir="ltr">
                          {loadingChart ? (
                            <div className="text-center py-5">
                              <div className="spinner-border text-info" role="status">
                                <span className="visually-hidden">Loading chart...</span>
                              </div>
                            </div>
                          ) : (
                            <SessionsByCountriesCharts
                              dataColors='["--vz-info"]'
                              downlineStats={downlineStats}
                            />
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>

                  <Col xl={6}>
                    <Card className="card-animate">
                      <CardBody>
                        <div className="flex flex-col space-y-1.5 p-6">
                          <h3 className="text-2xl font-semibold leading-none tracking-tight">Getting Started</h3>
                          <p className="text-sm text-muted-foreground">Your checklist to success</p>
                        </div>
                        <div className="p-6 pt-0 grid gap-4">

                          <IBOActionCard title="Pledging Plan" description="Start Your Giving" link="/sharingdonations/studio" withCheckbox checkboxId="47"  />

                          <IBOActionCard title="Food Plan" description="Order Your Shakes" link="/site/balanced-shakes" withCheckbox checkboxId="49"  />

                          <IBOActionCard title="Wellness Plan" description="Buy Your Supplements" link="/site/decentralized-wellness" withCheckbox checkboxId="55" />

                          <IBOActionCard title="Business Plan" description="Invest Into Your Business" link="/site/decentralized-internet" withCheckbox  checkboxId="40"/>

                          <IBOActionCard title="Training Plan" description="Educate Your Community" link="/site/ai-interactive-learning" withCheckbox  checkboxId="57"/>

                          <IBOActionCard title="Marketing Plan" description="Share Your Opportunity" link="/site/aimarketingsystem" withCheckbox  checkboxId="62"/>

                          <IBOActionCard title="Financial Plan" description="Diversify Your Crypto Portfolio" link="SHARING.financial" withCheckbox  checkboxId="51" />

                          <IBOActionCard title="Retirement Plan" description="Purchase Your Banking Node" link="/site/decentralized-banking" withCheckbox checkboxId="59"/>

                          <IBOActionCard title="Legacy Plan" description="Set Up Your Passive DAOs" link="/site/dao-trading" withCheckbox checkboxId="48" />

                          <IBOActionCard title="Hope Plan" description="Give Your Story Of Hope" withCheckbox  />

                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardEcommerce;
