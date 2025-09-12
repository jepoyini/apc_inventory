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
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input
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


import { useLocation } from 'react-router-dom';

const VoucherOrderHistory = () => {
  document.title = "Order History | APC Inventory";
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cancelId = queryParams.get('cancel');

// Inside the DepositList component
const handleNewPurchase = () => {
  const fetchData = async () => {
    try {
      navigate('/travelvoucher');
    } catch (error) {
     }
  }
  fetchData();

  
};

  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default page size
  const [accountInfo, setAccountInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRows(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchRows = async (page, limit) => {
    try {
      if (sessionStorage.getItem("authUser")) {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const url = '/getvoucherorders.php';
        const data = {
          id: uid,
          limit: limit,
          page: page,
          csrf_token: obj.csrf_token
        };
        const response = await axios.post(url, data);
        console.log(cancelId);  

        if (response.rows) {
          setRows(response.rows);
          setTotalPages(response.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

  const handleAction = async (action, accountinfo) => {

    if (action === "accountinfo") {
        setAccountInfo(accountinfo);
        setIsModalOpen(true);
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
        header: "FROM",
        accessorKey: "from",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            <div className="d-flex align-items-center">
              {cell.getValue()}
            </div>
          </>
        ),
      },
      {
        header: "PLAN",
        accessorKey: "plan",
        enableColumnFilter: false,
      },      

      {
        header: "AMOUNT",
        accessorKey: "amount",
        enableColumnFilter: false,
      },
      {
        header: "STATUS",
        accessorKey: "status",
        enableColumnFilter: false,
      }      
    ]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Points" pageTitle="Dashboard" />
        <Row>
          <Col lg={12}>
            <Card id="customerList">
              <CardHeader className="border-0">
                <Row className="g-4">
                  <Col sm={6}>   <h5 className="table-caption card-title mb-0 flex-grow-1">Points</h5></Col> 
                  <Col sm={6}>
                    <div className="col-auto text-sm-end">
                        {/* <button type="button" className="btn btn-soft-primary btn-newdeposit"  onClick={handleNewPurchase} ><i className="ri-add-circle-line align-middle me-1"></i>New Donation </button> */}
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

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)} centered>
        <ModalHeader className="bg-light p-3" toggle={() => setIsModalOpen(!isModalOpen)}>
          Account Info
        </ModalHeader>
        <ModalBody>
        {accountInfo ? (
      <>

          </>
    ) : (
      <p>Loading...</p>
    )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal> 

          </div>
        );
};

export default VoucherOrderHistory;
