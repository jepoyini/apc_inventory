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


const DonationOrderHistory = () => {
  document.title = "Order History | APC Inventory";
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
      text: 'Please wait while we load your orders.',
      allowOutsideClick: false,
      didOpen: () => {
          Swal.showLoading();
      }
      });

      const response = await api.post("/orderhistory", payload);

      // Close the modal after loading
      Swal.close();          

      if (response && response.success && Array.isArray(response.orders)) {
        setRows(response.orders);
        setFilteredRows(response.orders); // apply filter immediately
        const total = response.totalRecords || response.orders.length;
        setTotalPages(Math.ceil(total / limit));
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

  const columns = useMemo(() => [
    {
      header: <input type="checkbox" id="checkBoxAll" className="form-check-input" onClick={() => checkedAll()} />,
      cell: (cell) => (
        <input
          type="checkbox"
          className="invoiceCheckBox form-check-input"
          value={cell.getValue()}
          onChange={() => deleteCheckbox()}
        />
      ),
      id: '#',
      accessorKey: "id",
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: "ID",
      accessorKey: "id",
      enableColumnFilter: false,
      cell: (cell) => (
        <Link to="#" className="fw-medium link-primary">
          {cell.getValue()}
        </Link>
      ),
    },
    {
      header: "DATE",
      accessorKey: "created_at",
      enableColumnFilter: false,
      cell: (cell) => new Date(cell.getValue()).toLocaleString(),
    },    
    {
      header: "DESCRIPTION",
      accessorKey: "title", // can still keep it for data tracking
      enableColumnFilter: false,
      cell: (cell) => {
        const row = cell.row.original;
        const formattedType = row.plan_type.charAt(0).toUpperCase() + row.plan_type.slice(1).toLowerCase();
        return `Sharing ${formattedType} Donation Level ${row.plan_id}`;
      },
    },
    {
      header: "AMOUNT",
      accessorKey: "amount",
      enableColumnFilter: false,
      cell: (cell) => `$${parseFloat(cell.getValue()).toFixed(2)}`,
    },
    {
      header: "STATUS",
      accessorKey: "status",
      enableColumnFilter: false,
      cell: (cell) => {
        const status = cell.getValue();
        const isComplete = status.toLowerCase() === 'completed';
        return (
          <span className={`badge bg-${isComplete ? 'success' : 'danger'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },

  ], [checkedAll]);

  const handleNewDonation = () => {
    navigate("/sharingdonations/university");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Order History" pageTitle="Dashboard" url="/dashboard" />
        <Row>
          <Col lg={12}>
            <Card id="donationHistoryList">
              <CardHeader className="">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Order History</h5>
                  <div className="flex-shrink-0">
                    <div className='d-flex gap-2 flex-wrap'>
                      {isMultiDeleteButton && <button className="btn btn-danger"
                        onClick={() => setDeleteModalMulti(true)}
                      ><i className="ri-delete-bin-2-line"></i></button>}
                    </div>
                  </div>
                  <Button type="button" className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250" onClick={handleNewDonation}>
                      <i className="ri-add-circle-line align-middle me-1"></i> New Donation
                    </Button>                
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
                        isAddUserList={false}
                        totalPages={totalPages}
                        // isGlobalFilter={true}
                        className="custom-header-css"
                        theadClass="table-light "
                        divClass="table-responsive table-card mb-3"
                        tableClass="align-middle table-nowrap"
                        handlePageClick={handlePageChange}
                        isExtraFeature={true}
                        isAddOptions={false}
                        // SearchPlaceholder='Search for user, status or something...'
                      />

                {/* <TableContainer
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
                /> */}
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
