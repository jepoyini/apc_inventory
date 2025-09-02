import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Container, Row, Col,CardHeader,
  Label, Input, Button, Form, FormGroup
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { APIClient } from "../../helpers/api_helper";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Withdraw = () => {
  document.title = "Withdraw | SHARING University";

  const navigate = useNavigate();
  const [availableFunds, setAvailableFunds] = useState(0.00);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usdt");
  const [address, setAddress] = useState("");

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
          const response = await api.post("/checkbalance", data,{showLoader:true});
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

  if (!address) {
    Swal.fire("Invalid", "Please enter your wallet address.", "warning");
    return;
  }

  const confirm = await Swal.fire({
    title: 'Submit Withdrawal?',
    text: "Please confirm that all details are correct.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, submit',
    cancelButtonText: 'Cancel'
  });

  if (!confirm.isConfirmed) return;

  try {
    const user = JSON.parse(sessionStorage.getItem("authUser"));
    const data = {
      uid: user.id,
      amount: parseFloat(amount).toFixed(2),
      currency,
      address,
    };

    const response = await api.post("/requestwithdraw", data, { showLoader: true });

    if (response.status == 'success') {
      Swal.fire("Success", "Your withdrawal request has been submitted.", "success");
      navigate("/withdrawhistory");
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
          <BreadCrumb title="Withdraw Funds" pageTitle="Wallet" />
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card>
                <CardHeader>
                <div className="w-100 text-center">
                    <h4 className="card-title mb-0">Funds Withdrawal Request</h4>
                </div>
                </CardHeader>
                <CardBody>
                  <br></br>

                    <div className="alert alert-primary" role="alert">
                    <strong>Note:</strong> For security purposes, all withdrawal requests must be verified. Once your request is confirmed as valid, the funds will be transferred promptly. We appreciate your patience during this verification process.
                    </div>
<br></br>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                      <Label>Available Funds</Label>
                      <Input type="text" value={`$${availableFunds}`} disabled />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <Label>Currency</Label>
                      <Input
                        type="select"
                        value={currency}
                        disabled
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="usdt">USDT</option>
                        {/* <option value="usdt-bep20">USDT-BEP20</option> */}
                      </Input>
                    </FormGroup>                    
                    <FormGroup className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </FormGroup>

                    <FormGroup className="mb-4">
                      <Label>Sharing Financial Email</Label>
                      <Input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your sharing financial email"
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
                            text: "Your withdrawal request hasn't been submitted yet.",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, cancel',
                            cancelButtonText: 'No, stay',
                            }).then((result) => {
                            if (result.isConfirmed) {
                                navigate("/withdrawhistory");
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

export default Withdraw;
