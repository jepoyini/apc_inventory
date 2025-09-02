import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CardBody, Row, Col, Card, Container, CardHeader, Nav, NavItem,
  NavLink, TabContent, TabPane, Button, Input, Label
} from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { APIClient } from "../../helpers/api_helper";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import { P2PApi } from "../../helpers/p2p_api";
import PaymentMethodsModal from "./PaymentMethodsModal";
import PostOfferModal from "./PostOfferModal";
import MyOffersModal from "./MyOffersModal";
import OrderModal from "./OrderModal";
import MyOrdersModal from "./MyOrdersModal";

const P2PTrading = () => {
  document.title = "P2PTrading | IBO Mastermind";
  const api = new APIClient();

  const [offers, setOffers] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [assets, setAssets] = useState([]);
  const [fiats, setFiats] = useState([]);
  const [assetFilter, setAssetFilter] = useState("");
  const [fiatFilter, setFiatFilter] = useState("");

  const [justifyTab, setJustifyTab] = useState("1"); // 1=Buy tab (shows SELL offers), 2=Sell tab (shows BUY offers)
  const justifyToggle = (tab) => { if (justifyTab !== tab) setJustifyTab(tab); };

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [postOfferOpen, setPostOfferOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [myOrdersOpen, setMyOrdersOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offersOpen, setOffersOpen] = useState(false);

  // Columns for offers table
  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".invoiceCheckBox");
    ele.forEach((el) => { el.checked = checkall.checked; });
  }, []);

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
          onChange={() => {}}
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
      accessorKey: "username",
      enableColumnFilter: false,
    },
    {
      header: "PRICE",
      accessorKey: "price",
      enableColumnFilter: false,
      cell: (cell) => {
        const row = cell.row.original;
        const price = row.price ? parseFloat(row.price).toFixed(2) : "0.00";
        return `${price} ${row.fiat} / ${row.asset}`;
      }
    },
    {
      header: "LIMITS",
      accessorKey: "min_amount_asset",
      enableColumnFilter: false,
      cell: (cell) => {
        const row = cell.row.original;
        const min = row.min_amount_asset ? parseFloat(row.min_amount_asset).toFixed(2) : "0.00";
        const max = row.max_amount_asset ? parseFloat(row.max_amount_asset).toFixed(2) : "0.00";
        return `${min} – ${max} ${row.asset}`;
      }
    },
{
  header: "SUCCESS",
  accessorKey: "success_count",
  enableColumnFilter: false,
  cell: (cell) => {
    const row = cell.row.original;

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const success = toNum(row.success_count);
    const cancel  = toNum(row.cancel_count);
    const total   = success + cancel;

    // show only the count when success is 0 or total is 0
    if (success <= 0 || total <= 0) return `${success}`;

    const pct = Math.round((success / total) * 100);
    return `${success} (${pct}%)`;
  }
},


    {
      header: "ACTIONS",
      accessorKey: "actions",
      enableColumnFilter: false,
      cell: (cell) => {
        const row = cell.row.original;
        return (
          <div className="d-flex gap-2">
            <Button size="sm" color="primary" onClick={() => openOrder(row)}>
              {row.side === "SELL" ? "Buy" : "Sell"}
            </Button>
          </div>
        );
      }
    },
  ], [checkedAll]);


  const sideForTab = justifyTab === "1" ? "SELL" : "BUY";

  const loadCatalogs = async () => {
    try {
      const [a, f] = await Promise.all([P2PApi.listAssets(), P2PApi.listFiats()]);
      setAssets(a.assets || []);
      setFiats(f.fiats || []);
    } catch (e) {
      toast.error(e.message || "Failed to load catalogs");
    }
  };

  const loadOffers = async () => {
    try {
      Swal.fire({ title: "Loading Offers", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await P2PApi.listOffers({
        side: sideForTab,
        asset_id: assetFilter || undefined,
        fiat_id: fiatFilter || undefined
      });
      Swal.close();
      setOffers(res.offers || []);
    } catch (e) {
      Swal.close();
      toast.error(e.message || "Failed to load offers");
    }
  };

  useEffect(() => { loadCatalogs(); }, []);
  useEffect(() => { loadOffers(); }, [justifyTab, assetFilter, fiatFilter]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = (offers || []).filter((row) => {
      return (
        row.username?.toLowerCase().includes(term) ||
        row.asset?.toLowerCase().includes(term) ||
        row.fiat?.toLowerCase().includes(term)
      );
    });
    setFilteredRows(filtered);
  }, [searchTerm, offers]);

  const openOrder = async (row) => {
    try {
      const res = await P2PApi.getOffer(row.id);
      const off = res.offer;
      setSelectedOffer({
        ...row,
        payment_methods: off.payment_methods?.map(pm => ({
          payment_method_id: pm.id,
          code: pm.code,
          label: pm.label
        })) || []
      });
      setOrderModalOpen(true);
    } catch (e) {
      toast.error(e.message || "Failed to open offer");
    }
  };

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
                    <button type="button" className="btn btn-soft-primary" onClick={() => setPayModalOpen(true)}>
                      <i className="ri-add-circle-line align-middle me-1"></i> Payment Methods
                    </button>
                  </div>
                  <div className="col-auto">
                    <button type="button" className="btn btn-soft-primary" onClick={() => setPostOfferOpen(true)}>
                      <i className="ri-add-circle-line align-middle me-1"></i> Post Trade Offer
                    </button>
                  </div>
                  <div className="col-auto">
                    <button type="button" className="btn btn-soft-primary" onClick={() => setOffersOpen(true)}>
                      <i className="ri-add-circle-line align-middle me-1"></i> My Offers
                    </button>
                  </div>
                  <div className="col-auto">
                    <button type="button" className="btn btn-soft-primary" onClick={() => setMyOrdersOpen(true)}>
                      <i className="ri-chat-1-line align-middle me-1"></i> My Orders & Chat
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
                    <p>Buy from other users. These are sell offers from traders.</p>
                    <Card>

                    <CardHeader>
                    <Row className="g-2">
                        <Col xxl={4} lg={6} className="d-flex align-items-stretch">
                        <div className="search-box w-100">
                            <Input
                            type="text"
                            className="form-control"
                            placeholder="Search by user, asset, fiat..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <i className="ri-search-line search-icon"></i>
                        </div>
                        </Col>
                        <Col xxl={2} lg={3} className="d-flex align-items-stretch hide">
                        <Input
                            type="select"
                            className="form-select"
                            value={assetFilter}
                            onChange={(e) => setAssetFilter(e.target.value)}
                        >
                            <option value="">All Assets</option>
                            {assets.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.code}
                            </option>
                            ))}
                        </Input>
                        </Col>
                        <Col xxl={2} lg={3} className="d-flex align-items-stretch">
                        <Input
                            type="select"
                            className="form-select"
                            value={fiatFilter}
                            onChange={(e) => setFiatFilter(e.target.value)}
                        >
                            <option value="">All Fiat</option>
                            {fiats.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.code}
                            </option>
                            ))}
                        </Input>
                        </Col>
                    </Row>
                    </CardHeader>


                      <CardBody className="pt-0">
                        <br />
                        <TableContainer
                          columns={columns}
                          data={filteredRows}
                          customPageSize={10}
                          maxLength={1}
                          currentPage={1}
                          totalPages={1}
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
                    <p>Sell to other users. These are buy offers from traders.</p>
                    <Card>

                        <CardHeader>
                        <Row className="g-2">
                            {/* Search */}
                            <Col xxl={4} lg={6} className="d-flex align-items-stretch">
                            <div className="search-box w-100">
                                <Input
                                type="text"
                                className="form-control h-100"
                                placeholder="Search by user, asset, fiat..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <i className="ri-search-line search-icon"></i>
                            </div>
                            </Col>

                            {/* Asset */}
                            <Col xxl={2} lg={3} className="d-flex align-items-stretch">
                            <Input
                                type="select"
                                className="form-select h-100"
                                aria-label="Asset"
                                value={assetFilter}
                                onChange={(e) => setAssetFilter(e.target.value)}
                            >
                                <option value="">All</option>
                                {assets.map((a) => (
                                <option key={a.id} value={a.id}>{a.code}</option>
                                ))}
                            </Input>
                            </Col>

                            {/* Fiat */}
                            <Col xxl={2} lg={3} className="d-flex align-items-stretch">
                            <Input
                                type="select"
                                className="form-select h-100"
                                aria-label="Fiat"
                                value={fiatFilter}
                                onChange={(e) => setFiatFilter(e.target.value)}
                            >
                                <option value="">All</option>
                                {fiats.map((f) => (
                                <option key={f.id} value={f.id}>{f.code}</option>
                                ))}
                            </Input>
                            </Col>
                        </Row>
                        </CardHeader>


                      <CardBody className="pt-0">
                        <br />
                        <TableContainer
                          columns={columns}
                          data={filteredRows}
                          customPageSize={10}
                          maxLength={1}
                          currentPage={1}
                          totalPages={1}
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

      {/* Modals */}
      <PaymentMethodsModal isOpen={payModalOpen} toggle={() => setPayModalOpen(!payModalOpen)} />
      <PostOfferModal isOpen={postOfferOpen} toggle={() => setPostOfferOpen(!postOfferOpen)} onPosted={loadOffers} />
      <MyOffersModal isOpen={offersOpen} toggle={() => setOffersOpen(false)} />
      <MyOrdersModal isOpen={myOrdersOpen} toggle={() => setMyOrdersOpen(!myOrdersOpen)} />
      <OrderModal
        isOpen={orderModalOpen}
        toggle={() => setOrderModalOpen(!orderModalOpen)}
        offer={selectedOffer}
        onUpdated={loadOffers}
      />

      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default P2PTrading;
