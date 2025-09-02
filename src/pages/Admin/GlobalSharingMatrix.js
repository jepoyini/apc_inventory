import React, { useState, useEffect, useRef } from 'react';
import { Col, Container, Row, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import Tree from "react-d3-tree";
import Swal from 'sweetalert2';
import { APIClient } from "../../helpers/api_helper";

const GlobalMatrix = () => {
  const api = new APIClient();
  document.title = "Admin - SHARING GLOBAL MATRIX";

  const [searchQuery, setSearchQuery] = useState("");
  const [matrixTrees, setMatrixTrees] = useState([]);
  const [orientation, setOrientation] = useState('vertical');
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [totalpeople, setTotalpeople] = useState();
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { uid: obj.id };
      const response = await api.post('/getglobalsharingmatrix', data, { showLoader: true });

      if (response.rows) {
        const flatMatrix = response.rows.map(row => ({
          id: parseInt(row.id),
          user_id: parseInt(row.user_id),
          username: row.username,
          upline_id: parseInt(row.upline_id),
          upline_user_id: parseInt(row.upline_user_id),
          entry_position: parseInt(row.entry_position),
          sponsor_id: parseInt(row.sponsor_id),
          signup_sponsor_id: parseInt(row.signup_sponsor_id),
        }));

        const tree = buildTree(flatMatrix);
        setMatrixTrees([tree[0]]);
        setOriginalData([tree[0]]);
        setFilteredData([tree[0]]);
        setTotalpeople(response.rows.length);
      } else {
        setMatrixTrees([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

  const buildTree = (nodes, parentId = 0) => {
    return nodes
      .filter((node) => node.upline_id === parentId)
      .map((node) => ({
        id: node.id,
        name: node.username,
        uid: node.user_id,
        attributes: {
          sponsor_id: node.sponsor_id,
          payee_id: node.upline_user_id,
          complete: 'completed',
          signup_sponsor_id: node.signup_sponsor_id
        },
        children: buildTree(nodes, node.id)
      }));
  };

  const renderCustomNode = ({ nodeDatum }) => {
  const isPlaceholder = nodeDatum.name === "Empty";
  const displayName = nodeDatum.name && nodeDatum.name !== "Empty"
    ? nodeDatum.name.length > 7
      ? `${nodeDatum.name.substring(0, 7)}..`
      : nodeDatum.name
    : "";
  const displaysponsor = nodeDatum.attributes?.sponsor_id
    ? `SID-${nodeDatum.attributes.signup_sponsor_id}`
    : "";
  const complete = nodeDatum.attributes?.complete;

  const lowerQuery = searchQuery.toLowerCase().trim();
  const isMatch =
    lowerQuery === ''
      ? 'all'
      : nodeDatum.name?.toLowerCase().includes(lowerQuery) ||
        nodeDatum.uid?.toString().includes(lowerQuery);

  const circleColor = isMatch === 'all'
    ? "#d4b158" // gold when no search
    : isMatch
      ? "green" // green for match
      : isPlaceholder
        ? "#d9dbe4"
        : complete === 'completed'
          ? "#d4b158"
          : complete === 'incomplete'
            ? "green"
            : "#ffffff";

    return (
      <g>
        <circle r={34} fill={circleColor} />
        <text fill="black" textAnchor="middle" dy={nodeDatum.uid ? "-10px" : "0.1em"} fontSize={12}>
          {"#"}{nodeDatum.uid || "Empty"}
        </text>
        <text fill="black" textAnchor="middle" dy="5px" fontSize={12}>
          {displayName}
        </text>
        <text textAnchor="middle" dy="22px" fontSize={10}>
          {displaysponsor}
        </text>
      </g>
    );
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleSimulate = () => {
    toggleModal();
  };

  const handleClear = () => {
    ClearData();
  };

  const ClearData = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete all dummy matrix data. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (confirm.isConfirmed) {
      try {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const data = { uid: obj.id };
        const response = await api.post('/simulatematrixclear', data);
        if (response.status === "success") {
          fetchRows();
        }

        Swal.fire({
          title: "",
          text: "Matrix Dummy Data Cleared!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error('Error clearing matrix data:', error);
      }
    }
  };

  const handleSearch = () => {
    setFilteredData([...originalData]); // just refresh tree
  };

  const SimulateMatrixEntry = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = {
        uid: obj.id,
        username: userId,
        sponsor_id: sponsorId,
      };

      const response = await api.post('/simulatematrixentry', data, { showLoader: true });

      if (response.status === "success") {
        fetchRows();
      }

      Swal.fire({
        title: "New Dummy User Added!",
        icon: "primary",
        confirmButtonText: "OK",
      });

      toggleModal();
    } catch (error) {
      console.error('Error simulating matrix entry:', error);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="SHARING Global Matrix" pageTitle="Dashboard" url="/dashboard" />

          <Row className="mt-15">
            <Col xs={12}>GLOBAL SHARING MATRIX STARTING FROM THE ROOT</Col>
          </Row>

          <br />

          <Row>
            <Col xs={12}>
              <div className="mb-4 d-flex gap-2 search-bar">
                <Input
                  placeholder="Search user..."
                  className="w-25"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="btn btn-soft-warning" onClick={handleSearch}>
                  Highlight Match
                </Button>
              </div>

              <Button className="btn btn-soft-warning" onClick={fetchRows}>
                Refresh
              </Button>
              <Button className="btn btn-soft-warning hide" onClick={handleSimulate} style={{ marginLeft: '15px' }}>
                Simulate Next Entry
              </Button>
              <Button className="btn btn-soft-warning hide" onClick={handleClear} style={{ marginLeft: '15px' }}>
                Clear Dummy Data
              </Button>
            </Col>
          </Row>

          <br />

          <Row>
            <Col xs={12}>
              <Label className="me-3">
                <strong>Total People:</strong> {totalpeople || 0}
              </Label>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <div className="App">
                <br />
                <div className="tree-container">
                  {filteredData && filteredData.length > 0 ? (
                    filteredData.map((matrixTree, index) => (
                      <div key={index} style={{ width: '100%', height: '100%' }}>
                        <Tree
                          data={matrixTree}
                          pathFunc="step"
                          collapsible={true}
                          translate={{ x: 400, y: 70 }}
                          renderCustomNodeElement={renderCustomNode}
                          nodeSize={{ x: 100, y: 95 }}
                          orientation={orientation}
                          pathClassFunc={() => 'link-custom'}
                        />
                      </div>
                    ))
                  ) : (
                    <div>No results found.</div>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>Simulate Entry</ModalHeader>
            <ModalBody>
              <Label for="userId">Enter Dummy Username:</Label>
              <Input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Dummy Username"
              />
              <br />
              <Label for="sponsorId">Enter Sponsor ID:</Label>
              <Input
                type="text"
                id="sponsorId"
                value={sponsorId}
                onChange={(e) => setSponsorId(e.target.value)}
                placeholder="Enter Sponsor ID"
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
