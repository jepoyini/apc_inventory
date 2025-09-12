import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Container, Row, Col, CardHeader,
  Label, Input, Button, Form, FormGroup
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const TransferFund = () => {
  document.title = "Expense to Ewallet Transfer";

  const navigate = useNavigate();
  const [availableFunds, setAvailableFunds] = useState(0.00);
  const [amount, setAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const api = new APIClient();

  useEffect(() => {
    fetchAvailableFunds();
  }, []);

  const fetchAvailableFunds = async () => {
    try {
      const obj = JSON.parse(sessionStorage.getItem("authUser"));
      const uid = obj.id;

      const data = {
        uid: uid,
        csrf_token: obj.csrf_token
      };
      const response = await api.post("/checkbalance", data, { showLoader: true });
      if (response.status === "success") {
        setAvailableFunds(response.withdrawable_balance);
      }
    } catch (error) {
      console.error("Error fetching available funds", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Swal.fire("Invalid", "Please enter a valid amount.", "warning");
      return;
    }

    if (!recipientEmail) {
      Swal.fire("Invalid", "Please enter recipient's email.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: 'Submit Transfer?',
      text: "Please confirm that all details are correct.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, transfer',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      const user = JSON.parse(sessionStorage.getItem("authUser"));
      const data = {
        uid: user.id,
        amount: parseFloat(amount).toFixed(2),
        recipient_email: recipientEmail,
        notes: notes,
      };

      const response = await api.post("/transferfund", data, { showLoader: true });

        if (response.status === 'success') {
            Swal.fire({
            title: "Success",
            text: "Your fund transfer request has been submitted.",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Transfer Another",
            cancelButtonText: "Done",
            }).then((result) => {
            if (result.isConfirmed) {
                // Reset form inputs
                setAmount("");
                setRecipientEmail("");
                setNotes("");
            } else {
                navigate("/transactions");
            }
        });

      } else {
        Swal.fire("Failed", response.message || "Submission failed.", "error");
      }
    } catch (error) {
      console.error("Submit Error", error);
      Swal.fire("Error", "An error occurred while submitting your request.", "error");
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Expense to Ewallet Transfer" pageTitle="Wallet" />
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card>
                <CardHeader>
                  <div className="w-100 text-center">
                    <h4 className="card-title mb-0">Expense Account to Ewallet Transfer</h4>
                  </div>
                </CardHeader>
                <CardBody>
                  <br />
                  <div className="alert alert-info" role="alert">
                    <strong>Note:</strong> Please ensure the recipient’s id or username or email is accurate. All transfers are final once submitted.
                  </div>
                  <br />
                  <Form onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                      <Label>Available Funds</Label>
                      <Input type="text" value={`$${availableFunds}`} disabled />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount to transfer"
                      />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <Label>To</Label>
                        <Input
                            type="text"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="Enter the ID, username, or email of the recipient."
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                    <Label>Notes (Optional)</Label>
                    <Input
                        type="textarea"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes or purpose for this transfer..."
                    />
                    </FormGroup>
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        type="submit"
                        color="warning"
                        className="btn btn-soft-warning material-shadow-none"
                        style={{ maxWidth: '130px', width: '100%' }}
                      >
                        Submit
                      </Button>
                      <Button
                        type="button"
                        color="secondary"
                        className="btn btn-soft-secondary material-shadow-none"
                        style={{ maxWidth: '130px', width: '100%' }}
                        onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: "Your transfer request hasn't been submitted yet.",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, cancel',
                            cancelButtonText: 'No, stay',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              navigate("/transactions");
                            }
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TransferFund;
