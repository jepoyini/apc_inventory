import React, { useState, useEffect,PureComponent   } from "react"; 
import {
  Row,
  Col,
  Container
} from "reactstrap";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import 'react-toastify/dist/ReactToastify.css';
import Statistics from "./Statistics";
import Widget from './Widget';
import { format } from "date-fns";
import { Card, CardBody } from 'reactstrap';
import { LineChart, BarChart, Line, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography  } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
// import UpgradeAccountNotise from './UpgradeAccountNotise';
// import UsersByDevice from './UsersByDevice';
// import AudiencesMetrics from './AudiencesMetrics';
// import AudiencesSessions from './AudiencesSessions';
// import LiveUsers from './LiveUsers';
// import TopReferrals from './TopReferrals';
// import TopPages from './TopPages';
import { APIClient } from "../../../helpers/api_helper";
import { feature } from "topojson-client";

const Admin_Dashboard = () => {
  const api = new APIClient();
  document.title = "Statistics";

  const [Maindata, setMainData] = useState({
    total_users : 0,
    today_deposits: 0,
    total_deposits : 0,
    total_purchases : 0,
    pool_commissions : 0,
    total_commissions :0,
    deposits: 0,
    purchases: 0,
    commissions: 0,
    pool: 0,
    registeredusers: 0,
    memberlogins: 0,
    purchased_plan10: 0,
    purchased_plan50: 0,
    purchased_plan100: 0,
    purchased_plan250: 0,
    purchased_plan500: 0,
    purchased_plan1000: 0,
    purchased_plan2500: 0,
    purchased_plan5000: 0,
    purchased_plan7500: 0,
    purchased_plan10000: 0,
    purchased_plan15000: 0,
    purchased_plan20000: 0,
    withdrawable_balance :0,
    total_withdrawn:0,
    pending_withdrawal: 0, 
    approval_balance:0,
    total_rewards: 0,
    total_donations: 0,
    total_holding: 0,
    });


  const today = format(new Date(), "yyyy-MM-dd");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Add loading state
  const [greeting, setGreeting] = useState("");  
  const [userName, setUserName] = useState("");
  const [fromdate, setFromdate] = useState(today);
  const [todate, setTodate] = useState(today);
  const [downlineStats, setDownlineStats] = useState([]);


  // Check if is_admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sessionStorage.getItem("authUser")) {
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;
          const is_admin =obj.is_admin; 
          if (!is_admin)
          {
            navigate('/logout');
            return; 
          }

          const getGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour < 12) {
                return "Good Morning";
            } else if (currentHour < 18) {
                return "Good Afternoon";
            } else {
                return "Good Evening";
            }
        };

        setGreeting(getGreeting());

        if (sessionStorage.getItem("authUser")) {
            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            setUserName(obj.firstname + ' ' + obj.lastname);
        }

        fetchRow();
          
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonText: 'OK'
        });
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
   // fetchRow(); 
  }, [fromdate,todate]);
  // Main row fetching
  const fetchRow = async () => {
      try {
        if (sessionStorage.getItem("authUser")) {
    
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;
          const url = '/getstats';
          const data = {
              uid: uid,
              fromdate: fromdate, 
              todate: todate
          };
          const response = await api.post(url, data);
 
          if (response.data) {

            setMainData({
              total_users : response.data.total_users,
              total_deposits : response.data.total_deposits,
              today_deposits: response.data.today_deposits,
              total_deposits_flr : response.data.total_deposits_flr,
              total_purchases : response.data.total_purchases,
              pool_commissions : response.data.pool_commissions,
              total_commissions : response.data.total_commissions,
              total_purchases_matrix : response.data.total_purchases_matrix,
              pool_commissions_matrix : response.data.pool_commissions_matrix,
              total_commissions_matrix : response.data.total_commissions_matrix,
              deposits: response.data.deposits,
              purchases: response.data.purchases,
              commissions: response.data.commissions,
              pool: response.data.pool,
              registeredusers: response.data.registeredusers,
              memberlogins: response.data.memberlogins,
              purchased_plan10: response.data.purchased_plan10,
              purchased_plan50:response.data.purchased_plan50,
              purchased_plan100: response.data.purchased_plan100,
              purchased_plan250: response.data.purchased_plan250,
              purchased_plan500: response.data.purchased_plan500,
              purchased_plan1000:response.data.purchased_plan1000,
              purchased_plan2500: response.data.purchased_plan2500,
              purchased_plan5000: response.data.purchased_plan5000,
              purchased_plan7500: response.data.purchased_plan7500,
              purchased_plan10000: response.data.purchased_plan10000,
              purchased_plan15000: response.data.purchased_plan15000,
              purchased_plan20000: response.data.purchased_plan20000,
              total_wallet_balance:response.data.total_wallet_balance,
              root_wallet_balance:response.data.root_wallet_balance,
              total_withdrawn:response.data.total_withdrawn,
              pending_withdrawal: response.data.pending_withdrawal,
              approval_balance:response.data.approval_balance,
              total_rewards : response.data.total_rewards,
              total_donations:response.data.total_donations,
              total_holding:response.data.total_holding
            }); 

            // Fetch downline stats here
            const statsRes = await api.post("/getalluserstats", {    uid: uid });
            if (statsRes.status === "success" && Array.isArray(statsRes.data)) {
              setDownlineStats(statsRes.data);
            }

            return true;


          } else {
            window.location.href="/logout";
          }
        }
      } catch (error) {
        console.error('Error fetching rows:', error);
      } finally {
      }
    }; 

    const downloadMailingList = async () => {
      try {
        const response = await api.get('/getmailinglist.php');
        const data = response.data;
  
        // CSV headers
        const headers = ['ID', 'Full Name', 'Email', 'Sponsor', 'Date Created'];
  
        // Convert the data to CSV format
        const csvRows = [
          headers.join(','), // Header row
          ...data.map((item) =>
            [
              item.id,
              item.fullname,
              item.email,
              item.sponsor_name,
              item.date_created,
            ].join(',')
          ),
        ].join('\n');
  
        // Create a blob from the CSV data
        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
  
        // Create a link element and trigger a download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mailing_list.csv';
        a.click();
  
        // Cleanup: revoke the object URL after the download
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error fetching the mailing list:', error);
        alert('Failed to download the mailing list. Please try again later.');
      }
    };
