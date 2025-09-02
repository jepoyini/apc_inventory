import React, { useState, useEffect, useMemo, useCallback ,useRef  } from "react";
import {
  Alert,
  CardBody,
  Table,
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
import spinner1 from "../../assets/images/logo-sm.png";
import { APIClient } from "../../helpers/api_helper";

const DepositList = () => {
  const api = new APIClient();
  document.title = "Admin - All Users";
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [AuthID, setAuthID] = useState(0); 
  const statusRef = useRef("");
  const useridRef = useRef("");
  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default page size
  const [CurrentID, setCurrentID] = useState(0); 
  const [CurrentName, setCurrentName] = useState(''); 
  const [CurrentSponsor, setCurrentSponsor] = useState(''); 
  const [selectedType, setSelectedType] = useState('');   
  const [amount_type, setAmountType] = useState('');   
  const [amountflr_type, setAmountFlrType] = useState('');   
  const [note_type, setNoteType] = useState('');   
  const [FilterUserID, setFilterUserID] = useState(0); 
  const [ChangeSponsormodal, setChangeSponsorModal] = useState(false);
  const [ChangePasswordmodal, setChangePasswordModal] = useState(false);
  const [ChangePlanPurchasemodal, setPlanPurchaseModal] = useState(false);
  const [AdminAdjustmentmodal, setAdminAdjustmentModal] = useState(false);
  const [transactionID, setTransactionID] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [plans, setPlans] = useState([]);
  const toggleChangeSponsorModal = () => setChangeSponsorModal(!ChangeSponsormodal);
  const toggleChangePasswordModal = () => {
    setChangePasswordModal(!ChangePasswordmodal);
    setNewPassword('');
    setConfirmPassword('');
    setValidationError('');
  };
  const togglePlanPurchaseModal = () => {
    setValidationError('');
    setPlanPurchaseModal(!ChangePlanPurchasemodal);
    setPlans([]);
    if (ChangePlanPurchasemodal) {
      resetCheckboxes();
    }
  };
  const toggleAdminAdjustmentModal = () => {
    setAmountType('');
    setAmountFlrType('');
    setNoteType('');
    setSelectedType('');
    setValidationError('');
    setAdminAdjustmentModal(!AdminAdjustmentmodal);
  };


  const [NewPassword, setNewPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const [validationError, setValidationError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
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
            onClick={() => loginasuser(cell.row.original.id)}
          >
            {cell.getValue()}
          </span>
        ),
      },     
      {
        header: "Email",
        isVisible: false, 
        accessorKey: "email",
        enableColumnFilter: false,
        cell: (cell) => (
          <>

            {cell.getValue()}
          </>
        ),
      },  
      {
        header: () => <span style={{ maxWidth: '200px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sponsor</span>,
        accessorKey: "sponsor_name",
        enableColumnFilter: false,
        cell: (cell) => {
          const userId = cell.row.original.sponsor_id; // Retrieve the USERID from the original row data
          const sponsorName = cell.getValue(); // Get the sponsor name
          const isroot = userId === 1; 
          return (
            <span 
              className={`fw-medium link-primary ${isroot ? 'hide' : ''}`}
              style={{
                cursor: 'pointer',
                maxWidth: '200px',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              onClick={() => loginasuser(userId)}
            >
              {sponsorName} 
            </span>
          );
        },
      },      
      {
        header: "Downlines",
        accessorKey: "no_of_downlines",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },
      {
        header: "SHARING Purchased",
        accessorKey: "sharing_purchase",
        enableColumnFilter: false,
        cell: (cell) => {
          debugger; 
          // Get the value, default to an empty string if null or undefined
          const plans = cell.getValue() || '';
          
          // Split the value into an array
          const plansArray = plans.split('  ');
          
          // Define two groups of values
          const firstGroup = plansArray.slice(0, 6);
          const secondGroup = plansArray.slice(6);
          
          // Function to render plans with badge styles
          const renderPlans = (plansGroup) => (
            plansGroup.map((plan, index) => {
              // Check if the plan is prefixed with '@'
              const isAdminMade = plan.startsWith('@');
              const badgeClass = isAdminMade 
                ? "badge border border-warning text-warning mr-3" 
                : "badge border border-success text-success mr-3";

              // Remove '@' from the plan name if it's an admin-made plan
              const displayPlan = isAdminMade ? plan.substring(1) : plan;
      
              return (
                <span key={index} className={badgeClass}>
                  {displayPlan}
                </span>
              );
            })
          );
      
          return (
            <div className="plan-col" style={{ whiteSpace: 'pre-wrap', color: 'lightgreen' }}>
              {renderPlans(firstGroup)}<br />
              {renderPlans(secondGroup)}
            </div>
          );
        },
      },
      {
        header: "Debits",
        accessorKey: "total_debits",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },
      {
        header: "Credits",
        accessorKey: "total_credits",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      }, 
      {
        header: "Earnings",
        accessorKey: "total_commissions",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },             
      {
        header: "Wallet Balance",
        accessorKey: "total_amount",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            {cell.getValue()}
          </>
        ),
      },      
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cell) => {
          const status = cell.getValue();
         // const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter

          let statusClass;
          switch (status) {
            case 'active':
              statusClass = 'badge bg-success';
              break;
            case 'locked':
              statusClass = 'badge bg-primary';
              break;
            case 'deleted':
              statusClass = 'badge bg-danger';
              break;
            default:
              statusClass = 'badge bg-secondary';
              break;
          }
          return (
            <span className={statusClass}>
              {capitalize(status)}
            </span>
          );
        },
      },
      {
        header: "Action",
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
                onClick={() => handleAction("login_as_user", cell.row.original.id)}
              > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Login as User
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => handleAction("changesponsor", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Change Sponsor
              </DropdownItem>
               <DropdownItem
                href="#"
                onClick={() => handleAction("changepassword", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Change Password
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => handleAction("adminadjustment", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Admin Adjustment
              </DropdownItem>
              {AuthID == 2 && (
                <DropdownItem
                  href="#"
                  onClick={() => handleAction("planpurchases", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
                >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      Plan Purchases
                </DropdownItem>   
               )}           
              {/*<DropdownItem
                href="#"
                onClick={() => handleAction("addtransaction", cell.row.original.id)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Add Transaction
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => handleAction("block", cell.row.original.id)}
              >
                <i className="ri-stop-circle-line align-bottom me-2 text-muted"></i>{" "}
                Block
              </DropdownItem> */}
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
      }   
    ]
  );


  const [planStates, setPlanStates] = useState([]);

  const [checkedPlans, setCheckedPlans] = useState({});

  useEffect(() => {
    // Initialize checkedPlans based on the plans data
    const initialCheckedPlans = plans.reduce((acc, plan) => {
      if (plan.is_taken) {
        acc[plan.id] = true;
      }
      return acc;
    }, {});
    setCheckedPlans(initialCheckedPlans);
  }, [plans]);

  const handleCheckboxChange = (planId) => {
    setCheckedPlans(prevCheckedPlans => ({
      ...prevCheckedPlans,
      [planId]: !prevCheckedPlans[planId],
    }));
  };

  // //Plans
  // useEffect(() => {
  //   const fetchPlans = async () => {
  //     try {
  //       const obj = JSON.parse(sessionStorage.getItem("authUser"));  
  //       const url = '/getplans.php';
  //       const data = { id: CurrentID, csrf_token: obj.csrf_token };
  //       console.log(data);
  //       const response = await api.post(url, data);        
  //       setPlans(response.rows);
  //       setPlanStates(response.rows);
  //     } catch (error) {
  //       setValidationError('Failed to fetch plans');
  //     }
  //   };
  //   fetchPlans();
  // }, [CurrentID,ChangePlanPurchasemodal]);

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
        const url = '/getallusers';
        const data = {
          uid: uid,
          limit: limit,
          page: page,
          status: status,
          userid: UserID
        };
        debugger; 
        const response = await api.post(url, data);
        
        if (response.status==="success") {
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
    }
  };  
  
  // Handles
  const handleInputChange = (newValue) => {
    return newValue;
  };

  const handleChangeSponsor = (selected) => {
    setSelectedSponsor(selected);
    console.log('Selected sponsor:', selected);
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
      backgroundColor: "#061e39",
      borderColor: "#061e39",
     // color: "white",
      marginRight: 15
    }),
  };

  const handleModalSubmit = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;      
      const sponsor_id = selectedSponsor.value; 
      const url = "/changesponsor.php";
      const data = { id:CurrentID, sponsor_id: sponsor_id,adminid:uid,fullname: CurrentName, csrf_token: obj.csrf_token };
      const response = await axios.post(url, data);
      if (response.success) {
        toast.success(`Sponsor changed successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        toggleChangeSponsorModal(); // close the modal
      } else {
        toast.error("Error updating record");
      }
    } catch (error) {
      toast.error("Error updating record");
    }
  };

  const handleAdminAdjustModalSubmit= async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;      
      const url = "/adminadjustment.php";
      const data = { id:CurrentID, adminid:uid, csrf_token: obj.csrf_token, amount: amount_type, amountflr: amountflr_type, notes: note_type };
      const response = await axios.post(url, data);
      if (response.success) {
        toast.success(`Admin Adjustment added successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        toggleAdminAdjustmentModal(); // close the modal
      } else {
        toast.error("Error updating record");
      }
    } catch (error) {
      toast.error("Error updating record");
    }
  };


  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  }; 

  // Function to handle amount input change
  const handleAmountChange = (event) => {
    setAmountType(event.target.value);
  };

  const handleAmountFlrChange = (event) => {
    setAmountFlrType(event.target.value);
  };

  // Function to handle notes input change
  const handleNotesChange = (event) => {
    setNoteType(event.target.value);
  };

  useEffect(() => {
    fetchRows(currentPage, pageSize,"");
  }, [currentPage]);

  const handleChangePasswordModalSubmit = async () => {

    if (!NewPassword || !ConfirmPassword) {
      setValidationError('Both fields are required');
      return;
    }
    if (NewPassword !== ConfirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj.id;

    try {
      const url = "/changepass2.php";
      const data = { id: CurrentID, newpwd: NewPassword, adminid: uid, fullname: CurrentName,csrf_token: obj.csrf_token };
      const response = await axios.post(url, data);
      if (response.success) {
        toast.success('Password changed successfully');
        toggleChangePasswordModal(); // close the modal
      } else {
        toast.error(response.message || 'Error updating password');
      }
    } catch (error) {
      toast.error('Error updating password');
    }

  };

  const resetCheckboxes = () => {
    setCheckedPlans([]);
  };

  const handlePlanPurchaseModalSubmit = async () => {
  
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;
      const url = "/updateplanpurchases.php";
      const data = { data: checkedPlans, user_id: CurrentID,  fullname: CurrentName , adminid: uid};
      console.log(data);
      const response = await axios.post(url, data);
      console.log(response);
      if (response.success) {
        toast.success(`Plan Purchases updated successfully`);
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
        togglePlanPurchaseModal(); // Close the modal
      } else {
        toast.error("Error updating record");
      }
      
    } catch (error) {
      console.error('Error updating plans:', error);
    }
  };


  useEffect(() => {
    fetchRows(currentPage, pageSize,"");
  }, [currentPage]);

  

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const loginasuser = (inputValue) => {
    // Open the loginasuser.js file in a new tab with the inputValue as a query parameter
    if (inputValue !== 1 && inputValue !== 2) {
      window.open(`/loginasuser?authUser=${encodeURIComponent(inputValue)}`, '_blank'); 
    }
  };


  const handleAction = async (action, id, fullname=null,sponsor=null) => {

    if (action=="deleted")
    {
      setCurrentID(id);
      setDeleteModal(true);

    } else if (action === "changesponsor") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      toggleChangeSponsorModal();      
    } else if (action === "changepassword") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      toggleChangePasswordModal();  
    } else if (action === "planpurchases") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      togglePlanPurchaseModal();    
    } else if (action === "adminadjustment") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      toggleAdminAdjustmentModal();            
    } else if (action === "login_as_user") {
        loginasuser(id);
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
            <BreadCrumb title="Manage Users" pageTitle="Dashboard" />
            <Row>
              <Col lg={12}>
                <Card id="customerList">
                  <CardHeader className="border-0">
                    <Row className="g-4">
                      <Col sm={8}>   <span className="table-caption">Manage Users</span></Col> 
                      <Col sm={4}>
                        <div className="d-flex">
                       
                        <AsyncSelect
                          cacheOptions
                          classNamePrefix="custom-select"
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
                            <option value="">Filter by Status</option>
                            <option value="active">Active</option>
                            <option value="deleted">Deleted</option>
                            <option value="blocked">Blocked</option>
                          </Input> 
                                    
                        </div>
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

                    <Modal isOpen={ChangeSponsormodal} toggle={toggleChangeSponsorModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={toggleChangeSponsorModal}>Change Sponsor of  {CurrentName}</ModalHeader>
                      <ModalBody>
                        <FormGroup>
                          <Label for="transactionID">Current Sponsor</Label>
                          <Input
                            type="text"
                            id="transactionID"
                            value= {CurrentSponsor}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="senderAddress">Change Sponsor To</Label>
                          <AsyncSelect
                            cacheOptions
                            loadOptions={fetchOptions}
                            onInputChange={handleInputChange}
                            onChange={handleChangeSponsor}
                            defaultOptions
                            value={selectedSponsor}
                            placeholder="Select a user"
                            styles={customStyles}
                          />  
                        </FormGroup>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleModalSubmit}>Update</Button>{' '}
                        <Button color="secondary" onClick={toggleChangeSponsorModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>  

                    <Modal isOpen={ChangePasswordmodal} toggle={toggleChangePasswordModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={toggleChangePasswordModal}>Change Password of  {CurrentName}</ModalHeader>
                      <ModalBody>
                      {validationError && <Alert color="danger">{validationError}</Alert>}
                        <FormGroup>
                          <Label for="newpassword">New Password</Label>
                          <Input
                            type="password"
                            id="NewPassword"
                            value= {NewPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="confirmpassword">Confirm Password</Label>
                          <Input
                            type="password"
                            id="ConfirmPassword"
                            value= {ConfirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </FormGroup>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleChangePasswordModalSubmit}>Update</Button>{' '}
                        <Button color="secondary" onClick={toggleChangePasswordModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>  

                    <Modal isOpen={ChangePlanPurchasemodal} toggle={togglePlanPurchaseModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={togglePlanPurchaseModal}>Purchased Plans of {CurrentName}</ModalHeader>

                      <ModalBody>
                        {validationError && <Alert color="danger">{validationError}</Alert>}
                        <Table>
                          <thead>
                            <tr>
                              <th>Plan</th>
                              <th>Status</th>
                              <th>Purchased</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plans.map(plan => (
                              <tr key={plan.id}>
                                <td>{plan.name}</td>
                                <td className={plan.is_taken ? 'text-danger' : 'text-success'}>
                                  {plan.is_taken ? 'Purchased' : 'Available'}
                                </td>
                                <td>
                                  <Input
                                    type="checkbox"
                                    id={`chkplan${plan.user_id}${plan.id}`}
                                    checked={!!checkedPlans[plan.id]}
                                    onChange={() => handleCheckboxChange(plan.id)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </ModalBody>

                      <ModalFooter>
                        <Button color="primary" onClick={handlePlanPurchaseModalSubmit}>Update</Button>{' '}
                        <Button color="secondary" onClick={togglePlanPurchaseModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>  

                    <Modal isOpen={AdminAdjustmentmodal} toggle={toggleAdminAdjustmentModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={toggleAdminAdjustmentModal}>Admin Adjustment for  {CurrentName}</ModalHeader>
                      <ModalBody>
                        <FormGroup>
                          <Label for="typeSelect">Choose Type</Label>
                          <Input
                            type="select"
                            id="typeSelect"
                            value={selectedType}
                            onChange={handleTypeChange} // Handle dropdown change
                          >
                            <option value="">Select a type</option>
                            <option value="adjustment">Admin Adjustment</option>
                            {/* <option value="commission">Commission</option>
                            <option value="coin_transfer">Coin Transfer</option>
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option> */}
                           
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Label for="amount">Amount (USD)</Label>
                          <Input
                            type="number"
                            id="amount_type"
                            value={amount_type}
                            onChange={handleAmountChange}
                            placeholder="Enter amount"
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="amount">Amount (FLR)</Label>
                          <Input
                            type="number"
                            id="amountflr_type"
                            value={amountflr_type}
                            onChange={handleAmountFlrChange}
                            placeholder="Enter Flr amount"
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="notes">Notes</Label>
                          <Input
                            type="textarea"
                            id="note_type"
                            value={note_type}
                            onChange={handleNotesChange}
                            placeholder="Enter any notes"
                          />
                        </FormGroup>                        
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleAdminAdjustModalSubmit}>Update</Button>{' '}
                        <Button color="secondary" onClick={toggleAdminAdjustmentModal}>Cancel</Button>
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
