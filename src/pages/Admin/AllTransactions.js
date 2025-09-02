import React, { useState, useEffect, useMemo, useCallback ,useRef  } from "react";
import {
  CardBody,
  Row,
  Col,
  Input,
  Card,
  Container,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,  
  FormGroup,
  Label,
  Button
} from "reactstrap";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AsyncSelect from 'react-select/async';
import DeleteModal from "../../Components/Common/DeleteModal";
import { APIClient } from "../../helpers/api_helper";

const TransactionList = () => {
  const api = new APIClient();
  document.title = "Admin - All Transactions";

  const navigate = useNavigate();
  const statusRef = useRef("");
  const useridRef = useRef("");
  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default page size
  const [CurrentID, setCurrentID] = useState(0); 
  const [FilterUserID, setFilterUserID] = useState(0); 
  const [modal, setModal] = useState(false);
  const [transactionID, setTransactionID] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const toggleModal = () => setModal(!modal);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
    const [totalRecords, setTotalRecords] = useState(0);
  const [pageSizeOption, setPageSizeOption] = useState(10); // for dropdown value
  const loginasuser = (inputValue) => {
    // Open the loginasuser.js file in a new tab with the inputValue as a query parameter
    window.open(`/loginasuser?authUser=${encodeURIComponent(inputValue)}`, '_blank');
  };

  // Initialize columns
  const columns = useMemo(
    () => [
      {
        header: <span></span>,
        cell: (cell) => {
          return <span></span>;
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
          return cell.getValue();
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
        header: "USER",
        accessorKey: "user",
        enableColumnFilter: false,
        cell: (cell) => {
          const userId = cell.row.original.user_id; // Retrieve the USERID from the original row data
          const uName = cell.getValue(); // Get the sponsor name
          return (
            <span 
              className="fw-medium link-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => loginasuser(userId)}
            >
              {uName}
            </span>
          );
        },
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
        cell: (cell) => {
          return cell.getValue();
        },
      },  
      {
        header: "RUNNING TOTAL",
        accessorKey: "running_total",
        enableColumnFilter: false,
        cell: (cell) => {
          return cell.getValue();
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
     
    //   {
    //     header: "ACTION",
    //     cell: (cell) => (
    //       <UncontrolledDropdown>
    //         <DropdownToggle
    //           href="#"
    //           className="btn btn-soft-primary btn-sm dropdown"
    //           tag="button"
    //         >
    //           <i className="ri-more-fill align-middle" />
    //         </DropdownToggle>
    //         <DropdownMenu className="dropdown-menu-end">
    //           <DropdownItem
    //             className="dropdown-item"
    //             href="#"
    //             onClick={() => handleAction("success", cell.row.original.id)}
    //           > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //                 Set Success
    //           </DropdownItem>
    //           <DropdownItem
    //             href="#"
    //             onClick={() => handleAction("pending", cell.row.original.id)}
    //           >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //             Set Pending
    //           </DropdownItem>
    //           <DropdownItem
    //             href="#"
    //             onClick={() => handleAction("cancelled", cell.row.original.id)}
    //           >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //             Set Cancelled
    //           </DropdownItem>
    //           <DropdownItem
    //             href="#"
    //             onClick={() => handleAction("deleted", cell.row.original.id)}
    //           >
    //             <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
    //             Delete
    //           </DropdownItem>
    //         </DropdownMenu>
    //       </UncontrolledDropdown>
    //     ),   
    //   }

    ]
  );

  // Check if is_admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (sessionStorage.getItem("authUser")) {
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;
          const is_admin =obj.is_admin; 
          if (!is_admin)
          {
            navigate('/accessdenied');
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
      const url = '/getallusersdropdown';
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { search: inputValue, uid: obj.id };
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
  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    setPageSizeOption(value);
    if (value === "all") {
      setPageSize(totalRecords); // Replace totalRecords with your actual total count
    } else {
      setPageSize(Number(value));
    }
  };
  // Main row fetching
  const fetchRows = async (page, limit,status) => {
    try {
      if (sessionStorage.getItem("authUser")) {
        const UserID = useridRef.current;
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const url = '/getalltransactions';

        const data = {
          uid: uid,
          limit: limit,
          page: page,
          status: status,
          userid: UserID
        };
        console.log(data);
        setLoading(true); // Start loading

        const response = await api.post(url, data,{showLoader:true});
        if (response.rows) {
          setRows(response.rows);
          setTotalPages(response.totalPages);

          // Change pageSize if rows are less than 10
          // debugger; 
          // if (response.rows.length < 10) {
          //   setPageSize(response.rows.length);
          // }          
        }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    } finally {
      setLoading(false); // End loading
    }
  };  
  
  // Handles
  const handleInputChange = (newValue) => {
    return newValue;
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


  const handleModalSubmit = async () => {
    try {
      const url = "/updatedepositstatus.php";
      const data = { id: CurrentID, status: "success", txtID: transactionID, senderAdd: senderAddress };
      const response = await axios.post(url, data);
      if (response.success) {
        toast.success(`Deposit status changed to success successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        toggleModal(); // close the modal
      } else {
        toast.error("Error updating deposit status");
      }
    } catch (error) {
      toast.error("Error updating deposit status");
    }
  };

  useEffect(() => {
    fetchRows(currentPage, pageSize,"");
  }, [currentPage]);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const handleAction = async (action, id) => {

    if (action=="deleted")
    {
      setCurrentID(id);
      setDeleteModal(true);
    } else if (action === "success") {
      setCurrentID(id);
      toggleModal();      
    } else {
      try {
        const url = "/updatedepositstatus.php";
        const data = { id: id, status: action };
        const response = await axios.post(url, data);
        if (response.success) {
          toast.success(`Deposit status change to ${action} successfully`);
          fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        } else {
          toast.error("Error updating deposit status");
        }
      } catch (error) {
        toast.error("Error updating deposit status");
      }
    }
  };

  const handleDeleteRow = async () => {
    try {
      const url = "/deletedeposit.php";
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

  return (
    <div className="page-content">
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteRow} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="ALL TRANSACTIONS" pageTitle="Dashboard" />
        <Row>
          <Col lg={12}>
            <Card id="customerList">
              <CardHeader className="border-0">
                <Row className="g-4">
                  <Col sm={5}>
                    <div className="d-flex">
                    <AsyncSelect
                      cacheOptions
                      classNamePrefix="custom-select"
                      loadOptions={fetchOptions}
                      onInputChange={handleInputChange}
                      onChange={handleChange}
                      defaultOptions
                      value={selectedOption}
                      placeholder="Type any user"
                      styles={customStyles}
                    />                      
                    <Input
                        id="filter_userid"
                        type="text"
                        placeholder="All Users"
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
                        <option value="">All</option>
                        <option value="pending">Commissions</option>
                        <option value="success">Payments</option>
                        {/* <option value="cancelled">Withdrawals</option>
                        <option value="cancelled">Deposits</option>
                        <option value="cancelled">Transfers</option> */}
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
              {loading ? ( // Conditional rendering for loading
                  <div className="text-center">
                    <p>Loading... Please wait</p>
                  </div>
                    ) : (
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
                  )}
                <Modal isOpen={modal} toggle={toggleModal} centered>
                  <ModalHeader className="bg-light p-3" toggle={toggleModal}>Enter Transaction Details</ModalHeader>
                  <ModalBody>
                    <FormGroup>
                      <Label for="transactionID">Transaction ID</Label>
                      <Input
                        type="text"
                        id="transactionID"
                        value={transactionID}
                        onChange={(e) => setTransactionID(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="senderAddress">Sender Address</Label>
                      <Input
                        type="text"
                        id="senderAddress"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                      />
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={handleModalSubmit}>Set to Success</Button>{' '}
                    <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                  </ModalFooter>
                </Modal>  
               
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default TransactionList;
