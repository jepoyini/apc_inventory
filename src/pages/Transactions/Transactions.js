import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CardBody,
  Row,
  Col,
  Card,
  Container,
  CardHeader,
  Button,
  Input
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { APIClient } from "../../helpers/api_helper";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import CountUp from "react-countup";

const DonationOrderHistory = () => {
  document.title = "Expense Account | IBO Mastermind";
  const navigate = useNavigate();
  const api = new APIClient();

  const [mainTable, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSizeOption, setPageSizeOption] = useState(10); // for dropdown value
  const [totalRecords, setTotalRecords] = useState(0);  
  const [totalbalance, setTotalBalance] = useState(0);  
  const [totaldeposit, setTotalDeposit] = useState(0);  
  const [totalwithdrawal, setTotalWithdrawal] = useState(0);  

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
        page: page,
        limit: limit,
        csrf_token: obj.csrf_token
      };

        // Show SweetAlert loading modal
        Swal.fire({
        title: 'Fetching Data...',
        text: 'Please wait while we load your transactions.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
        });
debugger; 
      const response = await api.post("/transactions", payload);


        // Close the modal after loading
        Swal.close();          


      if (response && response.success && Array.isArray(response.orders)) {
        setRows(response.orders);
        setFilteredRows(response.orders); // apply filter immediately
        const total = response.totalRecords || response.orders.length;
        setTotalPages(Math.ceil(total / limit));
        setTotalBalance(response.totalbalance)
        setTotalDeposit(response.totaldeposit)
        setTotalWithdrawal(response.totalwithdrawal)
      } else {
        setRows([]);
        setFilteredRows([]);
      }
    } catch (error) {
    // Close the modal after loading
    Swal.close();        
      console.error("Error fetching donation orders:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    setPageSizeOption(value);
    if (value === "all") {
      setPageSize(totalRecords); // Replace totalRecords with your actual total count
    } else {
      setPageSize(Number(value));
    }
  };

  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".invoiceCheckBox");
    ele.forEach((ele) => {
      ele.checked = checkall.checked;
    });
    deleteCheckbox();
  }, []);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".invoiceCheckBox:checked");
    setIsMultiDeleteButton(ele.length > 0);
    setSelectedCheckBoxDelete(ele);
  };

  // Table Column
  const columns = useMemo(
    () => [
      {
        header: <input type="checkbox" id="checkBoxAll" className="form-check-input" onClick={() => checkedAll()} />,
        cell: (cell) => {
          return <input type="checkbox" className="invoiceCheckBox form-check-input" value={cell.getValue()} onChange={() => deleteCheckbox()} />;
        },
        id: '#',
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "ID",
        accessorKey: "id",
        enableColumnFilter: false,
        cell: (cell) => {
          return <Link to="#" className="fw-medium link-primary">{cell.getValue()}</Link>;
        },
      },
      {
        header: "DATE",
        accessorKey: "date_created",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },      
      {
        header: "TYPE",
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },  
      {
        header: "DESCRIPTION",
        accessorKey: "description",
        enableColumnFilter: false,
        cell: (cell) => {
          const row = cell.row.original;
          const fromValue = row.from_name ? row.from_name : "System";
          const description = row.type === 'coin_received'
          ? `Coin Received from ${fromValue}`
          : row.type === 'coin_transfer'
          ? `Coin Transfer to ${row.to_name}`
          : row.type === 'payment' && row.is_travel === 1 
          ? row.note             
          : row.type === 'itv-cog' && row.is_itv === 1 
          ? row.note          
          : row.type === 'itv-admin-commission' && row.is_itv === 1 
          ? row.note          
          : row.type === 'commission' && row.is_itv === 1 
          ? row.note          
          : row.type === 'itv-tellfriend' && row.is_itv === 1 
          ? row.note          
          : row.type === 'payment' && row.is_itv === 1 
          ? row.note    
          : row.type === 'payment' 
          ? `Payment for  ${row.plan}` 
          : row.type === 'commission'
          ? `From: ${row.from_name} | ${row.plan}`
          : row.type === 'deposit'
          ? `Deposit ID: ${row.ref_id}`
          : row.type === 'withdrawal'
          ? `Withdrawal ID: ${row.ref_id}` 
          : row.type === 'adminadjustment'
          ? row.note
          : row.type === 'pool'
          ? `From : ${fromValue} - ${row.plan}`
          : row.type === 'adjustment'
          ? row.note
          : row.description;
          return (
            <div className="d-flex align-items-center desc-width">
              {description}
            </div>
          );
        },
      },    
      {
        header: "STATUS",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => {
          const status = cell.getValue();
          const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
  
          let statusClass;
          switch(status) {
            case 'completed':
              statusClass = 'badge bg-success';
              break;
            case 'onhold':
              statusClass = 'badge bg-primary';
              break;
            case 'pending':
              statusClass = 'badge bg-warning';
              break;
            case 'failed':
              statusClass = 'badge bg-danger';
              break;
            case 'info':
              statusClass = 'badge bg-info';
              break;
            case 'light':
              statusClass = 'badge bg-light';
              break;
            case 'dark':
              statusClass = 'badge bg-dark';
              break;
            default:
              statusClass = 'badge bg-secondary';
              break;
          }
          return (
            <span className={statusClass}>
              {formattedStatus}
            </span>
          );
        },
      }  ,       
      {
        header: () => (
          <span style={{ textAlign: 'right', display: 'block' }}>DEBIT</span>
        ),
        accessorKey: "amount",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return (
            <span style={{ color: 'red', textAlign: 'right', display: 'block' }}>
              {value < 0 ? value : ""}
            </span>
          );
        },
      },
      {
        
        header: () => (
          <span style={{ textAlign: 'right', display: 'block' }}>CREDIT</span>
        ),
        accessorKey: "amount",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return (
            <span style={{ textAlign: 'right', display: 'block' }}>
               {value >= 0 ? value : ""}
            </span>
          );
        },
      },
      {
        
        header: () => (
          <span style={{ textAlign: 'right', display: 'block' }}>RUNNING BALANCE</span>
        ),
        accessorKey: "running_total",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return (
            <span style={{ textAlign: 'right', display: 'block' }}>
              {value >= 0  ? value : ""}
            </span>
          );
        },
      }                        

   
    ]
  );

  const handleNewDonation = () => {
    navigate("/sharingdonations/university");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Expense Account Transactions" pageTitle="Dashboard" url="/dashboard" />


        <Row>
          <Col xl={4} md={6} >
              <Card className="card-animate">
                  <CardBody>
                      <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                              <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Expense Account</p>
                          </div>
                          <div className="flex-shrink-0">
                              <h5 className="fs-14 mb-0 text-muted" >
                              </h5>
                          </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                              <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                  <CountUp
                                      start="0"
                                      prefix=""
                                      suffix=""
                                      separator=""
                                      end={totalbalance}
                                      decimals="2"
                                      duration="4"
                                  />
                              </span></h4>
                            {/* <Link to="/orderhistory" className="text-decoration-underline text-muted">View Donations</Link> */}
                          </div>

<div className="d-flex flex-column flex-md-row gap-2 w-50">
{/* <Button
  type="button"
  className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-130 btn btn-secondary"
  onClick={() => navigate("/transfer")}
>
  <i className="ri-exchange-line align-middle me-1"></i> Transfer
</Button> */}
  {/* <Button
    type="button"
    className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-130 btn btn-secondary"
    onClick={() => navigate("/deposit")}
  >
    <i className="ri-add-circle-line align-middle me-1"></i> Donate
  </Button> */}
</div>

                      </div>
                  </CardBody>
              </Card>
          </Col> 

          {/* <Col xl={4} md={6} >
              <Card className="card-animate">
                  <CardBody>
                      <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                              <p className="text-uppercase fw-medium text-muted text-truncate mb-0">E-wallet Total Deposits</p>
                          </div>
                          <div className="flex-shrink-0">
                              <h5 className="fs-14 mb-0 text-muted" >
                              </h5>
                          </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                              <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                  <CountUp
                                      start="0"
                                      prefix=""
                                      suffix=""
                                      separator=""
                                      end={totaldeposit}
                                      decimals="2"
                                      duration="4"
                                  />
                              </span></h4>
                                 <Link to="/deposithistory" className="text-decoration-underline text-muted">View Deposit History</Link>
                          </div>
                          <div className="">

                              <Button
                                type="button"
                                className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                                onClick={() => navigate("/deposit")}
                              >
                                <i className="ri-add-circle-line align-middle me-1"></i> New Deposit
                              </Button>

                          </div>
                      </div>
                  </CardBody>
              </Card>
          </Col>    

          <Col xl={4} md={6} >
              <Card className="card-animate">
                  <CardBody>
                      <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                              <p className="text-uppercase fw-medium text-muted text-truncate mb-0">E-wallet Pending Withdrawal</p>
                          </div>
                          <div className="flex-shrink-0">
                              <h5 className="fs-14 mb-0 text-muted" >
                              </h5>
                          </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                              <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="">
                                  <CountUp
                                      start="0"
                                      prefix=""
                                      suffix=""
                                      separator=""
                                      end={totalwithdrawal}
                                      decimals="2"
                                      duration="4"
                                  />
                              </span></h4>
                              <Link to="/withdrawhistory" className="text-decoration-underline text-muted">View Withdrawal History</Link>
                          </div>
                          <div className="">

                              <Button
                                type="button"
                                className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                                onClick={() => navigate("/withdraw")}
                              >
                                <i className="ri-add-circle-line align-middle me-1"></i> New Withdrawal
                              </Button>

                          </div>
                      </div>
                  </CardBody>
              </Card>
          </Col>    */}

        </Row>

        <Row>
          <Col lg={12}>
            <Card id="TransactionsList">
              <CardHeader className="">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Expense Account Transaction History</h5>
                  <div className="flex-shrink-0">
                    <div className='d-flex gap-2 flex-wrap'>
                      {isMultiDeleteButton && <button className="btn btn-danger"
                        onClick={() => setDeleteModalMulti(true)}
                      ><i className="ri-delete-bin-2-line"></i></button>}
                    </div>
                  </div>
                  {/* <Button type="button" className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250" onClick={handleNewDonation}>
                      <i className="ri-add-circle-line align-middle me-1"></i> New Purchase
                    </Button>                   */}
                </div>
              </CardHeader>              
              <CardHeader className="border-0">
                <Row className="g-4 align-items-center mb-15">
                    <Col md={4}>
                    <Input
                      type="search"
                      className="form-control"
                      placeholder="Search by title, amount, date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                        <select
                          className="form-select"
                          value={pageSizeOption}
                          onChange={handlePageSizeChange}
                        >
                          {[10, 20, 30, 50].map((size) => (
                            <option key={size} value={size}>{size} rows</option>
                          ))}
                          <option value="all">All Rows</option>
                        </select>
                  </Col>
                  <Col md={6} className="text-end">
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="pt-0">
                <TableContainer
                  columns={columns}
                  data={filteredRows}
                  customPageSize={pageSize}
                  maxLength={totalPages}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageClick={handlePageChange}
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
          </Col>
        </Row>
      </Container>
      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default DonationOrderHistory;
