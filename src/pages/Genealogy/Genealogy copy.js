import React, { useRef, useEffect, useState } from "react";
import { Container, Row, Col, Label } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Tree from "react-d3-tree";
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";
import AsyncSelect from 'react-select/async';

export default function GenealogyPage() {
  const api = new APIClient();
  const treeContainer = useRef(null);
  const treeRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [treeTranslate, setTreeTranslate] = useState({ x: 0, y: 100 });
  const [originalData, setOriginalData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [nodeMap, setNodeMap] = useState({});
  const [totalpeople, setTotalpeople] = useState();
  const [highlightedId, setHighlightedId] = useState(null);

  const fetchOptions = async (inputValue) => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const response = await api.post('/getallusersdropdown', { search: inputValue, uid: obj.id });
      const options = response.rows.map(user => ({
        value: String(user.id),
        label: user.full_name,
      }));
      options.unshift({ value: '', label: 'Search by User' });
      return options;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '250px',
      backgroundColor: "#262a2f",
      borderColor: "#2a2f34",
      color: "white",
      marginRight: 15
    }),
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    if (selectedOption?.value) {
      const selectedId = String(selectedOption.value);
      setHighlightedId(selectedId);
      setTimeout(() => centerOnHighlightedNode(selectedId), 100);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser) {
          const response = await api.post("/getgenealogy", { uid: authUser.id, rank: authUser.rank }, { showLoader: true });
          if (response.status === "success" && response.data) {
            setOriginalData(response.data);
            setFilteredData(response.data);
            setNodeMap(buildNodeMap(response.data));
            setTotalpeople(response.totalmembers);
          } else {
            Swal.fire({ icon: "error", title: "Error", text: response.message || "Failed to fetch genealogy data." });
          }
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: error.message || "Something went wrong while fetching data." });
      }
    };

    if (treeContainer.current) {
      const width = treeContainer.current.offsetWidth;
      const height = treeContainer.current.offsetHeight;
      setDimensions({ width, height });
      setTreeTranslate({ x: width / 2, y: 100 });
    }

    fetchData();
  }, []);

  const buildNodeMap = (node, map = {}) => {
    if (!node) return map;
    map[String(node.user_id)] = node;
    if (node.children) {
      node.children.forEach(child => buildNodeMap(child, map));
    }
    return map;
  };

  const centerOnHighlightedNode = (id) => {
    const nodeDatum = nodeMap[String(id)];
    if (treeRef.current && nodeDatum) {
      treeRef.current.centerNode(nodeDatum);
    }
  };

  const renderCustomNode = ({ nodeDatum }) => {
    const isHighlighted = String(nodeDatum.user_id) === String(highlightedId);

    return (
      <g data-nodeid={nodeDatum.user_id}>
        <foreignObject x="-20" y="-20" width="40" height="40">
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: isHighlighted ? "green" : "#d4b158",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaUser style={{ color: "black", fontSize: "16px" }} />
          </div>
        </foreignObject>
        <foreignObject x="-60" y="22" width="120" height="77">
          <div
            style={{
              background: isHighlighted ? "green" : "#020202",
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "4px",
              textAlign: "center",
              fontSize: "11px",
              lineHeight: "1.2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "white",
            }}
          >
            <strong>#{nodeDatum.user_id}-{nodeDatum.name}</strong>
            <div>Sponsor:</div>
            <div>{nodeDatum.sponsor?.trim() ? `#${nodeDatum.sponsor_id} - ${nodeDatum.sponsor}` : "None"}</div>
            <div>Placement:</div>
            <div>{nodeDatum.placement?.trim() ? `#${nodeDatum.placement_id} - ${nodeDatum.placement}` : "None"}</div>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="page-content">
<Container fluid>
  <BreadCrumb title="Genealogy" pageTitle="Dashboard" url="/dashboard" />
  <Row>
    <Col xs={12}>
      <div className="p-4">
        <h2 className="text-3xl font-bold mb-4">Genealogy Tree</h2>

        <Row className="mb-3">
          <Col md={3}>
            <AsyncSelect
              cacheOptions
              classNamePrefix="custom-select"
              loadOptions={fetchOptions}
              onChange={handleChange}
              defaultOptions
              value={selectedOption}
              placeholder="Select any user"
              styles={customStyles}
            />
            {highlightedId && (
              <div className="text-success mt-2">✅ Record found and highlighted in tree.</div>
            )}
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Label className="me-3">
              <strong>Total Members:</strong> {totalpeople || 0}
            </Label>
          </Col>
        </Row>

        <div ref={treeContainer} className="tree-container" style={{ width: "100%", height: "600px", overflow: "auto" }}>
          {dimensions.width > 0 && filteredData && (
            <Tree
              ref={treeRef}
              data={filteredData}
              orientation="vertical"
              pathFunc="elbow"
              translate={treeTranslate}
              renderCustomNodeElement={renderCustomNode}
              zoomable={true}
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
