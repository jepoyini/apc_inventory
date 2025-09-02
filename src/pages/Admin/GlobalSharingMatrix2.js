import React, { useState, useEffect,useRef } from 'react';
import { Col, Container, Row, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import Tree from "react-d3-tree";
import axios from 'axios';
import Swal from 'sweetalert2';
import AsyncSelect from 'react-select/async';
import { APIClient } from "../../helpers/api_helper";



const buildTree = (nodes, parentId) => {
  const children = nodes.filter(node => node.upline_id === parentId);
  return children.map(child => ({
    name: `User #${child.user_id}`,
    uid: child.user_id,
    attributes: {
      payee_id: child.upline_user_id,
      complete: 'completed' // Example attribute, adjust based on your data
    },
    children: buildTree(nodes, child.id)
  }));
};

// Custom node rendering function
const renderCustomNode = ({ nodeDatum }) => {
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
    ? "#d9dbe4"
    : complete === 'completed'
    ? "#d4b158"
    : complete === 'incomplete'
    ?  "green"
    : "#ffffff";

  return (
    <g>
      <circle r={34} fill={circleColor} />
      <text fill="black" textAnchor="middle" dy={nodeDatum.uid ? "-10px" : "0.1em"} fontSize={12}>
        {nodeDatum.uid || "Empty"}
      </text>
      <text fill="black" textAnchor="middle" dy="5px" fontSize={12}>
        {displayName}
      </text>
      {/* <text fill="black" textAnchor="middle" dy="20px" fontSize={10}>
        {displaycomm}
      </text> */}
    </g>
  );
};

const MatrixTree = () => {
    const api = new APIClient();  
  const treeContainer = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [matrixData, setMatrixData] = useState([
    { id: 1, user_id: 2, upline_id: 0, upline_user_id: 0, entry_position: 0 },
    // { id: 28, user_id: 100, upline_id: 1, upline_user_id: 1, entry_position: 1 },
    // { id: 29, user_id: 101, upline_id: 1, upline_user_id: 1, entry_position: 2 },
    // { id: 30, user_id: 102, upline_id: 1, upline_user_id: 1, entry_position: 3 },
    // { id: 36, user_id: 103, upline_id: 1, upline_user_id: 1, entry_position: 4 },
    // { id: 37, user_id: 104, upline_id: 1, upline_user_id: 1, entry_position: 5 },
    // { id: 38, user_id: 105, upline_id: 28, upline_user_id: 100, entry_position: 1 },
    // { id: 39, user_id: 106, upline_id: 28, upline_user_id: 100, entry_position: 2 }
    ]);
  

  


  useEffect(() => {
    if (treeContainer.current) {
      const { width, height } = treeContainer.current.getBoundingClientRect();
      setDimensions({ width, height });
    }

    fetchRows();
  }, []);

  const root = matrixData.find(node => node.upline_id === 0);
  if (!root) return <div>No root user found.</div>;

  const treeData = [{
    name: `Root User #${root.user_id}`,
    uid: root.user_id,
    attributes: {
      payee_id: root.upline_user_id,
      complete: 'completed'
    },
    children: buildTree(matrixData, root.id)
  }];

  const fetchRows = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));      
      const data = { uid:obj.id };  
      const response = await api.post('/getglobalsharingmatrix', data);
      debugger; 
      if (response.rows) {
        if (response.rows.length===0)
        {
          setMatrixData([]);
        } else {
          console.log(response.rows)
          setMatrixData(response.rows);
         // console.log(matrixData)
        }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };


  return (

    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="SHARING Global Matrix" pageTitle="Dashboard" url="/dashboard" />

          <Row className="mt-15">
            <Col xs={12}>

                <div style={{ width: '100%', height: '100vh' }} ref={treeContainer}>
                <Tree
                  data={treeData}
                  orientation="vertical"
                  translate={{ x: dimensions.width / 2, y: 100 }}
                  renderCustomNodeElement={renderCustomNode}
                />
              </div>

            </Col>
          </Row>


          


        </Container>
      </div>
    </React.Fragment>

  );
};

export default MatrixTree;
