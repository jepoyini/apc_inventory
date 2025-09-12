import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
import * as moment from "moment";
import CountUp from "react-countup";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainerReactTable";
import DeleteModal from "../../Components/Common/DeleteModal";
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';

//Import Icons
import FeatherIcon from "feather-icons-react";

import DownlineWidgets from "./DownlineWidgets";

import { APIClient } from "../../helpers/api_helper";
//redux
import { useSelector, useDispatch } from "react-redux";

import Loader from "../../Components/Common/Loader";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createSelector } from "reselect";

const pageSize = 5; // Number of items per page


const InvoiceList = () => {
   const api = new APIClient();
  document.title = "Referrals  | APC Inventory";
  const navigate = useNavigate();
  const { id } = useParams();

  const [Userbalance, setUserBalance] = useState({
    total_earnings : 0,
    onhold_earnings : 0,
    purchased_plans : 0,
    coded_downlines : 0,
    wallet_balance  : 0,
    total_withdrawed  : 0,
    total_downlines  : 0
    });
    
    useEffect(() => {

      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      setSponsor(obj.firstname+' '+obj.lastname+' #'+obj.id);

        const fetchData = async () => {
            try {
                if (sessionStorage.getItem("authUser")) {
                    const obj = JSON.parse(sessionStorage.getItem("authUser"));
                    let uid = obj.id;
                    if (id !== undefined) 
                    {
                      uid = id;
                    }

                    const data = {
                        main_uid: obj.id,
                        uid:uid,
                        csrf_token: obj.csrf_token
                    };
                    debugger; 
                    const response = await api.post('/checkbalance',data);
                    if (response.status=="success") 
                    {
                        // $total_withdrawed  = 0; 
                        // $total_downlines  = 0; 
                    
                        console.log(response.data); 
                        setUserBalance({
                            total_earnings : response.data.total_earnings,
                            onhold_earnings : response.data.onhold_earnings,
                            purchased_plans : response.data.purchased_plans,
                            coded_downlines : response.data.coded_downlines,
                            wallet_balance  : response.data.wallet_balance,
                            total_withdrawed  : response.data.total_withdrawed,
                            total_downlines  : response.data.total_downlines
                        });    
                        setSponsor(response.data.fullname);
                        return true; 
                    } else if (response.message && response.message.includes("Failed Validation")) {
                        navigate('/logout');                        
                    } else {
                        console.log(response.message);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response.message,
                            confirmButtonText: 'OK'
                        });
                        return false; 
                    }
                }
            } catch (error) {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error,
                    confirmButtonText: 'OK'
                });
            }
        }
        //fetchData();
    
      }, []);

  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sponsor, setSponsor] = useState();

  useEffect(() => {

    fetchRows(currentPage);
  } , [currentPage]);
  
  const fetchRows = async (page) => {

    try {

        if (sessionStorage.getItem("authUser")) {
          
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          let uid = obj.id;
          let uid2 = id;
          const url = '/downlines';

          if (uid2 == undefined) 
          {
            uid2 = uid; 
          }

          const data = {
            uid:uid,
            id:uid,
            id2: uid2,
            limit:1000000
          };

          // Show SweetAlert loading modal
          Swal.fire({
            title: 'Fetching Data...',
            text: 'Please wait while we load the downlines.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const response = await api.post(url,data);
          if (response.rows) {
            setRows(response.rows);
            setTotalPages(response.totalPages);
          }

          // Close the modal after loading
          Swal.close();          

      }

    } catch (error) {
        console.error('Error fetching rows:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const dispatch = useDispatch();


  //delete invoice
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [invoice, setInvoice] = useState(null);



  // Delete Data
  const onClickDelete = (invoice) => {
    setInvoice(invoice);
    setDeleteModal(true);
  };

  const handleDeleteInvoice = () => {
    if (invoice) {
      dispatch(onDeleteInvoice(invoice._id));
      setDeleteModal(false);
    }
  };

  const handleValidDate = date => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };

  const handleValidTime = (time) => {
    const time1 = new Date(time);
    const getHour = time1.getUTCHours();
    const getMin = time1.getUTCMinutes();
    const getTime = `${getHour}:${getMin}`;
    var meridiem = "";
    if (getHour >= 12) {
      meridiem = "PM";
    } else {
      meridiem = "AM";
    }
    const updateTime = moment(getTime, 'hh:mm').format('hh:mm') + " " + meridiem;
    return updateTime;
  };


  // Checked All
  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".invoiceCheckBox");

    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const deleteMultiple = () => {
    const checkall = document.getElementById("checkBoxAll");
    selectedCheckBoxDelete.forEach((element) => {
      dispatch(onDeleteInvoice(element.value));
      setTimeout(() => { toast.clearWaitingQueue(); }, 3000);
    });
    setIsMultiDeleteButton(false);
    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".invoiceCheckBox:checked");
    ele.length > 0 ? setIsMultiDeleteButton(true) : setIsMultiDeleteButton(false);
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
        enableColumnFilter: false
      },
      {
        header: "Date Registered",
        accessorKey: "date_created",
        enableColumnFilter: false,
        cell: (cell) => (
          <div style={{ width: '150px' }}>
            {cell.getValue()}
          </div>
        ),
        header: () => (
          <div style={{ width: '150px' }}>
            Date Registered
          </div>
        ),
      },      
      {
        header: "Full Name",
        accessorKey: "fullname",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            <div className="d-flex align-items-center" >
              {cell.getValue()}
            </div>
          </>
        ),
      },
      {
        header: "Username",
        accessorKey: "username",
        enableColumnFilter: false,
        cell: (cell) => (
          <div className="d-flex align-items-center" >
              {cell.getValue()}
          </div>
        ),
      },      
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
        cell: (cell) => (
          <div className="d-flex align-items-center">
            <a href={`mailto:${cell.getValue()}`} className='link-primary'>
              {cell.getValue()}
            </a>
          </div>
        ),
      },
      {
        header: "Phone",
        accessorKey: "phone",
        enableColumnFilter: false,
        cell: (cell) => (
          <div className="d-flex align-items-center">
            <a href={`tel:${cell.getValue()}`}>
              {cell.getValue()}
            </a>
          </div>
        ),
      },
      {
        header: "Sponsor",
        accessorKey: "sponsor",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            <div className="d-flex align-items-center" >
              {cell.getValue()}
            </div>
          </>
        ),
      },      

      // {
      //   header: "Level",
      //   accessorKey: "level",
      //   enableColumnFilter: false,
      // },      
      {
        header: "Downline count",
        accessorKey: "id",
        enableColumnFilter: false,
        cell: (cell) => {
          // Destructure cell.row.original to access the row data
          const { id, downline_count } = cell.row.original;
  
          return (
            <div className="d-flex align-items-center">
              {downline_count}
              {/* <a href={`/dashboard/referrals/${id}`} title="View Downlines">
                <i className="fas fa-sitemap"></i> ({downline_count})
              </a> */}
            </div>
          );
        }
      }  
      
    ]
  );

  return (
    <React.Fragment>
      <div className="page-content">

        <Container fluid>
          <BreadCrumb title="Direct Referrals" pageTitle="Dashboard" url="/dashboard" />
          {/* <Row>
              <DownlineWidgets  Userbalance={Userbalance} />
          </Row> */}

          <Row>
            <Col lg={12}>
              <Card id="invoiceList">
                <CardHeader className="border-0">
                  <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Direct Referrals of {sponsor}</h5>
                    <div className="flex-shrink-0">
                      <div className='d-flex gap-2 flex-wrap'>
                        {isMultiDeleteButton && <button className="btn btn-danger"
                          onClick={() => setDeleteModalMulti(true)}
                        ><i className="ri-delete-bin-2-line"></i></button>}
                      </div>
                    </div>
                  </div>
                </CardHeader>



                <CardBody className="pt-0">


                  <div >
                    <table class="hide">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>From</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainTable.map(row => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.date_created}</td>
                                    <td>${row.from_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div className="pagination hide">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={currentPage === index + 1 ? 'page-link active' : 'page-link'}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>

                  </div>                  

                

                  <div>
                    <TableContainer
                        columns={columns}
                        data={mainTable}
                        customPageSize={pageSize}
                        maxLength={totalPages}
                        currentPage={currentPage}
                        isAddUserList={false}
                        totalPages={totalPages}
                        isGlobalFilter={true}
                        className="custom-header-css"
                        theadClass="table-light "
                        divClass="table-responsive table-card mb-3"
                        tableClass="align-middle table-nowrap"
                        handlePageClick={handlePageChange}
                        isExtraFeature={true}
                        isAddOptions={false}
                        SearchPlaceholder='Search for user, status or something...'
                      />
                      {/* <TableContainer
                        columns={columns}
                        data={(mainTable || [])}
                        isGlobalFilter={true}
                        isAddUserList={false}
                        customPageSize={50}
                        className="custom-header-css"
                        theadClass="text-muted text-uppercase"
                        isInvoiceListFilter={true}
                        SearchPlaceholder='Search for something...'
                      />
                     */}
                  </div>
                  <ToastContainer closeButton={false} limit={1} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default InvoiceList;