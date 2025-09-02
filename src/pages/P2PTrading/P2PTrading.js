import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CardBody, Row, Col, Card, Container, CardHeader, Nav, NavItem,
  NavLink, TabContent, TabPane
} from "reactstrap";
import classnames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import { APIClient } from "../../helpers/api_helper";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const P2PTrading = () => {
  document.title = "P2PTrading | IBO Mastermind";
  const navigate = useNavigate();
  const api = new APIClient();

  const [mainTable, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [rewardbalance, setTotalBalance] = useState(0);
  const [rewardcap, setRewardcap] = useState(0);
  const [justifyTab, setJustifyTab] = useState("1");

  const justifyToggle = (tab) => {
    if (justifyTab !== tab) setJustifyTab(tab);
  };

  useEffect(() => {
    fetchRows(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    const filtered = mainTable.filter((row) => {
      const term = searchTerm.toLowerCase();
      return (
        row.title?.toLowerCase().includes(term) ||
        row.amount?.toString().includes(term) ||
        new Date(row.created_at).toLocaleString().toLowerCase().includes(term)
      );
    });
    setFilteredRows(filtered);
  }, [searchTerm, mainTable]);

  const fetchRows = async (page, limit) => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const payload = {
        uid: obj.id,
        page,
        limit,
        csrf_token: obj.csrf_token,
      };

      Swal.fire({
        title: "Fetching Data...",
        text: "Please wait while we load your transactions.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.post("/p2ptrading", payload);
      Swal.close();

      if (response?.success && Array.isArray(response.orders)) {
        setRows(response.orders);
        setFilteredRows(response.orders);
        setTotalBalance(response.rewardbalance);
        setRewardcap(response.rewardcap);
        const total = response.totalRecords || response.orders.length;
        setTotalPages(Math.ceil(total / limit));
        setTotalRecords(total);
      } else {
        setRows([]);
        setFilteredRows([]);
      }
    } catch (error) {
      Swal.close();
      console.error("Error fetching orders:", error);
    }
  };

  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".invoiceCheckBox");
    ele.forEach((el) => {
      el.checked = checkall.checked;
    });
    deleteCheckbox();
  }, []);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const deleteCheckbox = () => {
    const checked = document.querySelectorAll(".invoiceCheckBox:checked");
    setIsMultiDeleteButton(checked.length > 0);
    setSelectedCheckBoxDelete(checked);
  };

  const columns = useMemo(() => [
    {
      header: (
        <input type="checkbox" id="checkBoxAll" className="form-check-input" onClick={checkedAll} />
      ),
      cell: (cell) => (
        <input
          type="checkbox"
          className="invoiceCheckBox form-check-input"
          value={cell.getValue()}
          onChange={deleteCheckbox}
        />
      ),
      id: "#",
      accessorKey: "_id",
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: "ID",
      accessorKey: "id",
      enableColumnFilter: false,
      cell: (cell) => (
        <Link to="#" className="fw-medium link-primary">{cell.getValue()}</Link>
      ),
    },
    {
      header: "TRADER",
      accessorKey: "trader",
      enableColumnFilter: false,
    },
    {
      header: "PRICE",
      accessorKey: "type",
      enableColumnFilter: false,
    },
    {
      header: "LIMITS",
      accessorKey: "trader",
      enableColumnFilter: false,
    },
    {
      header: "SUCCESS",
      accessorKey: "",
      enableColumnFilter: false,
    },
    {
      header: "ACTIONS",
      accessorKey: "",
      enableColumnFilter: false,
    },
  ], [checkedAll]);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="P2P Trading" pageTitle="Dashboard" url="/dashboard" />

        <Row className="mb-3 pb-1">
          <Col xs={12}>
            <div className="d-flex align-items-lg-center flex-lg-row flex-column">
              <div className="flex-grow-1">
                <h3 className="mb-1">P2P Trading</h3>
                <p className="text-muted mb-0">Buy and sell with trusted community members</p>
              </div>
              <div className="mt-3 mt-lg-0">
                <Row className="g-3 mb-0 align-items-center">
                  <div className="col-auto">
                    <button type="button" className="btn btn-soft-primary">
                      <i className="ri-add-circle-line align-middle me-1"></i> Payment Methods
                    </button>
                  </div>
                  <div className="col-auto">
                    <button type="button" className="btn btn-soft-primary">
                      <i className="ri-add-circle-line align-middle me-1"></i> Post Trade Offer
                    </button>
                  </div>
                </Row>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3 pb-1">
          <Col xxl={12}>
            <Card>
              <CardBody>
                <Nav tabs className="nav-tabs mb-3">
                  <NavItem>
                    <NavLink
                      style={{ cursor: "pointer" }}
                      className={classnames({ active: justifyTab === "1" })}
                      onClick={() => justifyToggle("1")}
                    >
                      Buy
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      style={{ cursor: "pointer" }}
                      className={classnames({ active: justifyTab === "2" })}
                      onClick={() => justifyToggle("2")}
                    >
                      Sell
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={justifyTab} className="text-muted">
                  <TabPane tabId="1">
                    <p>Buy USD from other users. These are sell offers from other traders.</p>
                    <Card>
                      <CardHeader>
                        <Row className="g-3">
                          <Col xxl={4} lg={6}>
                            <div className="search-box">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search by username or payment method..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <i className="ri-search-line search-icon"></i>
                            </div>
                          </Col>
                          <Col xxl={2} lg={6}>
                            <select className="form-control">
                              <option value="all">All Trades</option>
                              <option value="buy">Buy Orders</option>
                              <option value="sell">Sell Orders</option>
                            </select>
                          </Col>
                          <Col xxl={2} lg={6}>
                            <select className="form-control">
                              <option value="all">All Payment Methods</option>
                              <option value="banktransfer">Bank Transfer</option>
                              <option value="paypal">Paypal</option>
                              <option value="cc">Credit Card</option>
                              <option value="crypto">Crypto Wallet</option>
                            </select>
                          </Col>
                          <Col xxl={1} lg={4}>
                            <button className="btn btn-primary w-100">
                              <i className="ri-equalizer-line align-bottom me-1"></i> Filters
                            </button>
                          </Col>
                        </Row>
                      </CardHeader>

                      <CardBody className="pt-0">
                        <br></br>
                        <TableContainer
                            columns={columns}
                            data={filteredRows}
                            customPageSize={pageSize}
                            maxLength={totalPages}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            isExtraFeature={true}
                            isGlobalFilter={false}
                            isAddOptions={false}
                            className="custom-header-css"
                            theadClass="table-light"
                            divClass="table-responsive table-card mb-3"
                            tableClass="align-middle table-nowrap"
                          />
                      </CardBody>
                    </Card>
                  </TabPane>

                  <TabPane tabId="2">
                    <p>Sell USD to other users. These are buy offers from other traders.</p>
                    <Card>
                      <CardHeader>
                        <Row className="g-3">
                          <Col xxl={4} lg={6}>
                            <div className="search-box">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search by username or payment method..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <i className="ri-search-line search-icon"></i>
                            </div>
                          </Col>
                          <Col xxl={2} lg={6}>
                            <select className="form-control">
                              <option value="all">All Trades</option>
                              <option value="buy">Buy Orders</option>
                              <option value="sell">Sell Orders</option>
                            </select>
                          </Col>
                          <Col xxl={2} lg={6}>
                            <select className="form-control">
                              <option value="all">All Payment Methods</option>
                              <option value="banktransfer">Bank Transfer</option>
                              <option value="paypal">Paypal</option>
                              <option value="cc">Credit Card</option>
                              <option value="crypto">Crypto Wallet</option>
                            </select>
                          </Col>
                          <Col xxl={1} lg={4}>
                            <button className="btn btn-primary w-100">
                              <i className="ri-equalizer-line align-bottom me-1"></i> Filters
                            </button>
                          </Col>
                        </Row>
                      </CardHeader>

                      <CardBody className="pt-0">
                        <br></br>
                        <TableContainer
                            columns={columns}
                            data={filteredRows}
                            customPageSize={pageSize}
                            maxLength={totalPages}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            isExtraFeature={true}
                            isGlobalFilter={false}
                            isAddOptions={false}
                            className="custom-header-css"
                            theadClass="table-light"
                            divClass="table-responsive table-card mb-3"
                            tableClass="align-middle table-nowrap"
                          />
                      </CardBody>
                    </Card>                    
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default P2PTrading;