class CustomizedLabel extends PureComponent {
  render() {
    const { x, y, value, width } = this.props;

    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="white"
        fontSize={12}
        textAnchor="middle"
      >
        {value}
      </text>
    );
  }
}

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}



// Convert to a lookup
// const dataMap = Object.fromEntries(userStats.map(d => [d.country, d.count]));

// // Color scale
// const colorScale = scaleLinear()
//   .domain([0, Math.max(...userStats.map(d => d.count))])
//   .range(["#ede7f6", "#7e57c2"]);

// const ChoroplethMap = () => {
//   return (
//     <ComposableMap>
//       <Geographies geography="https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json">
//         {({ geographies }) =>
//           geographies.map(geo => {
//             const countryName = geo.properties.name;
//             const count = dataMap[countryName] || 0;
//             return (
//               <Geography
//                 key={geo.rsmKey}
//                 geography={geo}
//                 fill={count ? colorScale(count) : "#EEE"}
//                 stroke="#FFF"
//               />
//             );
//           })
//         }
//       </Geographies>
//     </ComposableMap>
//   );
// };

const ChoroplethMap2 = ({ userStats }) => {
  const [geographies, setGeographies] = useState([]);

  const nameMap = {
    "United States": "United States of America",
    "Russia": "Russian Federation",
    "South Korea": "Republic of Korea",
    "North Korea": "Democratic People's Republic of Korea",
    "Vietnam": "Viet Nam",
    "Iran": "Iran (Islamic Republic of)",
    "Tanzania": "United Republic of Tanzania",
    "Venezuela": "Venezuela (Bolivarian Republic of)",
    "Syria": "Syrian Arab Republic",
    "Bolivia": "Bolivia (Plurinational State of)",
    "Brunei": "Brunei Darussalam",
    "Laos": "Lao People's Democratic Republic",
    "Moldova": "Republic of Moldova",
    "Czech Republic": "Czechia",
    "Ivory Coast": "Côte d'Ivoire",
    "Cape Verde": "Cabo Verde",
    "Swaziland": "Eswatini",
    // Add more as needed
  };

  const dataMap = Object.fromEntries(
    userStats.map(d => {
      const key = nameMap[d.country] || d.country;
      return [key, d.count];
    })
  );

  const maxCount = Math.max(...userStats.map(d => d.count));
  const colorScale = scaleLinear()
    .domain([0, maxCount * 0.25, maxCount * 0.5, maxCount * 0.75, maxCount])
    .range(["#ede7f6", "#c7aef3", "#a580e6", "#8d5fd4", "#7e57c2"]);

  useEffect(() => {
    fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
      .then(res => res.json())
      .then(topoData => {
        const worldFeatures = feature(topoData, topoData.objects.countries).features;
        setGeographies(worldFeatures);
      });
  }, []);

  return (
    <div style={{ transform: "scale(.5)", transformOrigin: "top left",  width: "160%", height: "500px" }}>
      <ComposableMap projection="geoMercator" width={800} height={400}>
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name || geo.properties.NAME || "";
              const count = dataMap[countryName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={count ? colorScale(count) : "#FFFFFF"}
                  stroke="#FFF"
                  title={countryName}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

  return (
    <div className="page-content">

      {loading ? (
            <Container fluid>
                <div id="status">
                    <div className="spinner-border text-secondary avatar-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
              {/* <div className="loading-overlay">
                <p><strong>Loading... Please wait</strong></p>
              </div> */}
            </Container>
          ) : (           
            <Container fluid>
               <BreadCrumb title="Statistics" pageTitle="Dashboard" url="/dashboard" />
              <Row className="mb-3 pb-1">
                <Col xs={12}>
                    <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                        <div className="flex-grow-1">
                            <h4 className="fs-16 mb-1">{greeting}, Admin {userName}</h4>
                            <p className="text-muted mb-0">Here's what's happening with our statistics today.</p>
                        </div>
                        <div className="mt-3 mt-lg-0">
                        {/* <button onClick={downloadMailingList} className="btn btn-primary mailing-list-button">
                          Export Mailing List
                        </button>   */}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                        <Col xxl={8}>
                          <Widget  Maindata={Maindata}  />
                        </Col>
                    {/*     <Statistics Maindata={Maindata} setFromdate={setFromdate} setTodate={setTodate}   />  */}
                    </Row>
{/* 
                <Row>
                  <Col xl={8}>
                    <Card className="card-animate">
                      <CardBody>
                        <h4 className="mb-4 card-title mb-0 flex-grow-1">Top Countries By Users</h4>

                          <ChoroplethMap2 userStats={downlineStats} />
            
                          <ResponsiveContainer width="100%" minWidth={1000} height={300}>
                          <BarChart
                            width={500}
                            height={300}
                            
                            data={downlineStats}
                            margin={{ top: 25, right: 30, left: 20, bottom:60 }}
                          >
                            
                            <XAxis dataKey="country" angle={-45} textAnchor="end" interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="count"
                                fill="#7f61bf"
                                barSize={100} // ✅ max bar width
                                activeBar={<Rectangle fill="gold" stroke="purple" />}
                        
                                label={<CustomizedLabel />}
                                />
                                 
                              
                          </BarChart>
                        </ResponsiveContainer>
                      </CardBody>
                    </Card>
                  </Col>

                </Row> */}

            {/*<Row>
                <UsersByDevice />
                <TopReferrals />
                <TopPages />
            </Row> */}
            </Container>
          )}

    </div>
  );
};

export default Admin_Dashboard;
