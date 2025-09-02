import React, { useState, useEffect, useMemo, useRef } from "react";
import {
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

const DepositList = () => {
  const api = new APIClient();
  document.title = "Admin - All Users";

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [authID, setAuthID] = useState(0);
  const statusRef = useRef("");
  const useridRef = useRef("");

  const [mainTable, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(0);

  const [currentID, setCurrentID] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [currentSponsor, setCurrentSponsor] = useState('');
  const [changeSponsorModal, setChangeSponsorModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleChangeSponsorModal = () => setChangeSponsorModal(!changeSponsorModal);

  const fetchRows = async (page, limit, status) => {
    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const response = await api.post('/getholdingtank', {
        uid: authUser.id,
        limit,
        page,
        status,
        userid: useridRef.current,
      }, { showLoader: true });

      if (response.status === "success") {
        setRows(response.rows);
        setTotalPages(response.totalPages);
        setLoading(false);
        if (response.rows.length < 10) setPageSize(response.rows.length);
      } else {
        window.location.href = "/logout";
      }
    } catch (error) {
      console.error('Error fetching rows:', error);
    }
  };

  const fetchOptions = async (inputValue) => {
    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const response = await api.post('/getallusersdropdown', {
        search: inputValue,
        uid: authUser.id,
      });

      const options = response.rows.map(user => ({
        value: user.id,
        label: user.full_name,
      }));

      options.unshift({ value: '', label: 'Filter by User' });
      return options;
    } catch (error) {
      console.error('Error fetching options:', error);
      return [];
    }
  };

  const handleChangeSponsor = (selected) => {
    setSelectedSponsor(selected);
  };

  const handleModalSubmit = async () => {
    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      //const sponsor_id = selectedSponsor?.value || null;
      const sponsor_id = selectedSponsor || null;
      
      const response = await api.post("/changecodedsponsor", {
        id: currentID,
        sponsor_id,
        uid: authUser.id,
        fullname: currentName,
      }, { showLoader: true });

      if (response.success) {
        Swal.fire("Success!", "Coded Sponsor changed successfully", "success").then(() => {
          fetchRows(currentPage, pageSize, statusRef.current);
          toggleChangeSponsorModal();
        });
      } else {
        Swal.fire("Error!", response.message, "error");
      }
    } catch {
      toast.error("Error updating record");
    }
  };

  const handleDeleteRow = async (id) => {
    try {
      const authUser = JSON.parse(sessionStorage.getItem("authUser"));
      const response = await api.post("/deleteuser", { id, uid: authUser.id }, { showLoader: true });

      if (response.success) {
        Swal.fire("Success!", "User deleted successfully", "success").then(() => {
          fetchRows(currentPage, pageSize, statusRef.current);
        });
      } else {
        toast.error("Error deleting user.");
      }
    } catch {
      toast.error("Error deleting user.");
    }
    setDeleteModal(false);
  };

  const confirmDelete = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) handleDeleteRow(userId);
    });
  };

  const columns = useMemo(() => [
    {
      header: "ID",
      accessorKey: "id",
      enableColumnFilter: false,
    },
    {
      header: "Action",
      cell: (cell) => (
        <div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentID(cell.row.original.id);
              setCurrentName(cell.row.original.username);
              setCurrentSponsor(cell.row.original.sponsor_name);
              toggleChangeSponsorModal();
            }}
            style={{ marginRight: "10px", color: "green", textDecoration: "underline", cursor: "pointer" }}
          >
            Accept
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              confirmDelete(cell.row.original.id);
            }}
            style={{ color: "red", textDecoration: "underline", cursor: "pointer" }}
          >
            Delete
          </a>
        </div>
      )
    },
    {
      header: "User",
      accessorKey: "fullname",
      enableColumnFilter: false,
    },
    {
      header: "Sponsor",
      accessorKey: "sponsor_name",
      enableColumnFilter: false,
    },
    {
      header: "Email",
      accessorKey: "email",
      enableColumnFilter: false,
    },
    {
      header: "IP Address",
      accessorKey: "register_ip_address",
      enableColumnFilter: false,
    },
    {
      header: "Location",
      accessorKey: "register_ip_location",
      enableColumnFilter: false,
    }
  ], []);

  useEffect(() => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("authUser"));
      if (!auth?.is_admin) return navigate('/logout');
      setAuthID(auth.id);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  }, []);

  useEffect(() => {
    fetchRows(currentPage, pageSize, "");
  }, [currentPage]);

  return (
    <div className="page-content">
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteRow}
        onCloseClick={() => setDeleteModal(false)}
      />

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
          <BreadCrumb title="Holding Tank" pageTitle="Dashboard" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Holding Tank</h5>
                </CardHeader>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={mainTable}
                    customPageSize={pageSize}
                    maxLength={totalPages}
                    currentPage={currentPage}
                    handlePageClick={setCurrentPage}
                    isGlobalFilter={false}
                    className="custom-header-css"
                    theadClass="table-light"
                    divClass="table-responsive table-card mb-3"
                    tableClass="align-middle table-nowrap"
                  />
                  <Modal isOpen={changeSponsorModal} toggle={toggleChangeSponsorModal} centered>
                    <ModalHeader toggle={toggleChangeSponsorModal}>
                      Accept user: {currentName}
                    </ModalHeader>
                    <ModalBody>
                      <FormGroup>
                        <Label>Current Sponsor</Label>
                        <Input type="text" value={currentSponsor} disabled />
                      </FormGroup>
                      <FormGroup>
                        <Label>Change Placement To</Label>
                        <Input
                          type="text"
                          value={selectedSponsor}
                          onChange={(e) => setSelectedSponsor(e.target.value)}
                          placeholder="Enter the ID, username, or email of the recipient."
                        />                        
                        {/* <AsyncSelect
                          cacheOptions
                          loadOptions={fetchOptions}
                          onChange={handleChangeSponsor}
                          defaultOptions
                          value={selectedSponsor}
                          placeholder="Type to search"
                        /> */}
                      </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" onClick={handleModalSubmit}>Submit</Button>
                      <Button color="secondary" onClick={toggleChangeSponsorModal}>Cancel</Button>
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
