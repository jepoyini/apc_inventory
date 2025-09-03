import React, { useState, useEffect,useRef } from 'react';
import { Col, Container, Row } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import Tree from "react-d3-tree";
import axios from 'axios';
import Swal from 'sweetalert2';
import AsyncSelect from 'react-select/async';

const Genealogy = () => {
  document.title = "Admin - All Genealogy Tree | APC";
  const Initdata = [
    {
      // initial tree data
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(Initdata);
  const [translate, setTranslate] = useState({ x: 400, y: 200 });
  const [orientation, setOrientation] = useState('vertical');
  const [plan, setPlan] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const statusRef = useRef("");
  const useridRef = useRef("");

  useEffect(() => {
    fetchPlans();
  }, []);

  // Get users for filtering
  const fetchOptions = async (inputValue) => {
    try {
      const url = '/getallusersdropdown.php';
      const data = { search: inputValue };
      const response = await axios.post(url, data);
  
      const options = response.rows.map(user => ({
        value: user.id,
        label: user.full_name,
      }));
  
      // Add an empty option at the top
      options.unshift({ value: '', label: 'Filter by User' });
  
      return options;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };


  const handleInputChange = (newValue) => {
    return newValue;
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const userid = selectedOption['value']; 
    useridRef.current = userid; 
    fetchPlans();
    if (userid && selectedPlan) {
      fetchRows(userid, selectedPlan);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width:'250px',
      minWidth: '250px',
      backgroundColor: "#262a2f",
      borderColor: "#2a2f34",
      color: "white",
      marginRight: 15,
      marginBottom: 10
    }),
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.post('/getallplans.php');
      if (response.rows) {
        setPlans(response.rows);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchRows = async (selectedUser, plan) => {
    try {
      const data = {
        id: selectedUser,
        plan_id: plan
      };
      const response = await axios.post('/getdownlinetree.php', data);
      if (response.rows) {
        debugger; 
        if (response.rows.length===0)
        {
          setData(Initdata);
        } else {
          setData(response.rows);
        }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };


  const handlePlanChange = (e) => {
    debugger; 
    const planId = e.target.value;
    setSelectedPlan(planId);
    if (planId) {
      fetchRows(selectedUser, planId);
    }
  };

  const PopupCard = ({ nodeDatum, position }) => {
    if (!nodeDatum) return null;
  
    return (
      <div className="popup-card" style={{ left: position.x, top: position.y }}>
        <div className="popup-card-content">
          ID: {nodeDatum.id} <br/>
          Name: {nodeDatum.name} <br/>
          Sponsor: {nodeDatum.sponsor} <br/>
          Coded To: {nodeDatum.coded_name}
        </div>
      </div>
    );
  };

  const toggleNode = (nodeDatum) => {
    nodeDatum.expanded = !nodeDatum.expanded;
    setData([...data]);
  };

  const handleImageHover = (nodeDatum, event) => {
    const { clientX: x, clientY: y } = event;
    const offsetX = 260;
    const offsetY = 250;
    setHoveredNode(nodeDatum);
    setPopupPosition({ x: x - offsetX, y: y - offsetY });
  };

  const handleImageLeave = () => {
    setHoveredNode(null);
  };

  const Legend = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
      <span style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>LEGEND: </span>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: '#caa03f', marginRight: '5px' }}></div>
        <span>You</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: '#dbffad', marginRight: '5px' }}></div>
        <span>Coded Member</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: 'lightgrey', marginRight: '5px' }}></div>
        <span>Not Coded</span>
      </div>
    </div>
  );

  const renderRectSvgNode = ({ nodeDatum }) => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj.id;

    let fillColor = nodeDatum.coded_id === uid ? '#dbffad' : 'lightgrey';
    let fontColor = nodeDatum.coded_id === uid ? 'black' : '#9e9e9e';
    let iconfile = nodeDatum.coded_id === uid ? '/images/users/tree-icon.jpg' : '/images/users/tree-icon2.jpg';
    let textclass = nodeDatum.coded_id === uid ? 'treenode' : 'treenode2';

    if (nodeDatum.id === uid) {
      fillColor = "#caa03f";
      iconfile = '/images/users/tree-icon.jpg';
      textclass = 'treenode';
      fontColor = 'black';
    }

    return (
      <g>
        <rect
          width="120"
          height="65"
          x="-60"
          y="-20"
          fill={fillColor}
          stroke="black"
          onClick={() => toggleNode(nodeDatum)}
        />
        <text fill={fontColor} x="0" y="5" textAnchor="middle" fontSize="12" className={textclass}>
          ID: {nodeDatum.id}
        </text>
        <text fill={fontColor} x="0" y="20" textAnchor="middle" fontSize="12" className={textclass}>
          {nodeDatum.name}
        </text>
        <text fill={fontColor} x="0" y="35" textAnchor="middle" fontSize="12" className={textclass}>
          Coded To: {nodeDatum.coded_id}
        </text>
        <image
          href={iconfile}
          width="60"
          height="60"
          x="-30"
          y="-70"
          onMouseEnter={(e) => handleImageHover(nodeDatum, e)}
          onMouseLeave={handleImageLeave}
        />
      </g>
    );
  };

  const generateTreeData = (nodes) => {
    return nodes.map((node) => {
      if (node.expanded && node.children && node.children.length > 0) {
        return {
          ...node,
          children: generateTreeData(node.children),
        };
      } else {
        return {
          ...node,
          children: [],
        };
      }
    });
  };


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="All Genealogy" pageTitle="Dashboard" url="/dashboard" />
          <Row>
            <Col xs={12}>
              <h3>ALL Users Payline Genealogy Tree</h3>
            </Col>
          </Row>
          <Row className="mt-15">
            <Col xs={12}>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="controls1">
                <label htmlFor="user" className="mr10">Choose a User: </label>
                  <AsyncSelect
                      cacheOptions
                      loadOptions={fetchOptions}
                      onInputChange={handleInputChange}
                      onChange={handleChange}
                      defaultOptions
                      value={selectedOption}
                      placeholder="Select any user"
                      styles={customStyles}
                    />   
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="controls1">
                <label htmlFor="plan" className="mr10">Choose a plan: </label>
                <select className="w100" id="plan" value={selectedPlan} onChange={handlePlanChange}>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="controls2">
                <label htmlFor="orientation" className="mr26">Orientation: </label>
                <select
                  className="w100"
                  id="orientation"
                  onChange={(e) => setOrientation(e.target.value)}
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="App">
                <br></br>
                <Legend />
                {hoveredNode && <PopupCard nodeDatum={hoveredNode} position={popupPosition} />}
                <div className="tree-container">
                  <Tree
                    data={generateTreeData(data)}
                    translate={translate}
                    renderCustomNodeElement={renderRectSvgNode}
                    pathClassFunc={() => "link"}
                    orientation={orientation}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Genealogy;
