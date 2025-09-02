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
  Table,
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

const SharingPurchasesList = () => {
  const api = new APIClient();
  document.title = "Admin - SHARING Purchases";

  const navigate = useNavigate();
  const statusRef = useRef("");
  const useridRef = useRef("");
  const addressRef = useRef("");
  const hashRef = useRef("");
  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSizeOption, setPageSizeOption] = useState(10); // for dropdown value  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default page size
  const [CurrentID, setCurrentID] = useState(0); 
  const [FilterUserID, setFilterUserID] = useState(0); 
  const [modal, setModal] = useState(false);
  const [editmodal, setEditModal] = useState(false);
  const [ID, setID] = useState('');
  const [FLR, setFLR] = useState('');
  const [USD, setUSD] = useState('');
  const [transactionID, setTransactionID] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [Notes, setNotes] = useState('');
  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editmodal);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const [logsModal, setLogsModal] = useState(false);
  const [logsData, setLogsData] = useState([]);
  
  const handlePageSizeChange = (e) => {
    debugger; 
    const value = e.target.value;
    setPageSizeOption(value);
    if (value === "all") {
      setPageSize(totalRecords); // Replace totalRecords with your actual total count
    } else {
      setPageSize(Number(value));
    }
  };

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
      header: "USER",
      accessorKey: "fullname",
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
      header: "PURCHASE DATE",
      accessorKey: "created_at",
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
      header: "COMMISSIONS TO",
      accessorKey: "commission",
      enableColumnFilter: false,
      cell: (cell) => (
        <>
          {cell.getValue()}
        </>
      ),
    },    
    {
      header: "AMOUNT",
      cell: (cell) => {
        const { amount, ip_address, ip_location } = cell.row.original;

        return (
          <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            ${amount}<br />
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
        switch (status) {
          case 'completed':
            statusClass = 'badge bg-success';
            break;
          case 'expired':
            statusClass = 'badge bg-secondary';
            break;
          case 'pending':
            statusClass = 'badge bg-danger';
            break;
          case 'cancelled':
              statusClass = 'badge bg-danger';
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
    },
    // {
    //   header: "ACTION",
    //   cell: (cell) => (
    //     <UncontrolledDropdown>
    //       <DropdownToggle
    //         href="#"
    //         className="btn btn-soft-primary btn-sm dropdown"
    //         tag="button"
    //       >
    //         <i className="ri-more-fill align-middle" />
    //       </DropdownToggle>
    //       <DropdownMenu className="dropdown-menu-end">
               
    //         <DropdownItem
    //           href="#"
    //           onClick={() => handleAction("resend", cell.row.original.id)}
    //         >
    //           <i className="ri-edit-2-fill  align-bottom me-2 text-muted"></i>{" "}
    //           Resend Account Info
    //         </DropdownItem>  
    //         <DropdownItem
    //           href="#"
    //           onClick={() => handleAction("deleted", cell.row.original.id)}
    //         >
    //           <i className="ri-mail align-bottom me-2 text-muted"></i>{" "}
    //           Delete
    //         </DropdownItem>
    //       </DropdownMenu>
    //     </UncontrolledDropdown>
    //   ),
    // },
    // {
    //   header: () => (
    //     <span style={{ textAlign: 'left', display: 'block' }}>NOTES</span>
    //   ),
    //   accessorKey: "notes",
    //   enableColumnFilter: false,
    //   cell: (cell) => {
    //     const value = cell.getValue();
    //     return (
    //       <span
    //         style={{
    //           textAlign: 'left',
    //           display: '-webkit-box',
    //           WebkitBoxOrient: 'vertical',
    //           WebkitLineClamp: 10,
    //           overflow: 'hidden',
    //           minWidth: '200px',  // Set your desired min-width here
    //         }}
    //       >
    //         {formatTextWithLineBreaks(value)}
    //       </span>
    //     );
    //   },
    // },
  ],
  []
);


  // Check if is_admin
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        if (sessionStorage.getItem("authUser")) {
          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;
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
      const data = { search: inputValue ,uid:obj.id };
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
        const url = '/getsharingpurchases';
        const data = {
          uid: uid,
          limit: limit,
          page: page,
          status: status,
          address: addressRef.current,
          hash: hashRef.current,           
          userid: UserID,
        };

        console.log(data);
        setLoading(true); // Start loading
        const response = await api.post(url, data,{showLoader:true});
        if (response.rows) {

          setRows(response.rows);
          setTotalPages(response.totalPages);
          setTotalRecords(response.rows.length);
          setLoading(false); 
       
        } else {
          window.location.href="/logout";
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
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { id: CurrentID, status: "success", txtID: transactionID, senderAdd: senderAddress,csrf_token: obj.csrf_token,uid:obj.id };
      const response = await axios.post(url, data);
      console.log(response);
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

  const handleEditModalSubmit = async () => {
    try {
      const url = "/updatedeposit.php";
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;      
      const data = { id: CurrentID, USD: USD, FLR: FLR , txtID: transactionID, senderAdd: senderAddress, notes: Notes , adminid: uid, csrf_token: obj.csrf_token};
      console.log(data);
      const response = await axios.post(url, data);
      debugger;
      if (response.success) {
        toast.success(`Details updated successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        toggleEditModal(); // close the modal
      } else {
        toast.error("Error updating deposit details");
      }
    } catch (error) {
      toast.error("Error updating deposit details");
    }
  };

  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height to content
      }
    };

    adjustHeight(); // Adjust height on mount and when content changes
  }, [Notes]);

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
    } else if (action === "edit") {
      setCurrentID(id);
      toggleEditModal();            
    } else if (action === "success") {
      setCurrentID(id);
      toggleModal();     
    } else if (action === "blockchainlogs") {
      debugger; 
      await fetchBlockchainLogs(id);            
    } else {
      try {
        const url = "/updatedepositstatus.php";
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const data = { id: id, status: action,csrf_token: obj.csrf_token,uid:obj.id };
        debugger; 
        const response = await axios.post(url, data);
        if (response.success) {
          toast.success(`Deposit status change to ${action} successfully`);
          debugger; 
          fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        } else {
          toast.error("Error updating deposit status");
        }
      } catch (error) {
        toast.error("Error updating deposit status");
      }
    }
  };

  const handleEditAction = async (id,usd,flr,transactionid,serveraddress,notes) => {
    setCurrentID(id);
    setUSD(usd);
    setFLR(flr);
    setTransactionID(transactionid);
    setSenderAddress(serveraddress);
    setNotes(notes);
    debugger; 
    toggleEditModal();            
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

  const handleDeleteRow = async () => {
    try {
      const url = "/deleteitv.php";
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { id: CurrentID ,csrf_token: obj.csrf_token,uid:obj.id };      
      const response = await axios.post(url, data);
      debugger; 
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

  const handleAddressChange = (e) => {
    const address = e.target.value;
    addressRef.current = address; 
    fetchRows(currentPage, pageSize, statusRef.current);
  };

  const handleHashChange = (e) => {
    const hash = e.target.value;
    debugger; 
    hashRef.current = hash; 
    fetchRows(currentPage, pageSize, statusRef.current);
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
              <BreadCrumb title="SHARING PURCHASES" pageTitle="Dashboard" />
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
                              <option value="">Filter by Status</option>
                              <option value="pending">Active</option>
                              <option value="success">Expired</option>
                              <option value="cancelled">Cancelled</option>
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
                        <Col sm={6}>   </Col> 
                      </Row>
                    </CardHeader>
                    <CardBody className="pt-0">
                          {loading && (
                            <div className="loading-overlay">
                              <p>Loading... Please wait</p>
                            </div>
                          )}
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
                      <Modal isOpen={editmodal} toggle={toggleEditModal} centered>
                        <ModalHeader className="bg-light p-3" toggle={toggleEditModal}>Edit Transaction Details for ID: </ModalHeader>
                        <ModalBody>
                        <FormGroup>
                          <Label for="notes">Notes</Label>
                          <Input
                            type="textarea"
                            id="notes"
                            value={Notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={15} 
                            innerRef={textareaRef} 
                          />
                        </FormGroup>                    
                          <FormGroup>
                            <Label for="txtUSD">USD</Label>
                            <Input
                              type="text"
                              id="txtUSD"
                              value={USD}
                              onChange={(e) => setUSD(e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <Label for="txtFLR">FLR</Label>
                            <Input
                              type="text"
                              id="txtFLR"
                              value={FLR}
                              onChange={(e) => setFLR(e.target.value)}
                            />
                          </FormGroup>
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
                          <Button color="primary" onClick={handleEditModalSubmit}>Submit</Button>{' '}
                          <Button color="secondary" onClick={toggleEditModal}>Cancel</Button>
                        </ModalFooter>
                      </Modal> 

                      <Modal isOpen={modal} toggle={toggleModal} centered>
                        <ModalHeader className="bg-light p-3" toggle={toggleModal}>Enter Transaction Details</ModalHeader>
                        <ModalBody>
                        <FormGroup>
                          <Label for="notes">Notes</Label>
                          <Input
                            type="textarea"
                            id="notes"
                            value={Notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </FormGroup>
                          <FormGroup>
                            <Label for="transactionID">Transaction ID1</Label>
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
                      <Modal className="mw-1650" isOpen={logsModal} toggle={() => setLogsModal(false)} centered>
                        <ModalHeader className="bg-light p-3 mw-1650" toggle={() => setLogsModal(false)}>
                          Blockchain Logs
                        </ModalHeader>
                        <ModalBody className="mw-1650" >
                          <Table bordered>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>TransactionID</th>
                                <th style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>WalletAddress</th>
                                {/* Add more columns as necessary */}
                              </tr>
                            </thead>
                            <tbody>
                              {logsData.map((log, index) => (
                                <tr key={index}>
                                  <td>{log.date_created}</td>
                                  <td>{log.data_id}</td>
                                  <td>{log.amount}</td>
                                  <td>{log.status}</td>
                                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.transactionID}</td>
                                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.senderWalletAddress}</td>
                                  {/* Add more cells as necessary */}
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="secondary" onClick={() => setLogsModal(false)}>
                            Close
                          </Button>
                        </ModalFooter>
                      </Modal>
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

export default SharingPurchasesList;
