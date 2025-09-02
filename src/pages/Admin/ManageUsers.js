import React, { useState, useEffect, useMemo, useRef } from "react";
import { Alert,  Table,  UncontrolledDropdown,  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardBody, Row, Col, Input, Card, Container, CardHeader,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Button
} from "reactstrap";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AsyncSelect from 'react-select/async';

import TableContainer from "../../Components/Common/TableContainerReactTable";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import { APIClient } from "../../helpers/api_helper";

const Allusers = () => {
  const api = new APIClient();
  document.title = "Manage Users";
  const lastScrollYRef = useRef(0);
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
  const [CurrentID, setCurrentID] = useState(0); 
  const [CurrentName, setCurrentName] = useState(''); 
  const [CurrentUsername, setCurrentUsername] = useState(''); 
  const [CurrentSponsor, setCurrentSponsor] = useState(''); 
  const [CurrentPlacementID, setPlacementID] = useState('');   
  const [CurrentPlacement, setPlacement] = useState('');   
  const [selectedType, setSelectedType] = useState('');   
  const [amount_type, setAmountType] = useState('');   
  const [amountflr_type, setAmountFlrType] = useState('');   
  const [note_type, setNoteType] = useState('');   
  const [FilterUserID, setFilterUserID] = useState(0); 
  
  const [ChangeAddDepositModal, setAddDepositModal] = useState(false);
  const [ChangeSponsormodal, setChangeSponsorModal] = useState(false);
  const [ChangeMatrixPlacementmodal, setChangeMatrixPlacementModal] = useState(false);
  
  const [ChangePasswordmodal, setChangePasswordModal] = useState(false);
  const [ChangePlanPurchasemodal, setPlanPurchaseModal] = useState(false);
  const [ChangeUsernamemodal, setChangeUsernamemodal] = useState(false);
  const [AdminAdjustmentmodal, setAdminAdjustmentModal] = useState(false);
  const [transactionID, setTransactionID] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [senderAddress, setSenderAddress] = useState('');
  const [plans, setPlans] = useState([]);

const [depositAmount, setDepositAmount] = useState('');
const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
const [depositNote, setDepositNote] = useState('');
const [depositType, setDepositType] = useState('other');
const [depositStatus, setDepositStatus] = useState('pending');
const [senderWallet, setSenderWallet] = useState('');
const [transactionHash, setTransactionHash] = useState('');

  const toggleModalWithScrollRestore = (modalState, setModalState) => {
    if (!modalState) {
      lastScrollYRef.current = window.scrollY;
    }
    setModalState(!modalState);
    setTimeout(() => {
      window.scrollTo(0, lastScrollYRef.current);
    }, 200);
  };

  const toggleChangeUsernameModal = () => toggleModalWithScrollRestore(ChangeUsernamemodal, setChangeUsernamemodal);

  const toggleChangeSponsorModal = () => toggleModalWithScrollRestore(ChangeSponsormodal, setChangeSponsorModal);

  const toggleChangeMatrixPlacementModal = () => toggleModalWithScrollRestore(ChangeMatrixPlacementmodal,setChangeMatrixPlacementModal);

  const toggleAddDepositModal = () =>  toggleModalWithScrollRestore( ChangeAddDepositModal,setAddDepositModal); 

  const toggleChangePasswordModal = () => {
    if (!ChangePasswordmodal) {
      lastScrollYRef.current = window.scrollY;
    }
    setChangePasswordModal(!ChangePasswordmodal);
    setNewPassword('');
    setConfirmPassword('');
    setValidationError('');
    setTimeout(() => {
      window.scrollTo(0, lastScrollYRef.current);
    }, 200);
  };
  const togglePlanPurchaseModal = () => {
    if (!ChangePlanPurchasemodal) {
      lastScrollYRef.current = window.scrollY;
    }
    setValidationError('');
    setPlanPurchaseModal(!ChangePlanPurchasemodal);
    setPlans([]);
    if (ChangePlanPurchasemodal) {
      resetCheckboxes();
    }
    setTimeout(() => {
      window.scrollTo(0, lastScrollYRef.current);
    }, 200);
  };
  const toggleAdminAdjustmentModal = () => {
    if (!AdminAdjustmentmodal) {
      lastScrollYRef.current = window.scrollY;
    }
    setAmountType('');
    setAmountFlrType('');
    setNoteType('');
    setSelectedType('');
    setValidationError('');
    setAdminAdjustmentModal(!AdminAdjustmentmodal);
    setTimeout(() => {
      window.scrollTo(0, lastScrollYRef.current);
    }, 200);
  };

  const [Username, setUsername] = useState('');
  const [NewUsername, setNewUsername] = useState('');
  const [NewPassword, setNewPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
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
              {cell.row.original.placement_id !== null && cell.row.original.placement_id !== 0 && (
                <DropdownItem
                  href="#"
                  onClick={() =>
                    handleAction(
                      "changematrixplacement",
                      cell.row.original.id,
                      cell.row.original.fullname,
                      cell.row.original.sponsor_name,
                      cell.row.original.username,
                      cell.row.original.placement_id,
                      cell.row.original.placement
                    )
                  }
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Change Matrix Placement
                </DropdownItem>
              )}             
              <DropdownItem
                href="#"
                onClick={() => handleAction("changeusername", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name,cell.row.original.username)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Change Username
              </DropdownItem>              
               <DropdownItem
                href="#"
                onClick={() => handleAction("changepassword", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Change Password
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => handleAction("changerank", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Change Rank
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => handleAction("adddeposit", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Add Deposit
              </DropdownItem>              
              <DropdownItem
                href="#"
                onClick={() => handleAction("adminadjustment", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Admin Adjustment
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => handleAction("compped", cell.row.original.id,cell.row.original.fullname,cell.row.original.sponsor_name)}
              >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Compped Donations
              </DropdownItem>
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
      } ,   
      
{
    header: "User Details",
    accessorKey: "fullname",
    enableColumnFilter: false,
    cell: (cell) => {
        const { id, email, sponsor_name, sponsor_id, placement } = cell.row.original;

        const handlePlacement = async (userId) => {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to place this user to the matrix?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, place user"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const obj = JSON.parse(sessionStorage.getItem("authUser"));
                        const url = '/matrixplacement';
                        const data = { id: userId, uid: obj.id };

                        const response = await api.post(url, data);

                        if (response.status == 'success') {
                          fetchRows(currentPage, pageSize, statusRef.current);    
                            Swal.fire(
                                "Success!",
                                "This user has been placed to the matrix successfully.",
                                "success"
                            );
                        } else {
                            Swal.fire(
                                "Error",
                                response.message || "Something went wrong while placing the user.",
                                "error"
                            );
                        }
                    } catch (error) {
                        Swal.fire(
                            "Error",
                            "Failed to place the user in the matrix.",
                            "error"
                        );
                        console.error(error);
                    }
                }
            });
        };

        return (
            <div>
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
                    onClick={() => loginasuser(id)}
                >
                    {cell.getValue()}
                </span>
                <small>{email}</small><br />
                <small>
                    <strong>Sponsor:</strong>{" "}
                    <span
                        className="link-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => loginasuser(sponsor_id)}
                    >
                        {sponsor_name}
                    </span>
                </small><br />
                { id !== 2 && (
                  <small>
                    <strong>Placement:</strong>{" "}
                    {placement ? (
                      placement
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        None
                        <button
                          className="btn btn-sm btn-outline-info"
                          style={{ paddingTop: '1px', paddingBottom: '1px', lineHeight: '.9' }}
                          onClick={() => handlePlacement(id)}
                        >
                          Place Now
                        </button>
                      </span>
                    )}
                  </small>
                )}
            </div>
        );
    },
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
            case 'holding':
              statusClass = 'badge bg-primary';              
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
        header: "Rank",
        isVisible: false, 
        accessorKey: "rank",
        enableColumnFilter: false,
        cell: (cell) => (
          <>

            {cell.getValue()}
          </>
        ),
      },   


      {
          header: "Logged Details",
          accessorKey: "register_ip_address",
          enableColumnFilter: false,
          cell: (cell) => (
              <small>
              <div>
                  <strong>Last Logged Date:</strong> {cell.row.original.logged_time}<br />
                  <strong>Last Logged IP:</strong> {cell.row.original.logged_ip}<br />
                  <strong>Last Logged Location:</strong> {cell.row.original.logged_location}<br />
                  <strong>Registered IP:</strong> {cell.row.original.register_ip_address}<br />
                  <strong>Registered Location:</strong> {cell.row.original.register_ip_location}<br />
                  <strong>Registered Date:</strong> {cell.row.original.date_created}
              </div>
              </small>
          ),
      },
    
     

           {
          header: "Balances",
          accessorKey: "total_amount",
          enableColumnFilter: false,
          cell: (cell) => (
              <div>
                <small>
                  <strong>Expense Total:</strong> {cell.row.original.total_amount} <br />
                  <strong>Ewallet Total:</strong> {cell.row.original.ewallet_total} <br />
                  <strong>Reward Total:</strong> {cell.row.original.reward_total}       <br />
                  <strong>Reward Cap:</strong> {cell.row.original.reward_cap}       <br />
                  <strong>Total Deposits:</strong> {cell.row.original.total_deposit}       <br />
                  <strong>Pending Withdrawal:</strong> {cell.row.original.pending_withdrawal}       <br />
                  <strong>Total Withdrawal:</strong> {cell.row.original.total_withdrawal}       <br />
                  </small>
              </div>

          ),
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
    
    

    ]
  );

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
  const [planStates, setPlanStates] = useState([]);

  //Donation Types
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));  
        const url = '/getdonations';
        const data = { id: CurrentID, uid: obj.id};
        console.log(data);
        const response = await api.post(url, data);        
        setPlans(response.rows);
        setPlanStates(response.rows);
      } catch (error) {
        setValidationError('Failed to fetch plans');
      }
    };
    fetchPlans();
  }, [CurrentID,ChangePlanPurchasemodal]);

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
        const response = await api.post(url, data,{showLoader:true});
        
        if (response.status==="success") {
          setRows(response.rows);
          setTotalPages(response.totalPages);
          setTotalRecords(response.rows.length);
          setLoading(false); 
          // Change pageSize if rows are less than 10
          if (response.rows.length < 10) {
             setPageSize(response.rows.length);
          }          
        // } else {
        //   window.location.href="/logout";
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
  const handleChangePlacement = (selected) => {
    setSelectedPlacement(selected);
    console.log('Selected placement:', selected);
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const userid = selectedOption['value']; 
    useridRef.current = userid; 
    fetchRows(currentPage, pageSize, statusRef.current);    
    console.log('Selected option:', selectedOption);
  };

  const handleRefresh = () => {
    window.location.reload();
    //fetchRows(1, 10, statusRef.current);    
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '250px',
      backgroundColor: "#262a2f", // "#061e39",
      borderColor: "#2a2f34", //"#061e39",
      color: "white",
      marginRight: 15
    }),
  };

