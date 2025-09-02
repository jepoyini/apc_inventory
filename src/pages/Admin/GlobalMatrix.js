import React, { useState, useEffect,useRef } from 'react';
import { Col, Container, Row, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import Tree from "react-d3-tree";
import axios from 'axios';
import Swal from 'sweetalert2';
import AsyncSelect from 'react-select/async';

const GlobalMatrix = () => {
  document.title = "Admin - SHARING Glob";
  const Initdata = [
    {
      // initial tree data
    }
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [matrixTrees, setMatrixTrees] = useState(Initdata);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [planCounts, setPlanCounts] = useState({});
  const [totalpeople, setTotalpeople] = useState();
  const [totalpeoplecycled, setTotalpeoplecycled] = useState();
  const [totalfilled, setTotalFilled] = useState();
  const [joined_today, setJoined_today] = useState();
  

  useEffect(() => {
    fetchPlans();
    fetchRows(1);
  }, []);

  // Get users for filtering
  const fetchOptions = async (inputValue) => {
    try {
      const url = '/getallusersdropdown.php';
      const obj = JSON.parse(sessionStorage.getItem("authUser"));      
      const data = { search: inputValue ,csrf_token: obj.csrf_token,uid:obj.id };      
      const response = await axios.post(url, data);
      const options = response.rows.map(user => ({
        value: user.id,
        label: user.full_name,
      }));
  
      // Add an empty option at the top
      options.unshift({ value: '', label: 'Filter by User' });

      fetchRows(plan);

      return options;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
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
      const response = await axios.post('/getallmatrixplans.php');
      if (response.rows) {
        setPlans(response.rows);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchRows = async (plan) => {
    try {
      const data = {
        plan_id: plan
      };
      const response = await axios.post('/getglobalmatrix.php', data);
     // debugger; 
      if (response.rows) {
        if (response.rows.length===0)
        {
          setMatrixTrees(Initdata);
        } else {
          setMatrixTrees(response.rows);
          setTotalpeople(response.total);
          setJoined_today(response.joined_today);
          setTotalpeoplecycled(response.total_cycled)
          setTotalFilled(response.total_filled)
        }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

  const SimulateMatrixEntry = async () => {
    try {
      const data = {
        user_id: userId,
        plan_id: selectedPlan
      };
     
      const response = await axios.post('/simulatematrixentry.php', data);
 
      if (response.status==="success") {
        handleRefresh();
      }
      Swal.fire({
        title: "",
        text: response.data,
        icon: "primary",
        confirmButtonText: "OK",
      }).then((result) => {
      });       
      toggleModal();
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    setSelectedPlan(planId);
    if (planId) {
      fetchRows(planId);
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

  const treeContainerStyle = {
    width: '100%',
    height: '1400px'
  }; 

  // Refresh data when clicking the refresh button
  const handleRefresh = () => {
    fetchRows(selectedPlan);
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleSimulate = () => {
    toggleModal();
  };

  // Refresh data when clicking the refresh button
  const handleClear = () => {
    ClearData();
  };

  const ClearData = async () => {
    try {
      const data = {
        user_id: userId,
        plan_id: selectedPlan
      };
      const response = await axios.post('/simulatematrixclear.php', data);
      if (response.status==="success") {
        handleRefresh();
      }
      Swal.fire({
        title: "",
        text: "Matrix Data Cleared!",
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
      }); 
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

// Custom node rendering function
const renderCustomNode = ({ nodeDatum }) => {
  // Determine if this is a placeholder node based on the 'status' attribute

  const isPlaceholder = nodeDatum.name && nodeDatum.name === "Empty";
  const displayName = nodeDatum.name && nodeDatum.name !== "Empty"
    ? nodeDatum.name.length > 7 
      ? `${nodeDatum.name.substring(0, 7)}..` 
      : nodeDatum.name
    : "";
    const displaycomm = nodeDatum.attributes?.payee_id 
  ? `C-#${nodeDatum.attributes.payee_id}` 
  : "";
    const complete = nodeDatum.attributes?.complete;
    const circleColor = isPlaceholder
    ? "#d9dbe4" // Placeholder color
    : complete === 'completed'
    ? "#d4b158" // Complete = 0 color
    : complete === 'incomplete'
    ?  "green" // Complete = 1 color
    : "#ffffff"; // Default color (optional)
  return (
    <g>
      {/* Circle color changes based on whether the node is a placeholder */}
      <circle r={34} fill={circleColor} />
      
      {/* Center the main text inside the circle */}
      <text fill="black" textAnchor="middle" dy={nodeDatum.uid ? "-10px" : "0.1em"}  fontSize={12}>
        {nodeDatum.uid || "Empty"}
      </text>
      
      {/* Show position and status information below the name, if available */}
    
        <text fill="black" textAnchor="middle" dy="5px" fontSize={10}>
           {displayName}
        </text>

        <text fill="black" textAnchor="middle" dy="20px" fontSize={10}>
           {displaycomm}
        </text>
    </g>
  );
};


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
          <BreadCrumb title="Global Matrix" pageTitle="Dashboard" url="/dashboard" />
          <Row>
            <Col xs={12}>
              <h3>2x2 Global Matrix</h3>
            </Col>
          </Row>
          <Row className="mt-15">
            <Col xs={12}>
            </Col>
          </Row>
          
          <Row>
            <Col xs={12}>
              <div className="controls1">
                <label htmlFor="plan" className="mr10">Choose a plan: </label>
                <select className="w200" id="plan" value={selectedPlan} onChange={handlePlanChange}>
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
                  className="w200"
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
    <div className="d-flex flex-wrap align-items-center mt-3">
      <Label className="me-3">
        <strong>Total filled positions:</strong> {totalfilled || 0}
      </Label>
      <Label className="me-3">
        <strong>Total People:</strong> {totalpeople || 0}
      </Label>
      <Label className="me-3">
        <strong>Total people who have cycled:</strong> {totalpeoplecycled || 0}
      </Label>
      <Label className="me-3">
        <strong>Joined Today (as of {new Date().toLocaleTimeString()}):</strong> {joined_today || 0}
      </Label>
    </div>
  </Col>
</Row>
          <br></br>

          <Row>
            <Col xs={12}>
            <Button color="primary" onClick={handleRefresh} className="ml-2">
                  Refresh
            </Button> 
            <Button color="primary" onClick={handleSimulate} className="ml-15"
            style={{ display: 'none' }} >
                  Simulate Next Entry
            </Button> 
            <Button color="primary" onClick={handleClear} className="ml-15" 
            style={{ display: 'none' }} >
                  Clear Data
            </Button> 
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <div className="App">
                <br></br>

                <div className="tree-container">
                {matrixTrees.length > 0 ? (
                            matrixTrees.map((matrixTree, index) => (
                                <div key={index} style={treeContainerStyle}>

                                    <Tree
                                    data={matrixTree}
                                    pathFunc="step"
                                    collapsible={true}
                                    translate={{ x: 200, y: 70 }}
                                    renderCustomNodeElement={renderCustomNode}
                                    nodeSize={{ x: 70, y: 85 }} 
                                    orientation={orientation}
                                  />
                                </div>
                            ))
                        ) : (
                              <div className="alert alert-danger p-10" role="alert"  style={{ width: "50%" }}>
                                  <strong>No matrices found with this category! </strong> 
                              </div>   
                        )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Modal for user ID input */}
          <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>Simulate Entry</ModalHeader>
            <ModalBody>
              <Label for="userId">Enter User ID:</Label>
              <Input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={SimulateMatrixEntry}>
                Proceed
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              
            </ModalFooter>
          </Modal>


        </Container>
      </div>
    </React.Fragment>
  );
};

export default GlobalMatrix;
