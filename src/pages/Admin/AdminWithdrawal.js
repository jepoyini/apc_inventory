import React, { useState, useEffect,useRef } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardBody, Col, Container, Row, Label, Input, Button } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Spinner } from 'reactstrap';

const Withdrawal = () => {

    document.title = "Admin Withdrawal | BDM";
    const maxAmount = 10000;
    const [uid, setUid] = useState("");
    const [fromUser, setFromUser] = useState("");    
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("");
    const [destination, setDestination] = useState("");
    const [destinationuserid, setDestinationUserID] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [walletBalance, setWalletBalance] = useState();
    const [availableToWithdraw, setAvailableToWithdraw] = useState();
    const [conversionRate, setConversionRate] = useState(null);
    const [flarecoinAmount, setFlarecoinAmount] = useState(null);
    const [searchParams] = useSearchParams(); // Use this hook to get query parameters
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);     
    const [walletloading, setWalletLoading] = useState(true);
    const iframeRef = useRef(null);
    const [showIframe, setShowIframe] = useState(false); // State to toggle iframe visibility
    const [iframeSrc, setIframeSrc] = useState(""); // State to manage iframe src
    const [nextloading, setNextLoading] = useState(false); 

    const [message, setMessage] = useState("");
    const [error2FA, setError2FA] = useState("");
    const [modal, setModal] = useState(false);
    const [twoFACode, setTwoFACode] = useState(""); // State to hold the 2FA code
    const [email, setEmail] = useState(""); // State to hold the 2FA code
    const toggleModal = () => setModal(!modal);
    const [isprocessing, setIsProcessing] = useState(false);
    const [g2amodal, setg2aModal] = useState(false);
    const [g2aenabled, setg2aEnabled] = useState(false);    

    const reloadIframe = () => {
        if (iframeRef.current) {
          // Force reload by setting the src attribute to the same URL
          iframeRef.current.src = iframeRef.current.src;
        }
      };
    const handleIframeLoad = () => {
         setWalletLoading(false); 
    };
    const handlegtaSubmit = () => {
        const digit1 =  getInputElement(1).value;
        const digit2 =  getInputElement(2).value;
        const digit3 =  getInputElement(3).value;
        const digit4 =  getInputElement(4).value;
        const digit5 =  getInputElement(5).value;
        const digit6 =  getInputElement(6).value;
        const twofa = digit1+digit2+digit3+digit4+digit5+digit6;

        setTwoFACode(twofa);

        if (twofa.trim() === "") {
            setError2FA("Please enter the 2FA code.");
            return;
        }

        // Include 2FA code in the transfer request
        ProcessWithdraw(twofa);


        
      //  toggleModal(); // Close the modal after submitting the code
    };

    const toggleg2aModal = () => {
 
        if (g2amodal) {
          setNextLoading(false); 
        }
        setg2aModal(!g2amodal);
      };

      
    const handle2faEmailSend = (e) => {

            e.preventDefault(); // Prevent the default link behavior

            toggleg2aModal();
            setg2aEnabled(false);

            const obj = JSON.parse(sessionStorage.getItem("authUser")); 
            const uid = obj.id;    
            const csrf_token = sessionStorage.getItem("csrf_token");
            const formData = new FormData();
            formData.append("from_user", uid);
            formData.append("csrf_token", csrf_token);
            setMessage("");
            setError("");
            setError2FA("");
            axios.post("/generate2FA.php", formData)
                .then(response => {
                    if (response.status === "success") {
                        setError("");
                        toggleModal(); // Show the modal for entering the 2FA code

                    } else {
                        if (response.message && response.message.includes("Failed Validation")) {
                            navigate('/logout');
                        } else {
                            Swal.fire({
                                title: "Error!",
                                text: "Failed to send 2FA. " + response.message,
                                icon: "error",
                                confirmButtonText: "OK",
                            });
                        }  
                    }
            })
                .catch(error => {
                    console.log(error);

                    const errorMessage = error.response ? error.response.message : "An error occurred. Please try again.";
                    Swal.fire({
                        title: "Error!",
                        text: errorMessage,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                });


            // Show the 2FA modal
            setModal(true);


    };
    useEffect(() => {
        checkg2a();        
        //Getwalletbalance();
        setLoading(false);
    }, []);
    const checkg2a = async () => {
        try {
          setg2aEnabled(false);  
        //   const obj = JSON.parse(sessionStorage.getItem("authUser"));      
        //   const url = '/checkg2a.php';
        //   const data = {id:obj.id,csrf_token: obj.csrf_token };
        //   const response = await axios.post(url, data);

        //   if (response.value==="0") {
        //     setg2aEnabled(false);    
        //   } else {
        //     setg2aEnabled(true);    
        //   }

        } catch (error) {
          console.error('Error fetching data:', error);
        }
    };


    function Getwalletbalance() {

        // Fetch wallet balance and available amount to withdraw from the server
        const fetchWalletData = async () => {
            try {

                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                const uname = obj.firstname + ' ' + obj.lastname;
                const email = obj.email;
        
                setFromUser(uname);
                setEmail(email);
        
                const data = {
                    userid: destinationuserid,
                    csrf_token: obj.csrf_token
                  };       
         
                const response = await axios.post(`/wallet_balancead.php`,data);
    
                if (response.status === "success") {
                    if (!response.address) {
                        Swal.fire({
                            title: "No Wallet Address",
                            text: "For security reasons, the destination address cannot be entered manually. You must first complete a successful deposit from your wallet, and the address used for that deposit will automatically be set as your destination address for withdrawals.",
                            icon: "error",
                            confirmButtonText: "OK",
                        }).then((result) => {
                            navigate('/withdrawlist');
                        }); 

                        return;                         
                    }
                    setDestination(response.address);
                    setWalletBalance(response.walletbalance);
                    setAvailableToWithdraw(response.availabletowithdraw);
                    setLoading(false);
                   
                } else if (response.message && response.message.includes("Failed Validation")) {
                    navigate('/logout');
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to fetch wallet data. " + response.data.message,
                        icon: "error",
                        confirmButtonText: "OK",
                    }).then((result) => {
                            navigate('/withdrawlist');
                    }); 
                    return;                    
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text:  "An error occurred while fetching wallet data. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                }).then((result) => {

                        navigate('/withdrawlist');
                }); 
                return;  
            }
        };

        fetchWalletData();
    }

    const handleResendClick = (e) => {
        e.preventDefault(); // Prevent the default link behavior


        const csrf_token = sessionStorage.getItem("csrf_token");
        const formData = new FormData();
        formData.append("from_user", uid);
        formData.append("csrf_token", csrf_token);
        setMessage("");
        setError("");
        setError2FA("");
        axios.post("/generate2FA.php", formData)
            .then(response => {

                if (response.status === "success") {
                    Swal.fire({
                        title: "Success!",
                        text: "Email has been resent.",
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                } else {
                    if (response.message && response.message.includes("Failed Validation")) {
                        navigate('/logout');
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to send 2FA. " + response.message,
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }  
                }
            })
            .catch(error => {
      
                console.log(error);

                const errorMessage = error.response ? error.response.message : "An error occurred. Please try again.";
                Swal.fire({
                    title: "Error!",
                    text: errorMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            });
        };



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (sessionStorage.getItem("authUser")) {

                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = destinationuserid;
                const url = '/checkwithdrawal.php';
                const data = { uid: uid };

                setIsLoading(true); 
                const response = await axios.post(url, data);

                // if (response.pendings !== 0) {
                //   Swal.fire({
                //     icon: 'warning', // Exclamation icon
                //     title: 'New withdrawal not allowed!',
                //     text: 'You have a pending withdrawal. For security reasons, you cannot initiate a new withdrawal until the pending one is completed or canceled. Please contact support if you want to cancel a pending withdrawal.',
                //     confirmButtonText: 'OK',
                //     customClass: {
                //         confirmButton: 'custom-width-button'
                //     }
                //   });
                //   //setNextLoading(false);
                //   setIsLoading(false); 
                //   return;
                // } 

                // const totaldaily = parseFloat(response.daily) + parseFloat(amount); 
                // if (totaldaily > maxAmount) {
                //     Swal.fire({
                //       icon: 'warning', // Exclamation icon
                //       title: 'New withdrawal not allowed!',
                //       text: 'You exceeded the allowed daily withdrawal limit. Please try again after 24 hours.',
                //       confirmButtonText: 'OK',
                //       customClass: {
                //           confirmButton: 'custom-width-button'
                //       }
                //     });
                //     //setNextLoading(false);
                //     setIsLoading(false); 
                //     return;
                //   }
            }
        } catch (error) {
        }  

        setIsLoading(true); 

        // Validate input
        if (!amount) {
            setError("Please enter amount to withdraw.");
            setIsLoading(false); 
            return;
        }

        // Max
        // const obj = JSON.parse(sessionStorage.getItem("authUser"));
         const uid = destinationuserid;  
        // debugger;       
        // if (maxAmount < amount && uid !== "5" && uid !== "42") {
        //     Swal.fire({
        //         title: "Error!",
        //         text: "The entered amount exceeds the available amount to withdraw. Your current withdrawable amount is " + maxAmount + "USD.",
        //         icon: "error",
        //         confirmButtonText: "OK",
        //     });
        //     setIsLoading(false); 
        //     return;
        // }

        const amountFloat = parseFloat(amount);
        const availableToWithdrawFloat = parseFloat(availableToWithdraw);
        // if (amountFloat > availableToWithdrawFloat) {
        //     Swal.fire({
        //         title: "Error!",
        //         text: "The entered amount exceeds the available amount to withdraw.",
        //         icon: "error",
        //         confirmButtonText: "OK",
        //     });
        //     setIsLoading(false);
        //     return;
        // }

    //    setNextLoading(true);

        Swal.fire({
            title: 'Are you sure you want to proceed?',
            text: "Please confirm if you want to continue with the fund transfer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
                if (result.isConfirmed) {
                    toggleModal(); 
                    // if (g2aenabled) {
                    //     toggleg2aModal();
                    // } else {
                        //     const csrf_token = sessionStorage.getItem("csrf_token");
                        //     const formData = new FormData();
                        //     formData.append("from_user", uid);
                        //     formData.append("csrf_token", csrf_token);
                        //     setMessage("");
                        //     setError("");
                        //     setError2FA("");
                        //     axios.post("/generate2FA.php", formData)
                        //         .then(response => {
                        //             if (response.status === "success") {
                        //                 setError("");
                        //                 toggleModal(); // Show the modal for entering the 2FA code

                        //             } else {
                        //                 if (response.message && response.message.includes("Failed Validation")) {
                        //                     navigate('/logout');
                        //                 } else {
                        //                     Swal.fire({
                        //                         title: "Error!",
                        //                         text: "Failed to send 2FA. " + response.message,
                        //                         icon: "error",
                        //                         confirmButtonText: "OK",
                        //                     });
                        //                 }  
                        //             }
                        //     })
                        // .catch(error => {
                        //     console.log(error);
    
                        //     const errorMessage = error.response ? error.response.message : "An error occurred. Please try again.";
                        //     Swal.fire({
                        //         title: "Error!",
                        //         text: errorMessage,
                        //         icon: "error",
                        //         confirmButtonText: "OK",
                        //     });
                        // });
                    

                        // // Show the 2FA modal
                        // setModal(true);
                    // }
                } else {
                setNextLoading(false);
                }
        });       

    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        const regex = /^\d*\.?\d{0,2}$/;
        if (regex.test(value)) {
            setAmount(value);
            setIsButtonDisabled(!value);
        }
    };
    const handleDestinationChange = (e) => {
        const value = e.target.value;
            setDestination(value);
            setIsButtonDisabled(!value);
    };
    const handleDestinationUserIDChange = (e) => {
        const value = e.target.value;
        setDestinationUserID(value);
        setIsButtonDisabled(!value);
     //   Getwalletbalance(); 
    };

    useEffect(() => {
        // Fetch the conversion rate from Coinlore API
        const fetchConversionRate = async () => {
            try {
                const response = await axios.get('https://api.coinlore.net/api/ticker/?id=84965'); // Assuming 2864 is the ID for Flarecoin

                setConversionRate(response[0].price_usd);
            } catch (error) {
                console.error("Failed to fetch conversion rate:", error);
                setError("Failed to fetch conversion rate. Please try again later.");
            }
        };

        fetchConversionRate();

        // Check if there is an amount parameter in the URL
        const amountParam = searchParams.get('amount');
        if (amountParam) {
            setAmount(amountParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (conversionRate && amount) {
            setFlarecoinAmount(Math.round(amount / conversionRate));
        } else {
            setFlarecoinAmount(null);
        }
    }, [amount, conversionRate]);
    
    useEffect(() => {
        if (!isprocessing && !modal) {
           setNextLoading(false);
        }
    }, [modal]);
    

    const handle2FASubmit = () => {
        const digit1 =  getInputElement(1).value;
        const digit2 =  getInputElement(2).value;
        const digit3 =  getInputElement(3).value;
        const digit4 =  getInputElement(4).value;
        const digit5 =  getInputElement(5).value;
        const digit6 =  getInputElement(6).value;
        const twofa = digit1+digit2+digit3+digit4+digit5+digit6;

        setTwoFACode(twofa);

        if (twofa.trim() === "") {
            setError2FA("Please enter the 2FA code.");
            return;
        }

        // Include 2FA code in the transfer request
        ProcessWithdraw(twofa);

      //  toggleModal(); // Close the modal after submitting the code
    };

    const getInputElement = (index) => {
        return document.getElementById('digit' + index + '-input');
    }

    const moveToNext = (index) => {
        if (getInputElement(index).value.length === 1) {
            if (index !== 6) {
                getInputElement(index + 1).focus();
            } else {
                getInputElement(index).blur();
                // Submit code
                console.log('submit code');
            }
        }
    }
    function ProcessWithdraw(twofa) {

        setNextLoading(true);
        setIsProcessing(true); 

        // Fetch logged-in user data from sessionStorage
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = destinationuserid;

        // Prepare form data
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("amount_flr", flarecoinAmount);
        formData.append("g2aenabled", g2aenabled);
        formData.append("user_id", uid);
        formData.append("address", destination);
        formData.append("csrf_token", obj.csrf_token);
        formData.append("twoFA_code", twofa); // Send the 2FA code with the request

        // Create AJAX request

        axios.post("/withdrawad.php", formData)
            .then(response => {
                console.log(response);

                setIsLoading(false); 
                if (response.status === "success") {
                    const lurl=  `https://secure.billiondollarmind.io/init.php?v=${new Date().getTime()}`;

                    const width = 500;
                    const height = 600;
                    const left = (window.screen.width / 2) - (width / 2);
                    const top = (window.screen.height / 2) - (height / 2);
                    
                    // Open the lurl in a new window with specified size, position, and limited UI features
                    const popup = window.open(lurl, '_blank', `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`);

                    setIframeSrc(lurl);
                    reloadIframe();
                    setError("");

                    if (g2aenabled)
                        toggleg2aModal();
                    else
                        toggleModal();                    

                    // Check periodically if the popup is closed
                    const popupCheckInterval = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(popupCheckInterval);  // Stop checking once the popup is closed
                            //window.location.href = '/depositlist';  // Redirect to /depositlist
                            navigate('/withdrawlist');
                        }
                    }, 300);  // Check every 500 milliseconds
                    Getwalletbalance();
                } else if (response.message.includes("OTP Code is incorrect")) {
                    // Show the 2FA modal again
      
                    // Show the 2FA modal again
                    if (g2aenabled) {
                        setg2aModal(true);
                    } else {
                        setModal(true);
                    }
                    

                    Swal.fire({
                        title: "Error!",
                        text: "OTP Code is incorrect. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });     
                } else if (response.message && response.message.includes("Failed Validation")) {
                        navigate('/logout');
                } else {
  
                    Swal.fire({
                        title: "Error!",
                        text: response.message,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            })
            .catch(() => {
                setIsLoading(false);
                Swal.fire({
                    title: "Error!",
                    text: "An error occurred. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            });
       
    };


    return (
        <React.Fragment>
            <div className="page-content">
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
                    <BreadCrumb title="Withdrawal" pageTitle="Dashboard" url="/dashboard" />
                    <Row className="justify-content-center mt-4">
                        <Col lg={5}>
                            <div className="text-center">
                                <h4 className="fw-semibold fs-23">Make a Withdrawal</h4>
                                <div className="d-inline-flex"></div>
                            </div>
                        </Col>
                    </Row>

                    {!showIframe ? (
                        <Row className="justify-content-center mt-4">
                            <Col xxl={4} lg={6}>
                                <Card className="pricing-box ribbon-box right">
                                    <CardBody className="bg-light m-2 p-4">
                                        <form onSubmit={handleSubmit}>
                                        
                                            <div className="mb-5 withdraw-label1">
                                                <Label htmlFor="availableToWithdraw" className="form-label ">Available to Withdraw: </Label>
                                                <span className="withdraw-amount"><strong> {availableToWithdraw}</strong></span>
                                            </div>
                                            <div className="mb-4">
                                                <Label htmlFor="amount" className="form-label">User ID : </Label>

                                                <Input
                                                    type="text"
                                                    className="form-control"
                                                    id="userid"
                                                    placeholder="Enter Destination User ID"
                                                    value={destinationuserid}
                                                    onChange={handleDestinationUserIDChange}
                                                    required
                                                /> 
                                            </div>
                                            <div className="mb-4">
                                                <Label htmlFor="amount" className="form-label">Destination Address : </Label>

                                                <Input
                                                    type="text"
                                                    className="form-control"
                                                    id="destination"
                                                    placeholder="Enter Destination Address"
                                                    value={destination}
                                                    onChange={handleDestinationChange}
                                                    required
                                                /> 
                                            </div>
                                            <div className="mb-4">
                                                <Label htmlFor="amount" className="form-label">Enter USD amount to withdraw: </Label>
                                                <Input
                                                    type="number"
                                                    className="form-control"
                                                    id="amount"
                                                    placeholder="Enter Amount"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            {conversionRate && (
                                                    <div className="mb-3">
                                                        <Label htmlFor="conversionRate" className="form-label">
                                                            Conversion Rate (FLR/USD):
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            id="conversionRate"
                                                            value={`1 FLR = ${conversionRate} USD`}
                                                            readOnly
                                                        />
                                                    </div>
                                                )}
                                                {flarecoinAmount && (
                                                    <div className="mb-3">
                                                        <Label htmlFor="flarecoinAmount" className="form-label">
                                                            Equivalent FLR Amount:
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            id="flarecoinAmount"
                                                            value={`${flarecoinAmount} Flarecoin (FLR)`}
                                                            readOnly
                                                        />
                                                    </div>
                                                )}                                        
                                            <div className="text-end">
                                                <Button 
                                                    type="submit" 
                                                    className="w-100px btn btn-primary" 
                                                    disabled={nextloading}
                                                >
                                                    {nextloading ? (
                                                        <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="sr-only">Loading...</span>
                                                        </div>
                                                    ) : (
                                                        "Next"
                                                    )}
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    className="w-100px btn btn-light ms-2 hide" 
                                                    onClick={() => navigate('/withdrawlist')}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <Row className="justify-content-center mt-4">
                              
                            <Col xxl={6} lg={6}>
                                <Card className="pricing-box ribbon-box right">
                                    <CardBody className="bg-light" >
 
                                        {walletloading && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '400px',
                                               
                                                color: 'white',
                                                fontSize: '16px'
                                            }}>
                                                Checking Wallet Connection. Please wait...
                                            </div>
                                        )}                   
                                        <iframe
                                            ref={iframeRef}
                                            src={iframeSrc}
                                            title="Wallet Connect"
                                            style={{ width: '100%', height: '500px', border: 'none', background: "rgb(40 43 46)", display: walletloading ? 'none' : 'block' }}
                                            onLoad={handleIframeLoad} // Add onLoad event to handle iframe load
                                        />
                                        {/* <div className="text-left">
                                            <Button className="w-100px btn btn-primary" onClick={handleBackClick}>Back</Button>
                                        </div> */}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}                        
                </Container>
             )}
            </div>
            
            {/* Modal for entering 2FA code */}
            <Modal isOpen={modal} toggle={toggleModal}  className="modal-dialog-centered">
                <ModalHeader toggle={toggleModal}></ModalHeader>
                <ModalBody>
                <Container fluid>
                    <Row id="window2" className="justify-content-center">
                            <Col>
                                <Card className="mt-4">
                                    <CardBody className="p-4">
                                        <div className="mb-4">
                                            <div className="text-muted text-center mb-4 mx-lg-3">
                                                <h4 className="">Verify Your Identity</h4>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="avatar-lg mx-auto">
                                                <div className="avatar-title bg-light text-primary display-5 rounded-circle">
                                                    <i className="ri-mail-line"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 mt-4">
                                            <div className="text-muted text-center mb-4 mx-lg-3">
                                                <p>Identity verification is required. Please enter the 6 digit code sent to <span className="fw-semibold">{email}</span></p>
                                            </div>

                                            <form>
                                                <Row>
                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit1-input" className="visually-hidden">Digit 1</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit1-input" onKeyUp={() => moveToNext(1)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit2-input" className="visually-hidden">Digit 2</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit2-input" onKeyUp={() => moveToNext(2)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit3-input" className="visually-hidden">Digit 3</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit3-input" onKeyUp={() => moveToNext(3)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit4-input" className="visually-hidden">Digit 4</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit4-input" onKeyUp={() => moveToNext(4)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit5-input" className="visually-hidden">Digit 5</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit5-input" onKeyUp={() => moveToNext(5)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit6-input" className="visually-hidden">Digit 6</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit6-input" onKeyUp={() => moveToNext(6)} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </form>
                                            <div className="mt-3">
                                                <Button color="primary" onClick={handle2FASubmit} className="w-100">Confirm</Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                                <div className="mt-4 text-center">
                                <p className="mb-0">
                                    Didn't receive a code?  &nbsp;
                                    <a href="#" onClick={handleResendClick} className="fw-semibold text-primary text-decoration-underline">
                                         Resend
                                    </a>
                                </p>
                                </div>
                            </Col>
                    </Row>
                </Container>
                   
                  
                </ModalBody>
                <ModalFooter>
                {error2FA && <div className="alert alert-danger mt-2">{error2FA}</div>}
                </ModalFooter>
            </Modal>

            <Modal isOpen={g2amodal} toggle={toggleg2aModal}  className="modal-dialog-centered">
                <ModalHeader toggle={toggleg2aModal}></ModalHeader>
                <ModalBody>
                <Container fluid>
                    <Row id="window2" className="justify-content-center">
                            <Col>
                                <Card className="mt-4">
                                    <CardBody className="p-4">
                                        <div className="mb-4">
                                            <div className="text-muted text-center mb-4 mx-lg-3">
                                                <h4 className="">Goolge Authenticator Verification</h4>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="avatar-lg mx-auto">
                                                <div className="avatar-title bg-light text-primary display-5 rounded-circle">
                                                    <i className="ri-lock-line"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 mt-4">
                                            <div className="text-muted text-center mb-4 mx-lg-3">
                                                <p>Identity verification is required. Please enter the 6 digit <strong>Google Authenticator code</strong></p>
                                            </div>

                                            <form>
                                                <Row>
                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit1-input" className="visually-hidden">Digit 1</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit1-input" onKeyUp={() => moveToNext(1)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit2-input" className="visually-hidden">Digit 2</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit2-input" onKeyUp={() => moveToNext(2)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit3-input" className="visually-hidden">Digit 3</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit3-input" onKeyUp={() => moveToNext(3)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit4-input" className="visually-hidden">Digit 4</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit4-input" onKeyUp={() => moveToNext(4)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit5-input" className="visually-hidden">Digit 5</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit5-input" onKeyUp={() => moveToNext(5)} />
                                                        </div>
                                                    </Col>

                                                    <Col className="col-2">
                                                        <div className="mb-2">
                                                            <label htmlFor="digit6-input" className="visually-hidden">Digit 6</label>
                                                            <input type="text"
                                                                className="form-control twofainput bg-light border-light text-center"
                                                                maxLength="1"
                                                                id="digit6-input" onKeyUp={() => moveToNext(6)} />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </form>
                                            <div className="mt-3">
                                                <Button color="primary" onClick={handlegtaSubmit} className="w-100">Confirm</Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                                <div className="mt-4 text-center">
                                <p className="mb-0">
                                    Do you want to send the code to your email?  &nbsp;
                                    <a href="#" onClick={handle2faEmailSend} className="fw-semibold text-primary text-decoration-underline">
                                        Click Here
                                    </a>
                                </p>
                                </div>
                            </Col>
                    </Row>
                </Container>
                
                
                </ModalBody>
                <ModalFooter>
                {error2FA && <div className="alert alert-danger mt-2">{error2FA}</div>}
                </ModalFooter>
            </Modal>       

        </React.Fragment>
    );
};

export default Withdrawal;
