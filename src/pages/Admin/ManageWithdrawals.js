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
const DepositList = () => {
  const api = new APIClient();
  document.title = "Manage Withdrawals | IBOPRO";

  const navigate = useNavigate();
  const statusRef = useRef("");
  const useridRef = useRef("");
  const addressRef = useRef("");
  const hashRef = useRef("");
  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
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
    const [receiverAddress, setReceiverAddress] = useState('');
  const [Notes, setNotes] = useState('');
  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editmodal);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const [logsModal, setLogsModal] = useState(false);
  const [logsData, setLogsData] = useState([]);
  
  const fetchBlockchainLogs = async (id) => {
    try {
      debugger; 
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const url = "/getcryptodepositlogs.php";
      const data = { logid: id, csrf_token: obj.csrf_token, uid: obj.id };
      const response = await axios.post(url, data);
      if (response.rows) {
        setLogsData(response.rows);
        setLogsModal(true); // Show the modal after fetching data
      } else {
        toast.error("Error fetching blockchain logs");
      }
    } catch (error) {
      toast.error("Error fetching blockchain logs");
    }
  };



  const loginasuser = (inputValue) => {
    // Open the loginasuser.js file in a new tab with the inputValue as a query parameter
    if (inputValue !== 1 && inputValue !== 2) {
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
      header: "DETAILS",
      cell: (cell) => {
        const { amount, amount_flr, transactionID, receiverWalletAddress, ip_address, ip_location, coin_type } = cell.row.original;
    
        // Default coin_type to 'flr' if it is null or empty
        const coinType = coin_type || 'flr';
    
        // Determine the appropriate suffix and link based on coinType
    const coinSuffix =
      coinType === 'btc' ? 'BTC' :
      coinType === 'rlusd' ? 'RLUSD' :
      coinType === 'xrp' ? 'XRP' :
      coinType === 'flr' ? 'FLR' :
      coinType === 'pol' ? 'POL' :
      coinType === 'usdt' ? ' USDT-POL' :
      coinType === 'usdt-bep20' ? ' USDT-BEP20' :
      '';
        const formattedCoinValue = `${amount_flr}${coinSuffix}`;
        
        // Set the appropriate link based on coinType

          const link =
          coinType === 'flr'
          ? `https://flare-explorer.flare.network/tx/${transactionID}`
          : coinType === 'pol'
          ? `https://polygonscan.com/tx/${transactionID}`
          : coinType === 'usdt'
          ? `https://polygonscan.com/tx/${transactionID}` 
          : coinType === 'usdt-bep20'
          ? `https://bscscan.com/tx/${transactionID}`           
          : '#'; 


        return (
          <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            <strong>Amount: </strong> ${amount}<br />
            <strong>Currency: </strong> {coin_type === 'usdt' ? 'USDT' : coin_type}<br />
            <strong>Sharing Financial Email: </strong> {receiverWalletAddress}<br />
            <strong>Tx Hash: </strong> 
            <a href={link} target="_blank" rel="noopener noreferrer" className="link-primary">
              {transactionID}
            </a><br />            
            <strong>IP Address: </strong> {ip_address}<br />
            <strong>IP Location: </strong> {ip_location}
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
        //const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
        const formattedStatus = status 
        ? status.charAt(0).toUpperCase() + status.slice(1) 
        : "Pending";

        let statusClass;
        switch (status) {
          case 'success':
            statusClass = 'badge bg-success';
            break;
          case 'onhold':
            statusClass = 'badge bg-primary';
            break;
          case 'pending':
            statusClass = 'badge bg-danger';
            break;
          case 'cancelled':
            statusClass = 'badge bg-info';
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
    {
      header: "ACTION",
      cell: (cell) => (
        <UncontrolledDropdown>
          <DropdownToggle
            href="#"
            className="btn btn-soft-primary btn-sm dropdown"
            tag="button"
          >
            <i className="ri-more-fill align-middle" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem
              className="dropdown-item"
              href="#"
              onClick={() => handleEditAction(cell.row.original.id,cell.row.original.amount,cell.row.original.transactionID,cell.row.original.receiverWalletAddress,cell.row.original.notes)}
            >
              <i className="ri-edit-2-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
            </DropdownItem>
            <DropdownItem
              className="dropdown-item"
              href="#"
              onClick={() => handleAction("success", cell.row.original.id,cell.row.original.transactionID,cell.row.original.receiverWalletAddress)}
            > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  Set Success
            </DropdownItem>
            <DropdownItem
              href="#"
              onClick={() => handleAction("pending", cell.row.original.id)}
            >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Set Pending
            </DropdownItem>
            <DropdownItem
              href="#"
              onClick={() => handleAction("cancelled", cell.row.original.id,cell.row.original.transactionID,cell.row.original.receiverWalletAddress)}
            >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Set Cancelled
            </DropdownItem>
            <DropdownItem
              href="#"
              onClick={() => handleAction("deleted", cell.row.original.id)}
            >
              <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
              Delete
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      ),
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
              minWidth: '200px',  // Set your desired min-width here
            }}
          >
            {formatTextWithLineBreaks(value)}
          </span>
        );
      },
    },
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
        const url = '/getallwithdrawals';
        const data = {
          id: uid,
          uid: uid,
          limit: limit,
          page: page,
          status: status,
          address: addressRef.current,
          hash: hashRef.current,
          userid: UserID
        };

        console.log(data);
        setLoading(true); // Start loading
        const response = await api.post(url, data);
        if (response.rows) {
          setRows(response.rows);
          setTotalPages(response.totalPages);
          setLoading(false); 
          // Change pageSize if rows are less than 10
          // debugger; 
          // if (response.rows.length < 10) {
          //   setPageSize(response.rows.length);
          // }          
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
      backgroundColor: "#262a2f",
      borderColor: "#2a2f34",
      color: "white",
      marginRight: 15
    }),
  };

  const handleModalSubmit = async () => {
    try {
      const url = "/updatewithdrawstatus";
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { id: CurrentID, status: "success", txtID: transactionID, receiverAddress: receiverAddress,uid:obj.id };
      const response = await api.post(url, data);
      console.log(response);
      if (response.success) {
        toast.success(`Withdraw status changed to success successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        toggleModal(); // close the modal
      } else {
        toast.error("Error updating withdraw status");
      }
    } catch (error) {
      toast.error("Error updating withdraw status");
    }
  };

  const handleEditModalSubmit = async () => {
    try {

      const url = "/updatewithdraw";
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;      
      const data = { id: CurrentID, USD: USD,  txtID: transactionID, receiverAdd: receiverAddress, notes: Notes , uid: uid};
      console.log(data);
      const response = await api.post(url, data);

      if (response.success) {
        toast.success(`Details updated successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        toggleEditModal(); // close the modal
      } else {
        toast.error("Error updating withdraw details");
      }
    } catch (error) {
      toast.error("Error updating withdraw details");
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


  const handleAction = async (action, id,transactionid= '',receiverAddress= '') => {

debugger; 
    if (action=="deleted")
    {
      setCurrentID(id);
      setDeleteModal(true);
    } else if (action === "edit") {
      setTransactionID(transactionid);
      setReceiverAddress(receiverAddress);      
      setCurrentID(id);
      toggleEditModal();            
    } else if (action === "success") {
      setCurrentID(id);
      toggleModal();     
      setTransactionID(transactionid);
      setReceiverAddress(receiverAddress);
    } else if (action === "blockchainlogs") {
      debugger; 
      await fetchBlockchainLogs(id);            
    } else {
      try {
        debugger;
        const url = "/updatewithdrawstatus";
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const data = { id: id, status: action,uid:obj.id, txtID:transactionid,receiverAdd:receiverAddress };
        debugger; 
        const response = await api.post(url, data);
        if (response.success) {
          toast.success(`Withdraw status change to ${action} successfully`);
          debugger; 
          fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        } else {
          toast.error("Error updating withdraw status");
        }
      } catch (error) {
        toast.error("Error updating withdraw status");
      }
    }
  };

  const handleEditAction = async (id,usd,transactionid,serveraddress,notes) => {

    setCurrentID(id);
    setUSD(usd);
    setTransactionID(transactionid);
    setReceiverAddress(serveraddress);
    setNotes(notes);

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
      const url = "/deletedeposit";
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { id: CurrentID ,uid:obj.id };      
      const response = await api.post(url, data);
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
                <BreadCrumb title="Sharing Payouts" pageTitle="Dashboard" />
              <Row>
                <Col lg={12}>
                  <Card id="customerList">
                    <CardHeader className="border-0">
                      <Row className="g-4">
                        <Col sm={4}>   <span className="table-caption">Sharing Payouts</span></Col> 
                        <Col sm={8}>
                          <div className="d-flex">
                          <Input
                              id="filter_address"
                              type="text"
                              placeholder="Filter by Address"
                              className="form-control me-2"
                              onChange={handleAddressChange}
                              value={addressRef.current}
                            >
                            </Input> 
                            <Input
                              id="filter_hash"
                              type="text"
                              placeholder="Filter by Hash"
                              className="form-control me-2"
                              onChange={handleHashChange}
                              value={hashRef.current}
                            >
                            </Input> 
                          <AsyncSelect
                            cacheOptions
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
                              <option value="pending">Pending</option>
                              <option value="success">Success</option>
                              <option value="cancelled">Cancelled</option>
                            </Input> 
                                      
                          </div>
                        </Col>
                      
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
                            rows={5} 
                            innerRef={textareaRef} 
                          />
                        </FormGroup>                    
                          <FormGroup>
                            <Label for="txtUSD">AMOUNT</Label>
                            <Input
                              type="text"
                              id="txtUSD"
                              value={USD}
                              onChange={(e) => setUSD(e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <Label for="transactionID">Transaction Hash</Label>
                            <Input
                              type="text"
                              id="transactionID"
                              value={transactionID}
                              onChange={(e) => setTransactionID(e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <Label for="receiverAddress">Receiver Email</Label>
                            <Input
                              type="text"
                              id="receiverAddress"
                              value={receiverAddress}
                              onChange={(e) => setReceiverAddress(e.target.value)}
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
                            <Label for="transactionID">Transaction Hash</Label>
                            <Input
                              type="text"
                              id="transactionID"
                              value={transactionID}
                              onChange={(e) => setTransactionID(e.target.value)}
                            />
                          </FormGroup>
                          <FormGroup>
                            <Label for="receiverAddress">Receiver Email</Label>
                            <Input
                              type="text"
                              id="receiverAddress"
                              value={receiverAddress}
                              onChange={(e) => setReceiverAddress(e.target.value)}
                            />
                          </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="success" onClick={handleModalSubmit}>Set to Success</Button>{' '}
                          <Button color="primary" onClick={toggleModal}>Cancel</Button>
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

export default DepositList;
