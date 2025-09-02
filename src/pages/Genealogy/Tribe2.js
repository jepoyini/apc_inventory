import React, { useRef, useEffect, useState } from "react";
import { Container, Row, Col, Label } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Tree from "react-d3-tree";
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";

export default function Tribe() {
  const api = new APIClient();
  const treeContainer = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser) {
          const response = await api.post("/gettribe", { uid: authUser.id }, { showLoader: true });

          if (response.status === "success" && response.data) {
            setTreeData(response.data);
          } else {
            Swal.fire("Error", response.message || "Failed to load tribe data.", "error");
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message || "Something went wrong.", "error");
      }
    };

    if (treeContainer.current) {
      setDimensions({
        width: treeContainer.current.offsetWidth,
        height: treeContainer.current.offsetHeight
      });
    }

    fetchData();
  }, []);

  const renderCustomNode = ({ nodeDatum }) => (
    <g>
      <foreignObject x="-20" y="-20" width="40" height="40">
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: nodeDatum.user_id ? "#ffc94c" : "#ccc",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <FaUser style={{ color: "#000", fontSize: "16px" }} />
        </div>
      </foreignObject>

      <foreignObject x="-60" y="22" width="120" height="40">
        <div
          style={{
            background: "#000",
            color: "white",
            borderRadius: "6px",
            padding: "4px",
            textAlign: "center",
            fontSize: "11px",
            lineHeight: "1.2"
          }}
        >
          {nodeDatum.user_id ? (
            <strong>#{nodeDatum.user_id} - {nodeDatum.name}</strong>
          ) : (
            <strong>Empty</strong>
          )}
        </div>
      </foreignObject>
    </g>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Tribe Referral Tree" pageTitle="Dashboard" url="/dashboard" />
        <Row>
          <Col xs={12}>
            <div className="p-4">
              <div ref={treeContainer} className="tree-container" style={{ height: "500px" }}>
                {dimensions.width > 0 && treeData && (
                  <Tree
                    data={treeData}
                    orientation="vertical"
                    pathFunc="elbow"
                    translate={{ x: dimensions.width / 2, y: 100 }}
                    renderCustomNodeElement={renderCustomNode}
                    collapsible={false}
                  />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
