import React, { useEffect, useState } from "react";
import { Container, Row, Col, Input, Button, Label } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";

// Tree node component
const TreeNode = ({ node, level = 0, expandedNodes, searchMatch }) => {
  const [expanded, setExpanded] = useState(expandedNodes.includes(node.user_id));
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    setExpanded(expandedNodes.includes(node.user_id));
  }, [expandedNodes, node.user_id]);

  const isMatch = node.user_id === searchMatch;

  return (
    <li>
      <div
        style={{
          cursor: hasChildren ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span style={{ width: 16 }}>
            [{expanded ? "-" : "+"}]
          </span>
        )}
        <FaUser style={{ color: node.user_id ? "#ffc94c" : "#aaa" }} />
        {node.user_id ? (
          <span style={{ fontWeight: isMatch ? "bold" : "normal", color: isMatch ? "#0d6efd" : "inherit" }}>
            <strong>#{node.user_id}</strong>
            {node.username ? ` (${node.username})` : ''} - {node.name}
          </span>
        ) : (
          <span><em>Empty</em></span>
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

// Main component
export default function Tribe() {
  const api = new APIClient();
  const [treeData, setTreeData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [searchMatch, setSearchMatch] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);

  // Helper to collect all nodes up to level 2
  const collectExpandedNodes = (node, level = 0, maxLevel = 1, result = []) => {
    if (!node || level > maxLevel) return result;
    result.push(node.user_id);
    if (node.children) {
      node.children.forEach(child => collectExpandedNodes(child, level + 1, maxLevel, result));
    }
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(sessionStorage.getItem("authUser"));
        if (authUser) {
          const response = await api.post("/gettribe", { uid: authUser.id }, { showLoader: true });

          if (response.status === "success" && response.data) {
            setTreeData(response.data);
            setTotalMembers(countNodes(response.data));
            const expandedUpToLevel2 = collectExpandedNodes(response.data, 0, 0);
            setExpandedNodes(expandedUpToLevel2);
          } else {
            Swal.fire("Error", response.message || "Failed to load tribe data.", "error");
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message || "Something went wrong.", "error");
      }
    };

    fetchData();
  }, []);
  const countNodes = (node) => {
    if (!node) return 0;
    let count = node.user_id ? 1 : 0;
    if (node.children) {
      for (let child of node.children) {
        count += countNodes(child);
      }
    }
    return count;
  };
  const findPathToUser = (node, term, path = []) => {
    if (!node) return null;

    const termLower = term.toLowerCase();
    const match =
      (node.user_id && node.user_id.toString() === term) ||
      (node.name && node.name.toLowerCase().includes(termLower)) ||
      (node.username && node.username.toLowerCase().includes(termLower));

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
    if (!searchValue.trim() || !treeData) return;

    const path = findPathToUser(treeData, searchValue.trim());
    if (path) {
      setExpandedNodes(path);
      setSearchMatch(path[path.length - 1]);
    } else {
      setExpandedNodes([]);
      setSearchMatch(null);
      Swal.fire("Not Found", "No matching user ID or name found in the tree.", "info");
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Tribe Referral Tree" pageTitle="Dashboard" url="/dashboard" />
        <Row className="mb-3">
          <Col md={3}>
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by ID, username or name"
            />
          </Col>
          <Col md="auto">
            <Button color="primary" onClick={handleSearch}>Search</Button>
          </Col>
          <Col className="mt-2 mt-md-0">
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
