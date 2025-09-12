import React, { useState, useEffect, useMemo, useCallback  } from "react";
import {
  CardBody,
  Row,
  Col,
  Card,
  Container,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import * as moment from "moment";
import Swal from "sweetalert2";
import axios from 'axios';
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import Loader from "../../Components/Common/Loader";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSelector } from "reselect";
import { useSelector, useDispatch } from "react-redux";
import CountUp from "react-countup";
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { APIClient } from "../../helpers/api_helper";

const DepositList = () => {
        const api = new APIClient();
  document.title = "Withdraw History | IBOPRO";
  const navigate = useNavigate();
  const [Userbalance, setUserBalance] = useState({
    total_earnings: 0,
    onhold_earnings: 0,
    purchased_plans: 0,
    coded_downlines: 0,
    wallet_balance: 0,
    total_withdrawed: 0,
    total_downlines: 0,
    pending_withdrawal: 0
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cancelId = queryParams.get('cancel');
  const [totalRecords, setTotalRecords] = useState(0);  
  const [totalbalance, setTotalBalance] = useState(0);  
  const [totaldeposit, setTotalDeposit] = useState(0);  
  const [totalwithdrawal, setTotalWithdrawal] = useState(0);  
  const [pendingwithdrawal, setPendingwithdrawal] = useState(0);  

  useEffect(() => {
    const cancelDeposit = async (id) => {
      try {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;        
        const response = await api.post('/canceldeposit', { uid:uid, id: id });
      } catch (error) {
      }
    };
  
    if (cancelId) {
      cancelDeposit(cancelId);
    }
  }, [cancelId]);
  
// Inside the DepositList component
const handleNewDeposit = () => {
  const fetchData = async () => {
    try {
      navigate('/deposit');

      // if (sessionStorage.getItem("authUser")) {
      //   const obj = JSON.parse(sessionStorage.getItem("authUser"));
      //   const uid = obj.id;
      //   const url = '/checkdeposits.php';
      //   const data = { uid: uid };
      //   const response = await axios.post(url, data);
      //   if (response.pendings === 0) {
      //     navigate('/newdeposit2');
      //   } else {
      //     Swal.fire({
      //       icon: 'warning', // Exclamation icon
      //       title: 'Pending Deposit',
      //       text: 'You have a pending deposit. You cannot create a new deposit until your pending deposit is completed.',
      //       confirmButtonText: 'OK'
      //     });
      //   }
      // }
    } catch (error) {
     }
  }
  fetchData();

  
};
    const fetchData = async () => {
      debugger; 
      try {
          if (sessionStorage.getItem("authUser")) {

            const obj = JSON.parse(sessionStorage.getItem("authUser"));
            const uid = obj.id;
            const url = '/checkbalance';
            const data = { uid: uid };
            const response = await api.post(url, data);
            if (response.status === "success") {
              setUserBalance({
                total_earnings: response.total_earnings,
                onhold_earnings: response.onhold_earnings,
                purchased_plans: response.purchased_plans,
                coded_downlines: response.coded_downlines,
                wallet_balance: response.wallet_balance,
                total_withdrawed: response.total_withdrawed,
                total_downlines: response.total_downlines,
                pending_withdrawal: response.pending_withdrawal,
                withdrawable_balance: response.withdrawable_balance
            });
            } else if (response.message && response.message.includes("Failed Validation")) {
                navigate('/logout');
            }
          }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonText: 'OK'
        });
      }
    }
  useEffect(() => {

    fetchData();
  }, []);

  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default page size

  useEffect(() => {
    fetchRows(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchRows = async (page, limit) => {
    try {
      if (sessionStorage.getItem("authUser")) {

        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const url = '/getwithdrawals';
        const data = {
          uid: uid,
          limit: limit,
          page: page,
        };

        const response = await api.post(url, data,{showLoader:true});
          if (response.rows) {
            setRows(response.rows);
            setTotalPages(response.totalPages);
          }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

  const handleAction = async (action, id) => {

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj.id;

    if (action=="cancelled")
    {

        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
          title: 'Do you want to cancel?',
          html: "If a confirmed transfer has already been made, please do not cancel the deposit. Instead, email us at <a href='mailto:support@ibopro.com'>support@ibopro.com</a> with your transaction ID, and we will process your deposit as soon as the coins are received. If no transfer has been made, you may proceed to cancel the deposit.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, cancel it!',
          cancelButtonText: 'No, keep it'
        });

        if (result.isConfirmed) {
            try {
              const url = "/updatedepositstatus2";
              const data = { uid:uid, id: id, status: action };
              const response = await api.post(url, data);
              if (response.success) {
                    Swal.fire({
                    icon: 'success',
                    title: 'Done',
                    text: `Deposit status changed successfully`,
                    confirmButtonText: 'OK'
                    });
                    fetchRows(currentPage, pageSize); // refresh the table
              } else {
                toast.error("Error updating deposit status");
              }
            } catch (error) {
              toast.error("Error updating deposit status");
            }
        }
 
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // reset to first page whenever page size changes
  };

  const dispatch = useDispatch();


  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);


  const handleValidDate = date => {
    return moment(new Date(date)).format("DD MMM Y");
  };

  const handleValidTime = (time) => {
    const time1 = new Date(time);
    const getHour = time1.getUTCHours();
    const getMin = time1.getUTCMinutes();
    const getTime = `${getHour}:${getMin}`;
    const meridiem = getHour >= 12 ? "PM" : "AM";
    return moment(getTime, 'hh:mm').format('hh:mm') + " " + meridiem;
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
  const formatTextWithLineBreaks = (text) => {
    // Default to an empty string if text is null
    const safeText = text || '';
    return safeText.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

const handleEdit = async (id) => {
  const { value: formValues } = await Swal.fire({
    title: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <span>Update Deposit Hash</span>
      </div>
    `,
    html: `
      <div style="text-align: left;">
        <label for="swal-input1">Transaction Hash</label>
        <input id="swal-input1" class="swal2-input" style="width: 80%;" placeholder="Enter transaction hash">

        <label for="swal-input2" style="margin-top: 10px;">Sender Address</label>
        <input id="swal-input2" class="swal2-input" style="width: 80%;" placeholder="Enter sender address">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    customClass: {
      popup: 'swal-wide'
    },
    preConfirm: () => {
      const hash = document.getElementById('swal-input1').value.trim();
      const sender = document.getElementById('swal-input2').value.trim();
      if (!hash || !sender) {
        Swal.showValidationMessage('Both fields are required');
        return false;
      }
      return { hash, sender };
    }
  });

  if (formValues) {
    try {
        debugger; 
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id; 
      const response = await api.post('/updatedeposithash', {
        id: id,
        uid: uid, 
        hash: formValues.hash,
        sender: formValues.sender
      },{showLoader:true});

      if (response.status === 'success') {
        fetchRows(currentPage, pageSize);
        Swal.fire('Updated!', 'Deposit details updated successfully.', 'success');
      } else {
        Swal.fire('Error', response.message || 'Something went wrong.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Server error occurred.', 'error');
    }
  }
};


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
        header: "AMOUNT",
        accessorKey: "amount",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },
      {
        header: "Currency",
        accessorKey: "coin_type",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return (
            <>
              {value === 'usdt' ? 'USDT' : value}
            </>
          );
        },
      },
      {
        header: "STATUS",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => {
          const status = cell.getValue();
          const row = cell.row.original; // get full row data
          const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

          let statusClass;
          switch (status) {
            case 'success':
              statusClass = 'badge bg-success';
              break;
            case 'onhold':
              statusClass = 'badge bg-primary';
              break;
            case 'cancelled':
              statusClass = 'badge bg-info';
              break;
            case 'pending':
              statusClass = 'badge bg-primary';
              break;
            default:
              statusClass = 'badge bg-secondary';
              break;
          }

          const handleCancel = async () => {
            const confirm = await Swal.fire({
              title: 'Are you sure?',
              text: "Do you really want to cancel this withdraw request?",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, cancel it',
              cancelButtonText: 'No, keep it',
            });

            if (confirm.isConfirmed) {
              try {
                const user = JSON.parse(sessionStorage.getItem("authUser"));
                const response = await api.post('/cancelwithdraw', {
                  uid: user.id,
                  id: row.id,
                }, { showLoader: true });

                if (response.status=='success') {

                  Swal.fire('Cancelled!', 'The withdraw has been cancelled.', 'success');
                  fetchData();
                  fetchRows(currentPage, pageSize);
                  // optionally refresh the data here
                } else {
                  Swal.fire('Failed', response.message || 'Unable to cancel.', 'error');
                }
              } catch (error) {
                console.error("Cancel error:", error);
                Swal.fire('Error', 'Something went wrong.', 'error');
              }
            }
          };

          return (
            <div className="d-flex align-items-center gap-2">
              <span className={statusClass}>{formattedStatus}</span>
              {status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-link p-0 "
                  style={{ fontSize: '0.875rem' }}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          );
        },
      },

      {
        header: () => (
          <span style={{ textAlign: 'left', display: 'block' }}>SHARING FINANCIAL EMAIL</span>
        ),
        accessorKey: "receiverWalletAddress",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return (
            <span style={{ textAlign: 'left', display: 'block' }}>{value}</span>
          );
        },
      },  

      {
        header: () => (
          <span style={{ textAlign: 'left', display: 'block' }}>TRANSACTION HASH</span>
        ),
        accessorKey: "transactionID",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          const row = cell.row.original; // Access the full row data to get coin_type
          const coinType = row.coin_type;
      
          // Set the link URL based on coinType
          const link =
          coinType === 'flr'
          ? `https://flare-explorer.flare.network/tx/${value}`
          : coinType === 'pol'
          ? `https://polygonscan.com/tx/${value}`
          : coinType === 'usdt'
          ? `https://polygonscan.com/tx/${value}` 
          : coinType === 'usdt-bep20'
          ? `https://bscscan.com/tx/${value}`           
          : '#'; 
          return (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="link-primary"
              style={{ textAlign: 'left', display: 'block' }}
            >
              {value}
            </a>
          );
        },
      },      
    

      {
        header: () => (
          <span style={{ textAlign: 'left', display: 'block' }}>NOTES</span>
        ),
        accessorKey: "notes",
        enableColumnFilter: false,
        cell: (cell) => {
          const value = cell.getValue();
          return (
            <span
              style={{
                textAlign: 'left',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 10,
                overflow: 'hidden',
              }}
            >
              {formatTextWithLineBreaks(value)}
            </span>
          );
        },
      }
    ],
    [checkedAll]
  );


  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="E-wallet Withdraw History" pageTitle="Transactions" />


        <Row>
            <Col xl={4} md={6} >
              <Card className="card-animate">
                  <CardBody>
                      <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                              <p className="text-uppercase fw-medium text-muted text-truncate mb-0">E-wallet Total Withdrawable</p>
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
                                      end={Userbalance.withdrawable_balance}
                                      decimals="2"
                                      duration="4"
                                  />
                              </span></h4>
                             
                          </div>
                          <div className="">

                              {/* <Button
                                type="button"
                                className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                                onClick={() => navigate("/withdraw")}
                              >
                                <i className="ri-add-circle-line align-middle me-1"></i> Withdrawal Request
                              </Button> */}
                              <Button
                                  type="button"
                                  className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                                  // onClick={() => window.open("https://sharing.financial", "_blank")}
                                  onClick={() => navigate('/transfer')}
                                >
                                  P2P Community
                                </Button>

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
                              <p className="text-uppercase fw-medium text-muted text-truncate mb-0">E-wallet Total Withdrawn</p>
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
                                      end={Userbalance.total_withdrawed}
                                      decimals="2"
                                      duration="4"
                                  />
                              </span></h4>
                             
                          </div>
                          <div className="">

 

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
                                      end={Userbalance.pending_withdrawal}
                                      decimals="2"
                                      duration="4"
                                  />
                              </span></h4>
                              
                          </div>
                          <div className="">

                          

                          </div>
                      </div>
                  </CardBody>
              </Card>
            </Col>     */}

        </Row>



        <Row>
          <Col lg={12}>
            <Card id="customerList">
              <CardHeader className="border-0">
                <Row className="g-4">
                  <Col sm={6}>   <h5 className="table-caption card-title mb-0 flex-grow-1">E-wallet Withdraw History</h5></Col> 
                  <Col sm={6}>
                    <div className="col-auto text-end">
                  
                   
                    </div>
                  </Col>
                 
                </Row>
              </CardHeader>
              <CardBody className="pt-0">
                <TableContainer
                  columns={columns}
                  data={mainTable}
                  customPageSize={pageSize}
                  maxLength={totalPages}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageClick={handlePageChange}
                  isExtraFeature={true}
                  isGlobalFilter={true}
                  isAddOptions={false}
                  className="custom-header-css"
                  theadClass="table-light "
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

export default DepositList;
