import React, { useState, useEffect, useMemo, useCallback ,useRef  } from "react";
import {
  CardBody,
  Row,
  Col,
  Input,
  Card,
  Container,
  CardHeader,
} from "reactstrap";

import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AsyncSelect from 'react-select/async';
import DeleteModal from "../../Components/Common/DeleteModal";
import spinner1 from "../../assets/images/logo-sm.png";
import { APIClient } from "../../helpers/api_helper";

const ActivityLogs = () => {
  const api = new APIClient();
  document.title = "Admin - Activity Logs";
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [AuthID, setAuthID] = useState(0); 
  const statusRef = useRef("");
  const useridRef = useRef("");
  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default page size
  const [pageSizeOption, setPageSizeOption] = useState(10); // for dropdown value
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const loginasuser = (inputValue) => {
    // Open the loginasuser.js file in a new tab with the inputValue as a query parameter
    if (inputValue !== 1 && inputValue !== 2) {
      debugger; 
      window.open(`/dashboard/loginasuser?authUser=${encodeURIComponent(inputValue)}`, '_blank'); 
    }
  };

  // Initialize columns
  const columns = useMemo(
    () => [

      {
        header: "ID",
        accessorKey: "id",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },   
      {
        header: "Time Stamp",
        isVisible: false, 
        accessorKey: "date_created",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },  
      {
        header: "User ID",
        isVisible: false, 
        accessorKey: "user_id",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },            
      {
        header: () => <span style={{ maxWidth: '300px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>User</span>,
        accessorKey: "fullname",
        enableColumnFilter: false,
        cell: (cell) => (
          <span 
            className="fw-medium link-primary"
            style={{
              cursor: 'pointer',
              maxWidth: '300px',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onClick={() => loginasuser(cell.row.original.user_id)}
          >
            {cell.getValue()}
          </span>
        ),
      },     
      {
        header: "Event",
        isVisible: false, 
        accessorKey: "type",
        enableColumnFilter: false,
        cell: (cell) => (
          <>

            {cell.getValue()}
          </>
        ),
      },  
      {
        header: "Additional Data",
        accessorKey: "data",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },
      {
        header: "IP Address",
        accessorKey: "ip_address",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },
      {
        header: "IP Location",
        accessorKey: "ip_location",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      }
    ]
  );

  // Check if is_admin
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        if (sessionStorage.getItem("authUser")) {
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;
          setAuthID(uid);
          const is_admin =obj.is_admin; 
          if (!is_admin)
          {
            navigate('/logout');
            return; 
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
    fetchData();

  }, []);

  // Get users for filtering
  const fetchOptions = async (inputValue) => {
    try {

      const obj = JSON.parse(sessionStorage.getItem("authUser"));      
      const url = '/getallusersdropdown';
      const data = { search: inputValue , uid:obj.id };
      console.log(data);
      const response = await api.post(url, data);
      console.log(response);
  
      const options = response.rows.map(user => ({
        value: user.id,
        label: user.full_name,
      }));
  
      // Add an empty option at the top
      options.unshift({ value: '', label: 'Filter by User' });
  
      return options;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };


  // Main row fetching
  const fetchRows = async (page, limit,status) => {
    try {
      if (sessionStorage.getItem("authUser")) {
        const UserID = useridRef.current;
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const url = '/getallactivitylogs';
        const data = {
          uid: uid,
          limit: limit,
          page: page,
          event: status,
          userid: UserID,
        };
debugger; 
        const response = await api.post(url, data,{ showLoader: true });

        if (response.status==="success") {
          setRows(response.rows);
          setTotalRecords(response.rows.length);
          setLoading(false); 
          
          // Change pageSize if rows are less than 10
          // if (response.rows.length < 10) {
          //   setPageSize(response.rows.length);
          // }          
        } else {
          window.location.href="/logout";
        }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };  
  
  // Handles
  const handleInputChange = (newValue) => {
    return newValue;
  };


  const renderRowSubComponent = (row) => {
    return (
      <div style={{ padding: '10px' }}>
        <strong>More Info:</strong>
        <br />
        Transaction ID: {row.original.transactionID}
        <br />
        Sender Address: {row.original.senderAddress}
        {/* Add more fields as necessary */}
      </div>
    );
  };

  const handleDeleteRow = async () => {
    try {
      const url = "/deleteuser.php";
      const data = { id: CurrentID };
      const response = await axios.post(url, data);
 
      if (response.success) {
        toast.success(`Row Deleted successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); 
      } else {
        toast.error("Error deleting row.");
      }
    } catch (error) {
      toast.error("Error deleting row.");
    }
    setDeleteModal(false);

  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const userid = selectedOption['value']; 
    useridRef.current = userid; 
    fetchRows(currentPage, pageSize, statusRef.current);    
    console.log('Selected option:', selectedOption);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '250px',
      backgroundColor: "#262a2f", // "#061e39",
      borderColor: "#2a2f34", //"#061e39",
     // color: "white",
      marginRight: 15
    }),
  };


  useEffect(() => {
    fetchRows(currentPage, pageSize,"");
  }, [currentPage]);


  const resetCheckboxes = () => {
    setCheckedPlans([]);
  };

 
  

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    statusRef.current = status; 
    fetchRows(currentPage, pageSize, status);
  };

  const handleUserIDChange = (e) => {
    const userid = e.target.value;
    useridRef.current = userid; 
    fetchRows(currentPage, pageSize, statusRef.current);
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
  return (
        <div className="page-content">
          <DeleteModal show={deleteModal} onDeleteClick={handleDeleteRow} onCloseClick={() => setDeleteModal(false)} />
          {loading ? (
            <Container fluid>
                <div id="status">
                    <div className="spinner-border text-secondary avatar-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
              {/* <div className="loading-overlay">
                <p><strong>Loading... Please wait</strong></p>
              </div> */}
            </Container>
          ) : (      
          <Container fluid>
            <BreadCrumb title="Activity Logs" pageTitle="Dashboard" />
            <Row>
              <Col lg={12}>
                <Card id="customerList">
                  <CardHeader className="border-0">
                    <Row className="g-4">
                    
                      <Col sm={8}>
                        <div className="d-flex">
                        <AsyncSelect
                          classNamePrefix="custom-select"
                          cacheOptions
                          loadOptions={fetchOptions}
                          onInputChange={handleInputChange}
                          onChange={handleChange}
                          defaultOptions
                          value={selectedOption}
                          placeholder="Select any user"
                          styles={customStyles}
                        />  
                      
                        <Input
                            id="filter_userid"
                            type="text"
                            placeholder="Filter by User ID"
                            className="form-control me-2 hide"
                            onChange={handleUserIDChange}
                          >
                          </Input> 
                        <Input
                            id="filter_status"
                            type="select"
                            className="form-select me-2"
                            onChange={handleStatusChange}
                          >
                            <option value="">Filter by Event</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                            <option value="updateprofile">Update Profile</option>
                            <option value="createdeposit">Create Deposit</option>
                            <option value="depositcompleted">Deposit Completed</option>
                            <option value="planpurchase">Plan Purchase</option>
                            <option value="changepassword">Change Password</option>
                            <option value="fundtransfer">Fund Transfer</option>
                            <option value="fundtransfer_otp">Fund Transfer - OTP</option>
                            <option value="withdrawalcompleted">Create Withdrawal</option>
                            <option value="withdrawalcompleted">Withdrawal Completed</option>
                          </Input> 
                                    
                        </div>
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
                    </Row>
                  </CardHeader>
                  <CardBody className="pt-0">
                
                    <TableContainer
                      columns={columns}
                      data={mainTable}
                      renderRowSubComponent={renderRowSubComponent}                  
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

                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
          )}
          <ToastContainer closeButton={false} limit={1} />
        </div>
  );
};

export default ActivityLogs;