const handleAddDepositSubmit = async () => {
  try {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj.id;
    const url = "/adddeposit";
    const data = {
      id: CurrentID,
      uid: uid,
      amount: depositAmount,
      date: depositDate,
      note: depositNote,
      type: depositType,
      status: depositStatus,
      sender_wallet: senderWallet,
      transaction_hash: transactionHash
    };

    const response = await api.post(url, data, { showLoader: true });
    if (response.status== 'success') {
      Swal.fire({
        title: "Success!",
        text: "Deposit record added successfully",
        icon: "success",
        confirmButtonText: "OK"
      }).then((result) => {
        if (result.isConfirmed) {
          fetchRows(currentPage, pageSize, statusRef.current); // refresh table
          toggleAddDepositModal(); // close modal
          setDepositAmount('');
          setDepositDate(new Date().toISOString().split('T')[0]);
          setDepositNote('');
          setDepositType('other');
          setDepositStatus('pending');
          setSenderWallet('');
          setTransactionHash('');
        }
      });
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    toast.error("Error adding deposit record");
  }
};



useEffect(() => {

  if (ChangeSponsormodal || ChangeAddDepositModal || ChangeUsernamemodal || ChangePasswordmodal || ChangeMatrixPlacementmodal || ChangePlanPurchasemodal || AdminAdjustmentmodal) {
    document.body.classList.add('modal-open');
  } else {
    document.body.classList.remove('modal-open');
  }
}, [ChangeSponsormodal, ChangeAddDepositModal, ChangeUsernamemodal, ChangePasswordmodal, ChangeMatrixPlacementmodal, ChangePlanPurchasemodal, AdminAdjustmentmodal]);


  const handleMatrixPlacementSubmit = async () => {
    try {

      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;      
      const sponsor_id = selectedPlacement.value; 
 
      const url = "/changematrixplacement";
      const data = { id:CurrentID, sponsor_id: sponsor_id,uid:uid,fullname: CurrentName};
      const response = await api.post(url, data,{showLoader:true});
      if (response.success) {

        Swal.fire({
          title: "Success!",
          text: "Matrix Placement changed successfully",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
            toggleChangeMatrixPlacementModal(); // close the modal
          }
        });

      } else {
        toast.error("Error updating record");
      }
    } catch (error) {
      toast.error("Error updating record");
    }
  };


  const handleModalSubmit = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;      
      const sponsor_id = selectedSponsor.value; 
      const url = "/changesponsor";
      const data = { id:CurrentID, sponsor_id: sponsor_id,uid:uid,fullname: CurrentName};
      const response = await api.post(url, data,{showLoader:true});
      if (response.success) {

        Swal.fire({
          title: "Success!",
          text: "Sponsor changed successfully",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
            toggleChangeSponsorModal(); // close the modal
          }
        });

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
      const url = "/adminadjustment";
      debugger; 
      const data = { id:CurrentID, uid:uid, amount: amount_type, notes: note_type, selectedtype: selectedType };
      const response = await api.post(url, data,{showLoader:true});
      if (response.success) {

        Swal.fire({
          title: "Success!",
          text: "Admin Adjustment added successfully",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
            toggleAdminAdjustmentModal(); // close the modal
          }
        });

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

  // Function to handle notes input change
  const handleNotesChange = (event) => {
    setNoteType(event.target.value);
  };


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
      const url = "/adminchangepass";
      const data = { id: CurrentID, newpwd: NewPassword, uid: uid, fullname: CurrentName };
      const response = await api.post(url, data,{showLoader:true});
      if (response.success) {
        Swal.fire({
          title: "Success!",
          text: "Password changed successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        toggleChangePasswordModal(); // close the modal
      } else {
        toast.error(response.message || 'Error updating password');
      }
    } catch (error) {
      toast.error('Error updating password');
    }

  };

  const handleUsernameModalSubmit = async () => {
    if (!NewUsername) {
      setValidationError('New Username is required');
      return;
    }

    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const uid = obj.id;
    try {
      const url = "/adminchangeusername";
      const data = { id: CurrentID, newusername: NewUsername, uid: uid };
      const response = await api.post(url, data,{showLoader:true});
      if (response.success) {
        Swal.fire({
          title: "Success!",
          text: "Username changed successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        toggleChangeUsernameModal(); // close the modal
        fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
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
      const url = "/updatedonationpurchases";
      const data = { uid: uid, data: checkedPlans, user_id: CurrentID,  fullname: CurrentName };
      console.log(data);
      const response = await api.post(url, data,{showLoader:true});
      console.log(response);
      if (response.status == "success") {
        Swal.fire({
          title: "Success!",
          text: "Donations compped successfully",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            fetchRows(currentPage, pageSize, statusRef.current); // refresh the table
            togglePlanPurchaseModal(); // Close the modal
          }
        });
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

      window.open(`/dashboard/loginasuser?authUser=${encodeURIComponent(inputValue)}`, '_blank'); 
    }
  };

const chooseRank = async (user_id) => {
  const lastScrollY = window.scrollY; // Capture scroll position

  const { value: accountType } = await Swal.fire({
    title: '<strong>Change User Rank</strong>',
    html: 'Please choose one of the account types below:',
    icon: 'question',
    input: 'select',
    inputOptions: {
      pioneer: 'Pioneer',
      partner: 'Partner',
      partner_1k: 'Partner 1K',
      partner_5k: 'Partner 5K',
      partner_10k: 'Partner 10K',
      partner_20k: 'Partner 20K',
      partner_50k: 'Partner 50K',
      ambassador: 'Ambassador',
      ambassador_100k: 'Ambassador 100K',
      ambassador_200k: 'Ambassador 200K',
      ambassador_500k: 'Ambassador 500K',
      humanitarian: 'Humanitarian',
      humanitarian_1m: 'Humanitarian 1M',      
      humanitarian_2m: 'Humanitarian 2M',
      humanitarian_5m: 'Humanitarian 5M',
    },
    inputPlaceholder: 'Select an account type',
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'animated fadeInDown faster',
    },
    backdrop: true,
    willOpen: () => {
      // Optional: explicitly set scroll here too
      window.scrollTo(0, lastScrollY);
    },
    didOpen: () => {
      // Ensure scroll gets restored even if browser scrolls on focus
      setTimeout(() => {
        window.scrollTo(0, lastScrollY);
      }, 100);
    }
  });

  // Restore scroll after alert closes
  setTimeout(() => {
    window.scrollTo(0, lastScrollY);
  }, 150);

  if (accountType) {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;
      const url = "/changerank";
      const data = { id: user_id, uid: uid, rank: accountType };
      const response = await api.post(url, data, { showLoader: true });

      if (response.success) {
        Swal.fire({
          title: "Success!",
          text: "User Rank changed successfully",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            fetchRows(currentPage, pageSize, statusRef.current);
          }
        });
      } else {
        toast.error("Error updating record");
      }
    } catch (error) {
      toast.error("Error updating record");
    }
  }
};


  const handleAction = async (action, id, fullname=null,sponsor=null,username=null,placement_id=null,placement=null) => {

    if (action=="deleted")
    {
      setCurrentID(id);
      setDeleteModal(true);
    } else if (action === "adddeposit") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      toggleAddDepositModal(); 
    } else if (action === "changerank") {
      setCurrentID(id);
      chooseRank(id)
    } else if (action === "changesponsor") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      toggleChangeSponsorModal();      
    } else if (action === "changematrixplacement") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);    
      setPlacementID(placement_id);
      setPlacement(placement);
      toggleChangeMatrixPlacementModal();      
    } else if (action === "changeusername") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);    
      setCurrentUsername(username);
      setUsername(username);
      toggleChangeUsernameModal();            
    } else if (action === "changepassword") {
      setCurrentID(id);
      setCurrentName(fullname);      
      setCurrentSponsor(sponsor);      
      toggleChangePasswordModal();  
    } else if (action === "compped") {
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
      
      const url = "/deleteuser";
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const data = { id: CurrentID,uid: obj.id };
      const response = await api.post(url, data,{showLoader:true});
      if (response.success) {

        Swal.fire({
          title: "Success!",
          text: "Row Deleted successfully",
          icon: "success",
          confirmButtonText: "OK"
        }).then((result) => {
          if (result.isConfirmed) {
            fetchRows(currentPage, pageSize, statusRef.current); 
          }
        });
       
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
      </Container>
    ) : (
      <Container fluid>
        <BreadCrumb title="Manage Users" pageTitle="Dashboard" />
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
                        placeholder="Select any user"
                        styles={customStyles}
                      />
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
                  <Col md={2}>
                    <select className="form-select" value={pageSizeOption} onChange={handlePageSizeChange}>
                      {[10, 20, 30, 50].map((size) => (
                        <option key={size} value={size}>{size} rows</option>
                      ))}
                      <option value="all">All Rows</option>
                    </select>
                  </Col>

                  <Col md={2}>
                      <Button className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250" onClick={() => handleRefresh()}>
                        Refresh
                      </Button>
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
                  totalPages={totalPages}
                  isGlobalFilter={true}
                  className="custom-header-css"
                  theadClass="table-light"
                  divClass="table-responsive table-card mb-3"
                  tableClass="align-middle table-nowrap"
                  handlePageClick={handlePageChange}
                  isExtraFeature={true}
                  isAddOptions={false}
                  SearchPlaceholder='Search for user, status or something...'
                />

                    <Modal isOpen={ChangeUsernamemodal} toggle={toggleChangeUsernameModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={toggleChangeUsernameModal}>Change Username of  {CurrentName}</ModalHeader>
                      <ModalBody>
                        <FormGroup>
                          <Label for="transactionID">Current Username</Label>
                          <Input
                            type="text"
                            id="currentusername"
                            value= {Username}
                          />

                        </FormGroup>
                        <FormGroup>
                          <Label for="senderAddress">Change Username To</Label>
                          <Input
                            type="text"
                            id="newusername"
                            value= {NewUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                          />
                        </FormGroup>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleUsernameModalSubmit}>Update</Button>{' '}
                        <Button color="secondary" onClick={toggleChangeUsernameModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>  

                    <Modal isOpen={ChangeAddDepositModal} toggle={toggleAddDepositModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={toggleAddDepositModal}>
                        Add Deposit to {CurrentName}
                      </ModalHeader>
                      <ModalBody>
                        <FormGroup>
                          <Label for="currentUser">Current User</Label>
                          <Input
                            type="text"
                            id="currentUser"
                            value={CurrentName}
                            readOnly
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="depositAmount">Amount</Label>
                          <Input
                            type="number"
                            id="depositAmount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Enter amount"
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="depositDate">Date</Label>
                          <Input
                            type="date"
                            id="depositDate"
                            value={depositDate}
                            onChange={(e) => setDepositDate(e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="depositType">Type</Label>
                          <Input
                            type="select"
                            id="depositType"
                            value={depositType}
                            onChange={(e) => setDepositType(e.target.value)}
                          >
                            <option value="other">Other</option>
                            <option value="usdt">USDT - Polygon</option>
                            <option value="usdt-bep20">USDT - BEP20</option>
                          </Input>
                        </FormGroup>

                        <FormGroup>
                          <Label for="depositStatus">Status</Label>
                          <Input
                            type="select"
                            id="depositStatus"
                            value={depositStatus}
                            onChange={(e) => setDepositStatus(e.target.value)}
                          >
                            <option value="pending">pending</option>
                            <option value="success">success</option>
                          </Input>
                        </FormGroup>

                        <FormGroup>
                          <Label for="senderWallet">Sender Wallet Address</Label>
                          <Input
                            type="text"
                            id="senderWallet"
                            value={senderWallet}
                            onChange={(e) => setSenderWallet(e.target.value)}
                            placeholder="Enter sender wallet (optional)"
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="transactionHash">Transaction Hash</Label>
                          <Input
                            type="text"
                            id="transactionHash"
                            value={transactionHash}
                            onChange={(e) => setTransactionHash(e.target.value)}
                            placeholder="Enter transaction hash (optional)"
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="depositNote">Note</Label>
                          <Input
                            type="text"
                            id="depositNote"
                            value={depositNote}
                            onChange={(e) => setDepositNote(e.target.value)}
                            placeholder="Enter note"
                          />
                        </FormGroup>

                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleAddDepositSubmit}>Submit</Button>{' '}
                        <Button color="secondary" onClick={toggleAddDepositModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>

                    <Modal isOpen={ChangeMatrixPlacementmodal} toggle={toggleChangeMatrixPlacementModal} centered>
                      <ModalHeader className="bg-light p-3" toggle={toggleChangeMatrixPlacementModal}>Change Matrix Placement of  {CurrentName}</ModalHeader>
                      <ModalBody>
                        
                        <FormGroup>
                          <Label for="transactionID">Current Matrix Placement</Label>
                          <Input
                            type="text"
                            id="transactionID"
                            value= {CurrentPlacement}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label for="senderAddress">Change To</Label>
                          <AsyncSelect
                            cacheOptions
                            loadOptions={fetchOptions}
                            onInputChange={handleInputChange}
                            onChange={handleChangePlacement}
                            defaultOptions
                            value={selectedPlacement}
                            placeholder="Select a user"
                            styles={customStyles}
                          />  
                        </FormGroup>
                         <h7>Note: Make sure the selected user still has an available slot in their matrix first level.</h7>
                      </ModalBody>
                      <ModalFooter>
                       
                        <Button color="primary" onClick={handleMatrixPlacementSubmit}>Submit</Button>{' '}
                        <Button color="secondary" onClick={toggleChangeMatrixPlacementModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>  


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
                      <ModalHeader className="bg-light p-3" toggle={togglePlanPurchaseModal}>Compped Donations for {CurrentName}</ModalHeader>

                      <ModalBody>
                        {validationError && <Alert color="danger">{validationError}</Alert>}
                        <Table>
                          <thead>
                            <tr>
                              <th>Donation Type</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Purchased</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plans.map(plan => (
                              <tr key={plan.id}>
                                <td>{plan.plan_type}{' - Level '}{plan.level}</td>
                                <td>{plan.amount}</td>
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
                            <option value="adjustment">Expense Account</option>
                            <option value="ewallet">E-wallet</option>
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

export default Allusers;
