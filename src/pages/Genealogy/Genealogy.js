import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Label } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";
import AsyncSelect from "react-select/async";

const TreeNode = ({ node, level = 0, expandedNodes, searchMatch }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    setExpanded(expandedNodes.includes(node.user_id) || expandedNodes.length === 0);
  }, [expandedNodes, node.user_id]);

  const isMatch = node.user_id === searchMatch;

  return (
    <li>
      <div
        style={{
          cursor: hasChildren ? "pointer" : "default",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginBottom: "8px",
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {hasChildren && (
            <span style={{ width: 16 }}>
              [{expanded ? "-" : "+"}]
            </span>
          )}
          <FaUser style={{ color: node.user_id ? "#ffc94c" : "#aaa" }} />
          {node.user_id ? (
            <span style={{ fontWeight: isMatch ? "bold" : "normal", color: isMatch ? "#0d6efd" : "inherit" }}>
              <strong>#{node.user_id}</strong> - {node.name} {node.username ? `(${node.username})` : ""}
            </span>
          ) : (
            <span><em>Empty</em></span>
          )}
        </div>
        {node.user_id && (
          <div style={{ marginLeft: 24, fontSize: "12px", color: "#666" }}>
            <div>Sponsor: {node.sponsor ? `#${node.sponsor_id} - ${node.sponsor}` : "None"}</div>
            <div>Placement: {node.placement ? `#${node.placement_id} - ${node.placement}` : "None"}</div>
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <ul style={{ marginLeft: 20 }}>
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              searchMatch={searchMatch}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function GenealogyPage() {
  const api = new APIClient();
  const [treeData, setTreeData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [searchMatch, setSearchMatch] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser) {
          const response = await api.post("/getgenealogy", { uid: authUser.id, rank: authUser.rank }, { showLoader: true });

          if (response.status === "success" && response.data) {
            setTreeData(response.data);
            setExpandedNodes(collectExpandedUpToLevel(response.data, 0));
            setTotalMembers(countMembers(response.data));
          } else {
            Swal.fire("Error", response.message || "Failed to load genealogy data.", "error");
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message || "Something went wrong.", "error");
      }
    };

    fetchData();
  }, []);

  const countMembers = (node) => {
    if (!node) return 0;
    let count = node.user_id ? 1 : 0;
    if (node.children) {
      node.children.forEach(child => {
        count += countMembers(child);
      });
    }
    return count;
  };

  const collectExpandedUpToLevel = (node, maxLevel = 1, level = 0, result = []) => {
    if (!node || level > maxLevel) return result;
    if (node.user_id) result.push(node.user_id);
    if (node.children) {
      node.children.forEach(child =>
        collectExpandedUpToLevel(child, maxLevel, level + 1, result)
      );
    }
    return result;
  };

  const findPathToUser = (node, term, path = []) => {
    if (!node) return null;

    const termLower = term.toLowerCase();
    const match =
      (node.user_id && node.user_id.toString() === term) ||
      (node.username && node.username.toLowerCase().includes(termLower)) ||
      (node.name && node.name.toLowerCase().includes(termLower));

    if (match) {
      return [...path, node.user_id];
    }

    if (node.children) {
      for (let child of node.children) {
        const result = findPathToUser(child, term, [...path, node.user_id]);
        if (result) return result;
      }
    }

    return null;
  };

  const handleSearch = () => {
    if (!selectedUser?.value || !treeData) return;

    const path = findPathToUser(treeData, selectedUser.value);
    if (path) {
      setExpandedNodes(path);
      setSearchMatch(path[path.length - 1]);
    } else {
      setExpandedNodes([]);
      setSearchMatch(null);
      Swal.fire("Not Found", "No matching user ID, username, or name found in the tree.", "info");
    }
  };

  const fetchOptions = async (inputValue) => {
    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const res = await api.post("/getallusersdropdown", { search: inputValue, uid: authUser.id });
      return res.rows.map(user => ({
        value: user.id.toString(),
        label: `#${user.id} - ${user.full_name} (${user.username})`,
      }));
    } catch (err) {
      console.error(err);
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

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Genealogy Tree" pageTitle="Dashboard" url="/dashboard" />
        <Row className="mb-3 align-items-center">
          <Col md={4}>
            <AsyncSelect
              cacheOptions
              loadOptions={fetchOptions}
              defaultOptions
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder="Search by ID, username, or name"
              styles={customStyles}
            />
          </Col>
          <Col md="auto">
            <Button color="primary" onClick={handleSearch}>
              Search
            </Button>
          </Col>
          <Col>
            <Label><strong>Total Members:</strong> {totalMembers}</Label>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <div className="p-4">
              {treeData ? (
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  <TreeNode
                    node={treeData}
                    expandedNodes={expandedNodes}
                    searchMatch={searchMatch}
                  />
                </ul>
              ) : (
                <div>Loading tree...</div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
