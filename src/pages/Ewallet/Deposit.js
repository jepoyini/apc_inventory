import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {    TabContent,
  TabPane, Nav,
  NavItem,
  NavLink,Form ,Card, CardBody,  CardHeader, Col, Container, Row, Label, Modal, ModalHeader, ModalBody, Input, Button } from 'reactstrap';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from 'axios';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import copy from "../../assets/images/copy (3).png"
//import WalletDeposit from '../../Components/Common/WalletDeposit.js';
import { APIClient } from "../../helpers/api_helper";

import config from "../../config"
import Big from "big.js";
import { toast, ToastContainer } from 'react-toastify';
import loadingImg from "../../assets/images/animation-loading.gif"
import Switch from "react-switch";
import { Flag } from 'feather-icons-react/build/IconComponents';
import classnames from "classnames";
// End Wallet

const Deposit = () => {
    const api = new APIClient();
    document.title = "Make a Deposit | IBPPRO";

    const [isFlareEnabled, setIsFlareEnabled] = useState(true);
  const [activeArrowTab, setactiveArrowTab] = useState(4);
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("");
    const [amount2, setAmount2] = useState(0);      
    const [minimumdeposit, setMinimumdeposit] = useState(10);      
    const [depositid,  setDepositID] = useState("");
    const [canceldeposit,  setCancelDeposit] = useState(false);
    const [showIframe, setShowIframe] = useState(false); // State to toggle iframe visibility
    const [iframeSrc, setIframeSrc] = useState(""); // State to manage iframe src
    const [conversionRate, setConversionRate] = useState(null);
    const [flarecoinAmount, setFlarecoinAmount] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userAmount, setUserAmount] = useState(true);
    const [nextloading, setNextLoading] = useState(false);
    const iframeRef = useRef(null);
    const [searchParams] = useSearchParams(); // Use this hook to get query parameters
    const [coin_type, setCoinType] = useState('usdt');

    const [done, setDone] = useState(false);
    //const toggleDone = () => setDone((false));
    const toggleDone = () => {
        // Close the modal and navigate to 'deposithistory'
        setDone(false); // assuming `done` is the state controlling the modal's visibility
        navigate('/deposithistory');
    };
  function toggleArrowTab(tab) {
    if (activeArrowTab !== tab) {

      var modifiedSteps = [...passedarrowSteps, tab];

      if (tab >= 4 && tab <= 8) {
        setactiveArrowTab(tab);
        setPassedarrowSteps(modifiedSteps);
      }
    }
  }
    const [hash, setHash] = useState("");
    const [fromwallet, setFromWallet] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const toggleEditModal = () => setLoadingState((false));
    const [loadingState, setLoadingState] = useState(false); // Add loading state
    const [progressbarvalue, setprogressbarvalue] = useState(0);
  const [passedSteps, setPassedSteps] = useState([1]);
  const [passedarrowSteps, setPassedarrowSteps] = useState([1]);
  const [passedverticalSteps, setPassedverticalSteps] = useState([1]);
    const [isLeft, setIsLeft] = useState(true);

    const [dropdownMethod, setDropdownMethod] = useState('Manual Transfer'); // Default option
    const [manualTransferDetails, setManualTransferDetails] = useState('');
    const [dropdownOptionCrypto, setDropdownOptionCrypto] = useState('USDT (BEP20)'); // Default option
    const [manualdepositstep, setManualdepositstep] = useState(1); 
    const [xummQrUrl, setXummQrUrl] = useState("");
        
    const walletAddresses = {
        "USDT (Polygon)": "0xead915b3674d475554b8eebceac5baf0ddb8f731",
      //  "USDT (TRC20)": "TFLrS3Q6rzA6zKSruajDofWjfmzNwpqEGg",
        "USDT (BEP20)": "0xd549c160b031dd688de9722d8ff13cb9d0f0b64d",
       // "USDC (BEP20)": "0xa52b9b831fb7418ae0f8430e084d2f165ba8afb0",
       // "POL": "0xDD0f40944A0eC05719141f17AC7f69080b94c118",
       // "FLR": "0xDD0f40944A0eC05719141f17AC7f69080b94c118",
       "BTC": "1DqkBS8PAodCWpp7UMoP7x7se6MWXKDJJc",
    };
    const [walletAddress, setWalletAddress] = useState(walletAddresses[dropdownOptionCrypto]);
    const [ismanualdepositcreated, setIsmanualdepositcreated] = useState(false);
    

    useEffect(() => {

        setWalletAddress(walletAddresses[dropdownOptionCrypto]);
        setAmount2(""); 

        if (dropdownOptionCrypto === 'FLR') {
            setCoinType('flr');
            fetchConversionRateFLR()
        } else if  (dropdownOptionCrypto === 'POL') {
            setCoinType('pol');
            fetchConversionRatePOL()
        } else if  (dropdownOptionCrypto === 'XRP') {
            setCoinType('xrp');
            fetchConversionRateXRP()      
        } else if  (dropdownOptionCrypto === 'RLUSD') {
            setCoinType('rlusd');
            setAmount2(amount);    
        } else if  (dropdownOptionCrypto === 'USDT (TRC20)') {
            setCoinType('usdt-trc20');
            setAmount2(amount);        
        } else if  (dropdownOptionCrypto === 'USDT (BEP20)') {
            setCoinType('usdt-bep20');
            setAmount2(amount);   
        } else if  (dropdownOptionCrypto === 'USDC (BEP20)') {
            setCoinType('usdc-bep20');
            setAmount2(amount);       
        } else if  (dropdownOptionCrypto === 'BTC') {
            setCoinType('btc');
            setAmount2(amount);                         
        } else {
            setCoinType('usdt');
            setAmount2(amount); 
        }

    }, [dropdownOptionCrypto]);
    const fetchConversionRateFLR = async (id) => {
        try {
                const response = await axios.get(`https://api.coinlore.net/api/ticker/?id=84965`);
                setConversionRate(response[0].price_usd);
        } catch (error) {
        }
    };
    const fetchConversionRatePOL= async (id) => {
        try {
                const response = await axios.get(`https://api.coinlore.net/api/ticker/?id=33536`);
                setConversionRate(response[0].price_usd);
        } catch (error) {
        }
    };
    const fetchConversionRateXRP = async (id) => {
        try {
            const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd");
            if (response.ripple?.usd) {
                setConversionRate(response.ripple.usd);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching XRP conversion rate:", error);
        }
    };
     
    const handleHashChange = (e) => {
        const value = e.target.value;
        setHash(value);
    };
    const handleFromWalletChange = (e) => {
        const value = e.target.value;
        setFromWallet(value);
    };
    const handlManualDepositFinish = async () => {

        if (!fromwallet.trim() || !hash.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Both the Sender Wallet Address and Blockchain Hash are required.',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            if (sessionStorage.getItem("authUser")) {
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                debugger;
                const cryptoTransaction = {
                    uid: uid,
                    id: depositid,
                    hash: hash,
                    sender: fromwallet
                };
        
                try {
                    if (sessionStorage.getItem("authUser")) {
                        const obj = JSON.parse(sessionStorage.getItem("authUser"));
                        const uid = obj.id;
                        const url = '/updatedeposithash';
                        const response = await api.post(url, cryptoTransaction);
                        console.log(response);
                    }
                } catch (error) {
                }

                // try {
                //     const response = await api.post("https://api.billiondollarmind.io/updatemanualdeposit.php",cryptoTransaction);
                //     if (response) {
                //         console.log(cryptoTransaction);        
                //         console.log(response);        
                //     }
        
                // } catch (error) {
                //     console.error('Error fetching rows:', error);
                // }


                toggleArrowTab(7)

                // Swal.fire({
                //     icon: 'success', // Exclamation icon
                //     title: 'Deposit Updated!',
                //     text: 'Please wait while we verify the blockchain, usually under a minute. If not auto-verified, we’ll manually check it. Rest assured, your funds are safe, and your wallet will be updated.',
                //     confirmButtonText: 'OK',
                //     customClass: {
                //         confirmButton: 'custom-width-button'
                //     }
                // }).then(() => {
                //     navigate('/deposithistory')
                // });

            }
        } catch (error) {
        }
       
    };

    const handleDepositManual = async () => {
        let proceed = false; 
        debugger;
       
        proceed = await ProcessDepositManual();
        if (proceed) {

            setIsmanualdepositcreated(true)

            if (dropdownOptionCrypto === "XRP" || dropdownOptionCrypto === "RLUSD") {
                const apiUrl = dropdownOptionCrypto === "XRP"
                    ? "/generate_xumm_qr.php"
                    : "/generate_rlusd_xumm_qr.php";
        
    
                try {
                    const obj = JSON.parse(sessionStorage.getItem("authUser"));
                    const uid = obj.id;                    
                    const data = { uid: uid, csrf_token: obj.csrf_token , amount: amount2};                
                    const response = await axios.post(apiUrl, data);
                    if (response.next?.always) {
                        setXummQrUrl(response.next.always);
                        setManualdepositstep(2);
                        toggleArrowTab(5)
                        return true; 
                    }
                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "Failed to generate Xumm QR Code. Please try again later.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    console.error("Xumm API error:", error);
                }
            } else {
                setManualdepositstep(2)
                toggleArrowTab(5)
                return true; 
            }

        }
        return false; 
        // if (flarecoinAmount === 0 || flarecoinAmount === null) {
        //     Swal.fire({
        //         title: "Amount not valid",
        //         text: "Please change your amount value and try again",
        //         icon: "error",
        //         confirmButtonText: "OK",
        //     });
        //     return;
        // }   


    };

    const handlManualStep3 =  () => {
            setManualdepositstep(3)
            toggleArrowTab(6)
    };    
    
    const ProcessDepositManual = async (e) => {
        try {
            if (sessionStorage.getItem("authUser")) {
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                const url = '/checkdeposit';
                const data = { uid: uid };
                setNextLoading(true);
                const response = await api.post(url, data,{showLoader:true});
                const depid = response.depositid
                
                if (response.pendings !== 0) {
                    
                    Swal.fire({
                        icon: 'warning', // Exclamation icon
                        title: 'Pending Deposit',
                        text: 'You have a pending deposit. You cannot create a new deposit until your pending deposit is completed or cancelled. Do you want to cancel this deposit?',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Cancel it',
                        cancelButtonText: 'No, Keep Pending',
                        customClass: {
                            confirmButton: 'custom-width-button'
                        }
                    }).then( async (result) => {
                        if (result.isConfirmed) {
                            debugger; 
                            try {
                                if (sessionStorage.getItem("authUser")) {
                                    const obj = JSON.parse(sessionStorage.getItem("authUser"));
                                    const uid = obj.id;
                                    const url = '/disabledeposit';
                                    const data = { uid: uid, id: depid };
                                    const response = await api.post(url, data,{showLoader:true});
                                    setDepositID(0);

                                Swal.fire({
                                    title: "Pending Deposit Cancelled",
                                    text: "You can now create a new deposit.",
                                    icon: "success",
                                    confirmButtonText: "OK",
                                 });
                                    
                                }
                            } catch (error) {
                            }
                        }
                    });

                    setNextLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error("Error checking deposits:", error);
        }
        

        // try {
        //     if (sessionStorage.getItem("authUser")) {
        //         const obj = JSON.parse(sessionStorage.getItem("authUser"));
        //         const uid = obj.id;
        //         const url = '/checkdeposits.php';
        //         const data = { uid: uid, csrf_token: obj.csrf_token };
        //         setNextLoading(true);
        //         const response = await axios.post(url, data);
        //         if (response.pendings !== 0) {
        //             Swal.fire({
        //                 icon: 'warning', // Exclamation icon
        //                 title: 'Pending Deposit',
        //                 text: 'You have a pending deposit. You cannot create a new deposit until your pending deposit is completed or cancelled.',
        //                 confirmButtonText: 'OK',
        //                 customClass: {
        //                     confirmButton: 'custom-width-button'
        //                 }
        //             });
        //             setNextLoading(false);
        //             return;
        //         }
        //     }
        // } catch (error) {
        // }

        // Validate input
        if (!amount2 || amount2 <= 0) {
            setError("Please enter a valid amount to deposit.");
            return;
        }

        if (dropdownOptionCrypto !== 'BTC' && amount2 < minimumdeposit) {
            setError(`The minimum allowed deposit is ${minimumdeposit} USDT.`);
            return;
        }

        // Fetch logged-in user data from sessionStorage
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const username = obj.username;

        // Prepare form data
        const formData = new FormData();
        formData.append("uid", uid);
        formData.append("amount", amount);
        formData.append("amount_flr", amount2);
        formData.append("is_manual", '1');

        if (dropdownOptionCrypto === 'FLR') {
            formData.append("coin_type", 'flr');
        } else if  (dropdownOptionCrypto === 'POL') {
            formData.append("coin_type", 'pol');
        } else if  (dropdownOptionCrypto === 'XRP') {
            formData.append("coin_type", 'xrp');
        } else if  (dropdownOptionCrypto === 'RLUSD') {
            formData.append("coin_type", 'rlusd');
        } else if  (dropdownOptionCrypto === 'USDT (TRC20)') {
            formData.append("coin_type", 'usdt-trc20');
        } else if  (dropdownOptionCrypto === 'USDT (BEP20)') {
            formData.append("coin_type", 'usdt-bep20');
        } else if  (dropdownOptionCrypto === 'USDC (BEP20)') {
            formData.append("coin_type", 'usdc-bep20');
        } else if  (dropdownOptionCrypto === 'BTC') {
            formData.append("coin_type", 'btc');            
        } else {
            formData.append("coin_type", 'usdt');
        }   
        formData.append("address", "");
        
        // try {
        //     if (!window.ethereum.selectedAddress) {
        //         formData.append("address", "");
        //     } else {
        //         formData.append("address", window.ethereum.selectedAddress);
        //     }
        // } catch (error) {
        //     formData.append("address", "");
        // }

        try {
            setNextLoading(true);
            const depositResponse = await api.post("/deposit", formData);

            if (depositResponse.status === "success") {
                setDepositID(depositResponse.id)
                return depositResponse.id; 
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to deposit funds. " + depositResponse.data.message,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }


        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "An error occurred. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
        return 0;
   

    };



    const reloadIframe = () => {
        const lurl = `https://secure.billiondollarmind.io/wallet/init.php?v=${new Date().getTime()}`;
        setIframeSrc(lurl);
        if (iframeRef.current) {
            // Force reload by setting the src attribute to the same URL
            iframeRef.current.src = iframeRef.current.src;
            iframeRef.current.src = `${iframeRef.current.src}?v=${new Date().getTime()}`;

        }
    };
    const handleIframeLoad = () => {
        setLoading(false);
    };

   

    useEffect(() => {


        // Check if there is an amount parameter in the URL
        const amountParam = searchParams.get('amount');
        if (amountParam) {
            setAmount(amountParam);
        }


    }, [searchParams, isLeft]);
  

    useEffect(() => {
        if (canceldeposit)
        {
            DisableDeposit()
        //    navigate('/deposithistory')
        }
        setCancelDeposit(false);
    }, [canceldeposit]);

    useEffect(() => {
    
        let c = 0 ; 
        if (conversionRate && amount) {
         
            c = Math.round(amount / conversionRate);
            if (c == 0) {
                setFlarecoinAmount(null);
            } else {
                setFlarecoinAmount(Math.round(amount / conversionRate));
            }
        } else {
            setFlarecoinAmount(null);
        }

        if (dropdownMethod === 'Manual Transfer' ) {
            if (dropdownOptionCrypto === 'FLR') {
                setAmount2(c); 
            } else if  (dropdownOptionCrypto === 'POL') {
                setAmount2(c); 
            } else if  (dropdownOptionCrypto === 'XRP') {
                c = (amount / conversionRate).toFixed(2);
                setAmount2(c);                 
            } else {
                setAmount2(amount); 
            }            
        }


    }, [amount, conversionRate]);

    useEffect(() => {
       if (done) {
            CompleteDeposit()
       }

    }, [done]);

    const CancelDeposit = () => {
        const navigate = useNavigate();
    
        const handleCancelDeposit = () => {
            Swal.fire({
                title: 'Are you sure?',
                text: 'Are you sure you want to cancel?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Cancel',
                cancelButtonText: 'No, Keep Deposit',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-secondary'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/deposithistory'); // Redirect if confirmed
                }
            });
        };
    }

    const ProcessDeposit = async (e) => {

        try {
            if (sessionStorage.getItem("authUser")) {
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                const url = '/checkdeposits.php';
                const data = { uid: uid };
                setNextLoading(true);
                const response = await api.post(url, data);
                const depid = response.depositid
                if (response.pendings !== 0) {


                    Swal.fire({
                        icon: 'warning', // Exclamation icon
                        title: 'Pending Deposit',
                        text: 'You have a pending deposit. You cannot create a new deposit until your pending deposit is completed or cancelled. Do you want to cancel this deposit?',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Cancel it',
                        cancelButtonText: 'No, Keep Pending',
                        customClass: {
                            confirmButton: 'custom-width-button'
                        }
                    }).then( async (result) => {
                        if (result.isConfirmed) {
                            debugger; 

                            try {
                                if (sessionStorage.getItem("authUser")) {
                                    const obj = JSON.parse(sessionStorage.getItem("authUser"));
                                    const uid = obj.id;
                                    const url = '/disabledeposit';
                                    const data = { uid: uid, id: depid };
                                    const response = await api.post(url, data);
                                    setDepositID(0);
                                }
                            } catch (error) {
                            }                            
                            DisableDeposit(depid)
                            // Call function to cancel deposit
                         //   cancelDeposit(uid);
                        }
                    });

                    setNextLoading(false);
                    return;
                }
            }
        } catch (error) {
        }

        // Validate input
        if (!amount || amount <= 0) {
            setError("Please enter a valid amount to deposit.");
            return;
        }

        // Fetch logged-in user data from sessionStorage
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const username = obj.username;

        // Prepare form data
        const formData = new FormData();
        formData.append("userid", uid);
        formData.append("amount", amount);
        formData.append("amount_flr", flarecoinAmount);
        formData.append("coin_type", coin_type);
        try {
            if (!window.ethereum.selectedAddress) {
                formData.append("address", "");
            } else {
                formData.append("address", window.ethereum.selectedAddress);
            }
        } catch (error) {
            formData.append("address", "");
        }

        try {
            setNextLoading(true);
            const depositResponse = await axios.post("/deposit2.php", formData);

            if (depositResponse.status === "success") {
                setDepositID(depositResponse.id)
                return depositResponse.id; 
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Failed to deposit funds. " + depositResponse.data.message,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }


        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: "An error occurred. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
        return 0;
    };

    const DisableDeposit = async (e) => {
        try {
            debugger;
            if (
                sessionStorage.getItem("authUser") &&
                depositid !== null &&
                depositid !== 0 &&
                depositid !== ""
            ) {
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                const url = '/disabledeposit';
                const data = { uid: uid, id: depositid };
                const response = await api.post(url, data, { showLoader: true });
                setDepositID(0);
            }
        } catch (error) {
            console.error("Error disabling deposit:", error);
        }
    };

    const UpdateDepositHash = async (depid,transhash) => {
        try {
            if (sessionStorage.getItem("authUser")) {
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                const url = '/updatedeposithash.php';
                const data = { uid: uid, csrf_token: obj.csrf_token, id: depid, hash: transhash};
                const response = await axios.post(url, data);
                console.log(response);
            }
        } catch (error) {
        }
    };    
    
    const CompleteDeposit = async () => {
        const obj = JSON.parse(sessionStorage.getItem("authUser"));
        const uid = obj.id;
        const cryptoTransaction = {
            id: depositid,
            username: uid,
            amount: flarecoinAmount,
            amounts: flarecoinAmount,
            transactionID: hash,
            status: 'success',
            senderAddress: fromwallet,
            senderWalletAddress: fromwallet
        };

        try {
            const response = await axios.post("https://api.ibopro.io/cryptodeposit2.php",cryptoTransaction);
            if (response) {
                console.log(cryptoTransaction);        
                console.log(response);        
            }

        } catch (error) {
            console.error('Error fetching rows:', error);
        }
        
    }

    const handleAmountChange = (e) => {
        const value = e.target.value;
        
        let regex;

        if (dropdownOptionCrypto === 'BTC') {
            // Allow up to 8 decimal places for BTC
            regex = /^\d*(\.\d{0,8})?$/;
        } else {
            // Default: allow up to 2 decimal places
            regex = /^\d*(\.\d{0,2})?$/;
        }

        if (regex.test(value)) {
            setAmount(value);
            setError("");
        } else {
            setError(`Please enter a valid ${dropdownOptionCrypto === 'BTC' ? 'BTC' : 'USD'} amount.`);
        }
    };


    const handleBackClick = () => {
        setShowIframe(false);
        setLoading(true);
        setNextLoading(false);
    };

    const walletData = {
        // Your data here
        userId: 123,
        depositAmount: 100,
        currency: 'USD',
        // Other data fields
    };

    const abipolflr = [
        {
            "inputs": [
                {
                    "internalType": "address payable",
                    "name": "_adminWallet",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_signer",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Invest",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Withdraw",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "adminWallet",
            "outputs": [
                {
                    "internalType": "address payable",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "blockList",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address payable",
                    "name": "newAdminWallet",
                    "type": "address"
                }
            ],
            "name": "changeAdminWallet",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                }
            ],
            "name": "invest",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "paused",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "BlockAddress",
                    "type": "address"
                }
            ],
            "name": "setBlockList",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bool",
                    "name": "_paused",
                    "type": "bool"
                }
            ],
            "name": "setPaused",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_signer",
                    "type": "address"
                }
            ],
            "name": "setSigner",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "BlockAddress",
                    "type": "address"
                }
            ],
            "name": "setUnBlock",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address payable",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "message",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "nonce",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "expirationTime",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "signature",
                    "type": "bytes"
                }
            ],
            "name": "verify",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "withdrawableAmount",
                    "type": "uint256"
                }
            ],
            "name": "withdrawAdmin",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ]

    const abiUsdt = [
        {
            "inputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "_investToken",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_adminWallet",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_signerAddress",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "target",
                    "type": "address"
                }
            ],
            "name": "AddressEmptyCode",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "AddressInsufficientBalance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newAdminWallet",
                    "type": "address"
                }
            ],
            "name": "changeAdminWallet",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "ECDSAInvalidSignature",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "length",
                    "type": "uint256"
                }
            ],
            "name": "ECDSAInvalidSignatureLength",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "ECDSAInvalidSignatureS",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "FailedInnerCall",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                }
            ],
            "name": "invest",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "SafeERC20FailedOperation",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Invest",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "BlockAddress",
                    "type": "address"
                }
            ],
            "name": "setBlockList",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "bool",
                    "name": "_paused",
                    "type": "bool"
                }
            ],
            "name": "setPaused",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_signer",
                    "type": "address"
                }
            ],
            "name": "setSigner",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "BlockAddress",
                    "type": "address"
                }
            ],
            "name": "setUnBlock",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "message",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "nonce",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "expirationTime",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes",
                    "name": "signature",
                    "type": "bytes"
                }
            ],
            "name": "verify",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Withdraw",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "adminWallet",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "blockList",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "investToken",
            "outputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "paused",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]


    const abiForApproval = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]
    const getDecimalsByChainId = (chainId) => {
        if (chainId == "1") {
            return 18;
        } else {
            return 18;
        }
    };

    const convertFromExponentialToDecimal = (n) => {
        var sign = +n < 0 ? "-" : "",
            toStr = n.toString();
        if (!/e/i.test(toStr)) {
            return n;
        }
        var [lead, decimal, pow] = n
            .toString()
            .replace(/^-/, "")
            .replace(/^([0-9]+)(e.*)/, "$1.$2")
            .split(/e|\./);
        return +pow < 0
            ? sign +
            "0." +
            "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
            lead +
            decimal
            : sign +
            lead +
            (+pow >= decimal.length
                ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
                : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
    };

    const handleDeposit = async () => {
        let proceed = false; 
        if (!isConnected) {
            Swal.fire({
                title: "Wallet Not Connected!",
                text: "Please connect your wallet before you can proceed.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
        if (flarecoinAmount === 0 || flarecoinAmount === null) {
            Swal.fire({
                title: "Amount not valid",
                text: "Please change your amount value and try again",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }        
        proceed = await ProcessDeposit();
        if (proceed) {
            setLoadingState(true)
            try {
                const response = await writeContract(config, {
                    abi: abipolflr,
                    address: contrac,
                    functionName: "invest",
                    args: [BigInt(flarecoinAmount)],
                    value: numberIntoDecimals(flarecoinAmount)
                });
                if (response) {
                     const transactionReceipt = await waitForTransactionReceipt(config, {
                        hash: response,
                        pollingInterval: 1_000,
                    });
                    if (transactionReceipt) {
                        setDone(true)
                        setLoadingState(false)
                        setHash(transactionReceipt.transactionHash)
                        setFromWallet(transactionReceipt.from)
                        console.log(transactionReceipt)
                    }
                }
            } catch (e) {

                if ( e.message.includes('rejected the request'))
                {
                    console.error("Rejected");
                    Swal.fire({
                        title: "Deposit Cancelled",
                        text: "User Rejected the transaction!",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
                else if (e.name === 'InsufficientFundsError' || e.message.includes('not have enough funds')) {
                    Swal.fire({
                        title: "Insufficient funds",
                        text: "An error occurred: Insufficient funds! Please add funds to your wallet and try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });

                }
                else if (e.message.includes('Timed out while waiting for transaction'))
                {
                    let transhash = e.shortMessage;
                    const hashOnly = transhash.match(/0x[a-fA-F0-9]{64}/)?.[0];
                    if (hashOnly) {
                        await UpdateDepositHash(proceed,hashOnly)
                    }
                    Swal.fire({
                        title: "Deposit Still Pending",
                        text: "Your blockchain transaction has been successfully submitted.\n\nWe will update your wallet as soon as the coins are received.",
                        icon: "info",
                        confirmButtonText: "OK",
                    });
                    navigate('/deposithistory')
                    return
                    
                } else {
                    setLoadingState(false)
                    Swal.fire({
                        title: "Error",
                        text: e.message,
                        icon: "error",
                        confirmButtonText: "OK",
                    });

                    toast.error(e.message);
                }
                setLoadingState(false)
                setNextLoading(false)
                setCancelDeposit(true)

            }
        }
    };

    const handleDepositUsdt = async () => {
        let proceed = false;         
        console.log("hello approve", amount)
        if (!isConnected) {
            Swal.fire({
                title: "Wallet Not Connected!",
                text: "Please connect your wallet before you can proceed.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
        if (flarecoinAmount === 0 || flarecoinAmount === null) {
            Swal.fire({
                title: "Amount not valid",
                text: "Please change your amount value and try again",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }        
        proceed = await ProcessDeposit();
        if (proceed) {        
            setLoadingState(true)
            try {
                const response = await writeContract(config, {
                    abi: abiForApproval,
                    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
                    functionName: "approve",
                    args: ["0xadC3356D8a9a4d72627b7E12788450C163Bf7807", BigInt(amount * 1000000)],
                    // value: numberIntoDecimals(amount)
                });
                if (response) {
                    const transactionReceipt = await waitForTransactionReceipt(config, {
                        hash: response,
                        pollingInterval: 1_000,
                    });
                    if (transactionReceipt) {
                        const response = await writeContract(config, {
                            abi: abiUsdt,
                            address: "0xadC3356D8a9a4d72627b7E12788450C163Bf7807",
                            functionName: "invest",
                            args: [BigInt(amount * 1000000)],
                            // value: numberIntoDecimals(amount)
                        });
                        if (response) {
                            const transactionReceipt = await waitForTransactionReceipt(config, {
                                hash: response,
                                pollingInterval: 1_000,
                            });
                            if (transactionReceipt) {

                                console.log(transactionReceipt)  
                                setDone(true)
                                setLoadingState(false)
                                setHash(transactionReceipt.transactionHash)
                                setFromWallet(transactionReceipt.from)
                                                              
                            }
                        }
                    }
                }
            } catch (e) {
               

                if ( e.message.includes('rejected the request'))
                    {
                        console.error("Rejected");
                        Swal.fire({
                            title: "Deposit Cancelled",
                            text: "User Rejected the transaction!",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                    else if (e.name === 'InsufficientFundsError' || e.message.includes('not have enough funds')) {
                        Swal.fire({
                            title: "Insufficient funds",
                            text: "An error occurred: Insufficient funds! Please add funds to your wallet and try again.",
                            icon: "Error",
                            confirmButtonText: "OK",
                        });
                        navigate('/deposithistory')
                    }
                    else if (e.message.includes('Timed out while waiting for transaction'))
                    {
                        let transhash = e.shortMessage;
                        const hashOnly = transhash.match(/0x[a-fA-F0-9]{64}/)?.[0];
                        if (hashOnly) {
                            await UpdateDepositHash(proceed,hashOnly)
                        }
                        Swal.fire({
                            title: "Deposit Still Pending",
                            text: "Your blockchain transaction has been successfully submitted.\n\nWe will update your wallet as soon as the coins are received.",
                            icon: "info",
                            confirmButtonText: "OK",
                        });
                        navigate('/deposithistory')
                        return
                        
                    } else {
                        setLoadingState(false)
                        Swal.fire({
                            title: "Error",
                            text: e.message,
                            icon: "error",
                            confirmButtonText: "OK",
                        });
    
                        toast.error(e.message);
                    }
                    setLoadingState(false)
                    setNextLoading(false)
                    setCancelDeposit(true)
    
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(hash).then(() => {
            setIsCopied(true);
            toast.success("hash copied successfully")
            setTimeout(() => setIsCopied(false), 2000); // Reset copy message after 2 seconds
        });
    };

    useEffect(() => {
        const handleNetworkChange = () => {
            // fetchConversionRate(chainId)
            // console.log(chainId, "2")
        };

        const handleWalletConnect = () => {
            if (!window.ethereum.selectedAddress) {
                console.log("Wallet is not connected");
            } else {
                // fetchConversionRate(chainId)
            }
        };

        if (window.ethereum) {
            window.ethereum.on("chainChanged", handleNetworkChange);
            window.ethereum.on("accountsChanged", handleWalletConnect);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.off("chainChanged", handleNetworkChange);
                window.ethereum.off("accountsChanged", handleWalletConnect);
            }
        };

    }, []);


    // Toggle function to switch between "Left" and "Right"

    const handleToggleChange = (e) => {
        console.log(e, "check");
        setIsLeft(e)

    };

    const copyToClipboard = () => {

        const repLinkElement = document.getElementById('usdt_address');
        const urlText = repLinkElement.innerText;
    
        const tempInput = document.createElement('input');
        tempInput.value = urlText;
        document.body.appendChild(tempInput);
    
        tempInput.select();
        document.execCommand('copy');
    
        document.body.removeChild(tempInput);
    
        alert('Address copied to clipboard!');
      };

      const handleCancelDeposit = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Are you sure you want to cancel?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel',
            cancelButtonText: 'No, Keep Deposit',
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                DisableDeposit()
                navigate('/deposithistory');
            }
        });
    };

// *********************************************************************************************************

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="E-wallet Deposit" pageTitle="Dashboard" url="/dashboard" />

                    {!showIframe ? (
                        <>
                            <Row className="justify-content-center mt-4 hide">
                                <Col xxl={4} lg={6}>
                                    <Card className="pricing-box ribbon-box right">
                                        <CardBody className="bg-light ">

                                            
                                                <div>

                                                    <Row className="justify-content-center mt-4">
                                                        <Col lg={12}>
                                                            <div className="text-center">
                                                                <h3 className="fw-semibold fs-23">New Deposit</h3>
                                                            </div>
                                                        </Col>
                                                    </Row>                                                
                                                    {manualdepositstep === 1 ? (
                                                            <div>
                                                                    
                                                                {/* MANUAL TRANSFER SECTION */}

                                                                <br></br>
                                                                <h4 className="text-center p-10">STEP 1: ENTER DETAILS </h4>
                                                                <div className="fs-17 p-10">
                                                                    <Label htmlFor="amount" className="form-label">Choose a crypto currency:  </Label> 
                                                                    <br></br>                                                        
                                                                    <select
                                                                        id="deposit-crypto2"
                                                                        value={dropdownOptionCrypto}
                                                                        onChange={(e) => setDropdownOptionCrypto(e.target.value)}
                                                                        className="ml-5"
                                                                    >
                                                                        <option value="USDT (Polygon)">USDT (Polygon)</option>
                                                                        <option value="USDT (TRC20)">USDT (TRC20)</option>
                                                                        <option value="USDT (BEP20)">USDT (BEP20)</option>
                                                                        <option value="POL">POL</option>
                                                                        <option value="FLR">FLR</option>
                                                                        <option value="XRP">XRP</option>
                                                                        <option value="RLUSD">RLUSD</option>
                                                                        <option value="USDC (BEP20)">USDC (BEP20)</option>
                                                                    </select> 
                                                                    <br></br>
                                                                    <br></br>

                                                                    <Label htmlFor="amount" className="form-label">Enter USD amount to deposit:</Label>
                                                                    <Input
                                                                        type="number"
                                                                        className="form-control"
                                                                        id="amount2"
                                                                        placeholder="Enter Amount"
                                                                        value={amount}
                                                                        onChange={handleAmountChange}
                                                                        step="0.01"
                                                                        min="0"
                                                                        pattern="^\d*(\.\d{0,2})?$"
                                                                        required
                                                                    />
                                                                    {error && <div className="text-danger">{error}</div>}
                                                                    <br></br>


                                                                    <div className="">
                                                                            {/* <Label htmlFor="amount" className="fs-17 form-label">For {dropdownOptionCrypto} </Label>  */}
                                                                            <p>
                                                                                <Label htmlFor="amount" className="form-label">Transfer this amount:  </Label> <span id="usdt_amount" style={{ color: "#ffc94c" }}><strong>{amount2} {dropdownOptionCrypto}</strong>  </span>  
                                                                                <br></br>
                                                                            </p>
                                                                    </div> 
                                                                    <br></br>
                                                                    {/* button */}
                                                                
                                                                    <div className="d-flex justify-content-end gap-2">
                                                                        <Button
                                                                            type=""
                                                                            className="w-110px btn btn-primary"
                                                                            onClick={() => handleDepositManual()}
                                                                        >
                                                                            Next
                                                                        </Button>
                                                                        <Button
                                                                            type=""
                                                                            className="w-110pxbtn  btn-light"
                                                                            onClick={() => handleCancelDeposit()}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>


                                                                </div>  
                                                            </div>
                                                    ) : manualdepositstep === 2 && (dropdownOptionCrypto === "USDT (Polygon)" || dropdownOptionCrypto === "USDT (TRC20)" || dropdownOptionCrypto === "USDT (BEP20)" || dropdownOptionCrypto === "USDC (BEP20)" ||  dropdownOptionCrypto === "POL"  || dropdownOptionCrypto === "FLR") ? (
                                                                <div>
                                                                    <Row className="justify-content-center mt-4">
                                                                        <Col lg={12}>
                                                                            <div className="text-center">
                                                                                <h4 className="fw-semibold fs-23">STEP 2: Awaiting for payment</h4>
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                    <br></br>
                                                                    <div className="alert alert-success p-10" role="alert">
                                                                        Please transfer the funds manually to our wallet address below. 
                                                                    </div>
                                                                    <br></br>
                                                                    <div className="p-10">
                                                                            <br></br>
                                                                            {/* <Label htmlFor="amount" className="fs-17 form-label">For {dropdownOptionCrypto} </Label>  */}
                                                                            <p style={{ fontSize: '18px' }}>
                                                                                <Label htmlFor="amount" className="form-label">Transfer this amount:  </Label> <span id="usdt_amount" style={{ color: "#ffc94c" }}><strong>{amount2} {dropdownOptionCrypto}</strong>  </span>  
                                                                                <br></br><br />
                                                                                <Label htmlFor="amount" className="form-label">To this Wallet Address:  </Label> <span id="usdt_address" className="replicated-link mb-0"> <strong>{walletAddress}</strong></span>  
                                                                                <i
                                                                                    className="far fa-copy copy-icon"
                                                                                    title="Copy to clipboard"
                                                                                    onClick={copyToClipboard}
                                                                                    style={{ cursor: 'pointer', marginLeft: '10px', color: '#007bff' }}
                                                                                ></i>
                                                                            </p>
                                                                    </div>     
            
                                                                    <div className="d-flex justify-content-end gap-2">
                                                                        <Button
                                                                            type=""
                                                                            className="w-110px btn btn-primary"
                                                                            onClick={() => handlManualStep3()}
                                                                        >
                                                                            Transfer Complete
                                                                        </Button>
                                                                        <Button
                                                                            type=""
                                                                            className="w-110px btn  btn-light"
                                                                            onClick={() => handleCancelDeposit()}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
            
                                                                </div>
                                                    ) : manualdepositstep === 2 && (dropdownOptionCrypto === "XRP" || dropdownOptionCrypto === "RLUSD") ? (
                                                        <div>
                                                            <Row className="justify-content-center mt-4">
                                                                <Col lg={12}>
                                                                    <div className="text-center">
                                                                        <h4 className="fw-semibold fs-23">STEP 2: Awaiting for payment</h4>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <br></br>
                                                            <div className="alert alert-success p-10" role="alert">
                                                                Click the <strong>Proceed to Transfer</strong> button to generate a <strong>QR Code</strong> that you can scan using the <strong>XUMM/XAMAN app</strong> on your phone.
                                                                <br /><br />
                                                                This will allow you to securely process your transfer. <strong>The QR code will open in a new window.</strong>  
                                                                <br /><br />
                                                                Once the transaction is completed, please return to this page and finish step 3 which you will enter your <strong>transaction hash</strong> and <strong>sender address</strong> to complete your deposit.  
                                                                <br /><br />
                                                                If you do not wish to continue, click <strong>Cancel</strong>.
                                                            </div>
                                                            <br></br>
    

                                                            <div className="d-flex justify-content-end gap-2">
                                                            <Button
                                                                        type="button"
                                                                        className="w-110px btn btn-primary"
                                                                        onClick={() => {
                                                                            window.open(xummQrUrl, "_blank"); // Open Xumm QR link in a new window
                                                                            handlManualStep3(); // Proceed to Step 3
                                                                        }}
                                                                    >
                                                                        Proceed to Transfer
                                                                </Button>
                                                                <Button
                                                                    type=""
                                                                    className="w-110px btn  btn-light"
                                                                    onClick={() => handleCancelDeposit()}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>

                                                        </div>                                                            
                                                    ) : manualdepositstep === 3 ? (
                                                        <div>
                                                            <Row className="justify-content-center mt-4">
                                                                <Col lg={12}>
                                                                    <div className="text-center">
                                                                        <h4 className="fw-semibold fs-23">STEP 3: Transaction Confirmation</h4>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                            <br></br>
                                                            <div className="alert alert-success p-10" role="alert">
                                                                Please provide the sender address and blockchain hash for verification. Your deposit will be processed within 1-2 minutes, and your wallet balance will be updated accordingly. If you have any questions, feel free to reach out anytime.
                                                            </div>
                                                            <br></br>
                                                        

                                                            <div  className=" p-10">
                                                                        <Label htmlFor="manual_sender_wallet" className="form-label">Sender Wallet Address:</Label>
                                                                        <Input
                                                                            type="text"
                                                                            className="form-control"
                                                                            id="manual_sender_wallet"
                                                                            placeholder='Enter Sender Wallet Address'
                                                                            value={fromwallet}
                                                                            onChange={handleFromWalletChange}
                                                                            required
                                                                        />
                                                            </div>
                                                            <div  className=" p-10">
                                                                        <Label htmlFor="manual_hash" className="form-label">Blockchain Hash:</Label>
                                                                        <Input
                                                                            type="text"
                                                                            className="form-control"
                                                                            id="manual_hash"
                                                                            placeholder='Enter Blockchain Hash'
                                                                            value={hash}
                                                                            onChange={handleHashChange}
                                                                            required
                                                                        />
                                                            </div>
                                                            <div className="text-end">
                                                                <br></br>
                                                                <Button
                                                                    type=""
                                                                    className="w-110px btn btn-primary"
                                                                    onClick={() => handlManualDepositFinish() }
                                                                >
                                                                        Submit
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>                     

                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>

                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh" }}>
                                <Row className="w-100 justify-content-center">
                        
                                    <Col xl={8}>
                                    <Card>
                                        <CardHeader>
                                        <h4 className="card-title mb-0">Make a new deposit </h4>
                                        </CardHeader>
                                        <CardBody >
                                        <Form className="form-steps" autoComplete="off">
                                            <div className="text-center pt-3 pb-4 mb-1">
                                            {/* <img src={logoDark} alt="" height="17" /> */}
                                        
                                            </div>
                                            <div className="step-arrow-nav mb-4">
                                            <Nav
                                                className="nav-pills custom-nav nav-justified"
                                                role="tablist"
                                            >
                                                <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                    style={{ pointerEvents: 'none' }} // 👈 disables interaction
                                                    className={classnames({
                                                    active: activeArrowTab === 4,
                                                    done: activeArrowTab <= 6 && activeArrowTab > 3,
                                                    })}
                                                    onClick={() => {
                                                    toggleArrowTab(4);
                                                    }}
                                                >
                                                    Enter Details
                                                </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                    style={{ pointerEvents: 'none' }} // 👈 disables interaction
                                                    className={classnames({
                                                    active: activeArrowTab === 5,
                                                    done: activeArrowTab <= 6 && activeArrowTab > 4,
                                                    })}
                                                    onClick={() => {
                                                    toggleArrowTab(5);
                                                    }}
                                                >
                                                    Awaiting for payment
                                                </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                     style={{ pointerEvents: 'none'}} // 👈 disables interaction
                                                    className={classnames({
                                                    active: activeArrowTab === 6,
                                                    done: activeArrowTab <= 6 && activeArrowTab > 5,
                                                    })}
                                                    onClick={() => {
                                                    toggleArrowTab(6);
                                                    }}
                                                >
                                                     Confirm Transaction
                                                </NavLink>
                                                </NavItem>                                                
                                                <NavItem>
                                                <NavLink
                                                    href="#"
                                                    id="steparrow-gen-info-tab"
                                                     style={{ pointerEvents: 'none' }} // 👈 disables interaction
                                                    className={classnames({
                                                    active: activeArrowTab === 7,
                                                    done: activeArrowTab <= 7 && activeArrowTab > 6,
                                                    })}
                                                    onClick={() => {
                                                    toggleArrowTab(7);
                                                    }}
                                                >
                                                    Finish
                                                </NavLink>
                                                </NavItem>
                                            </Nav>
                                            </div>

                                            <TabContent activeTab={activeArrowTab}>
                                            <TabPane id="steparrow-gen-info" tabId={4}>
                                                <div>
                                                    <Row className="w-100 justify-content-center">
                                                    <Col lg={12}>
                                                        <div
                                                        className="fs-17 p-10"
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            textAlign: "left",
                                                            margin: "0 auto",
                                                        }}
                                                        >
                                                        <br />
                                                        <Label htmlFor="amount" className="form-label">Choose a crypto currency:</Label>
                                                        <select
                                                            id="deposit-crypto2"
                                                            value={dropdownOptionCrypto}
                                                            onChange={(e) => setDropdownOptionCrypto(e.target.value)}
                                                            className="form-select"
                                                            style={{ width: "100%", maxWidth: "300px" }}
                                                        >
                                                            {/* <option value="USDT (Polygon)">USDT-Polygon</option> */}
                                                            <option value="USDT (BEP20)">USDT-BSC (BEP20)</option>
                                                            {/* <option value="BTC">BTC</option> */}
                                                        </select>

                                                        <br />

                                                        <Label htmlFor="amount2" className="form-label">
                                                        {dropdownOptionCrypto === 'BTC'
                                                            ? 'Enter BTC amount to deposit:'
                                                            : 'Enter USD amount to deposit:'}
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            className="form-control"
                                                            id="amount2"
                                                            placeholder={dropdownOptionCrypto === 'BTC' ? 'Enter BTC Amount' : 'Enter USD Amount'}
                                                            value={amount}
                                                            onChange={handleAmountChange}
                                                             {...(dropdownOptionCrypto !== 'BTC' && { step: "0.01" })}
                                                            min="0"
                                                            pattern="^\d*(\.\d{0,2})?$"
                                                            style={{ width: "100%", maxWidth: "300px" }}
                                                            required
                                                        />
                                                        {error && <div className="text-danger">{error}</div>}

                                                        <br />
                                                        <br />
                                                     
                                                        </div>
                                                    </Col>
                                                    </Row>
                                                </div>
                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                     <Button
                                                                                type=""
                                                                                className="w-110pxbtn  btn-light"
                                                                                onClick={() => handleCancelDeposit()}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab nexttab"
                                                    style={{ width: "150px", maxWidth: "150px" }}
                                                    data-nexttab="steparrow-description-info-tab"
                                                    onClick={() => {
                                                    handleDepositManual()
                                                    }}
                                                >
                                                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                                    Next
                                                </button>
                                                </div>
                                            </TabPane>

                                            <TabPane id="steparrow-description-info" tabId={5}>
<div style={{ padding: '10px', textAlign: 'center' }}>
  <div className="p-7">
    <h5>Kindly transfer the coins manually to the wallet address provided below:</h5>
    <p style={{ fontSize: '15px' }}>
      <strong>Amount to Transfer:</strong>{' '}
      <span id="usdt_amount" style={{ color: "#ffc94c" }}>
        {amount2} {dropdownOptionCrypto}
      </span>
    </p>

    <p><strong>Scan this QR Code to Send</strong></p>
    <QRCodeCanvas value={walletAddress} size={200} />

    <p style={{ marginTop: '20px' }}>
      <strong>Wallet Address:</strong><br />
      <span id="usdt_address" className="replicated-link mb-0">
        <strong>{walletAddress}</strong>
      </span>
      <i
        className="far fa-copy copy-icon"
        title="Copy to clipboard"
        onClick={copyToClipboard}
        style={{ cursor: 'pointer', marginLeft: '10px', color: '#007bff' }}
      ></i>
        <div className="alert alert-warning mt-4" role="alert">
          <strong>Note:</strong> After you’ve made the transfer, please get the sender wallet address and transaction hash, then click <strong>Next</strong>.
        </div>
    </p>


  </div>
</div>


                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                    toggleArrowTab(activeArrowTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                                                    Back
                                                </button>
                                                 <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab nexttab"
                                                    style={{ width: "150px", maxWidth: "150px" }}
                                                    data-nexttab="steparrow-description-info-tab"
                                                    onClick={() => {
                                                    handlManualStep3()
                                                    }}
                                                >
                                                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                                    Next
                                                </button>
                                                </div>
                                            </TabPane>


                                            <TabPane id="steparrow-description-info" tabId={6}>
                                                <div style={{padding:'30px'}}>

                                                        <div className="alert alert-success" role="alert">
                                                        {dropdownOptionCrypto === "BTC" ? (
                                                            <>
                                                            <strong>Note:</strong> After completing your BTC transfer, please provide the sender’s wallet address and the transaction hash, then click <strong>Next</strong>. Your deposit will be reviewed, and your wallet balance will be updated accordingly. Please note that due to Bitcoin’s market volatility, the credited amount will be based on the exchange rate at the time the transaction is confirmed. If you have any questions, feel free to contact us anytime.
                                                            </>
                                                        ) : (
                                                            <>
                                                            <strong>Note:</strong> Please enter the sender's wallet address and the blockchain transaction hash to verify your deposit. Once submitted, your deposit will be reviewed and your wallet balance will be updated within <strong>1–2 minutes</strong>. If you have any questions, feel free to contact us at any time.
                                                            </>
                                                        )}
                                                        </div>

                                                        <div className="mb-4 mt-4" style={{ maxWidth: "500px" }}>
                                                        <div className="mb-3">
                                                            <Label htmlFor="manual_sender_wallet" className="form-label">Sender Wallet Address</Label>
                                                            <Input
                                                            type="text"
                                                            className="form-control"
                                                            id="manual_sender_wallet"
                                                            placeholder="Enter Sender Wallet Address"
                                                            value={fromwallet}
                                                            onChange={handleFromWalletChange}
                                                            required
                                                            />
                                                        </div>

                                                        <div className="mb-3">
                                                            <Label htmlFor="manual_hash" className="form-label">Blockchain Hash</Label>
                                                            <Input
                                                            type="text"
                                                            className="form-control"
                                                            id="manual_hash"
                                                            placeholder="Enter Blockchain Hash"
                                                            value={hash}
                                                            onChange={handleHashChange}
                                                            required
                                                            />
                                                        </div>
                                                        </div>


                                                    </div>

                                                <div className="d-flex align-items-start gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-label previestab"
                                                    onClick={() => {
                                                    toggleArrowTab(activeArrowTab - 1);
                                                    }}
                                                >
                                                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>{" "}
                                                    Back
                                                </button>
                                                 <button
                                                    type="button"
                                                    className="btn btn-primary btn-label right ms-auto nexttab nexttab"
                                                    style={{ width: "150px", maxWidth: "150px" }}
                                                    data-nexttab="steparrow-description-info-tab"
                                                    onClick={() => {
                                                    handlManualDepositFinish()
                                                    }}
                                                >
                                                    <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>
                                                    Next
                                                </button>
                                                </div>
                                            </TabPane>

                                            <TabPane id="pills-experience" tabId={7}>
                                                <div className="text-center" style={{padding:'50px'}}>
                                                    <div className="avatar-md mt-5 mb-4 mx-auto">
                                                        <div className="avatar-title bg-light text-success display-4 rounded-circle">
                                                        <i className="ri-checkbox-circle-fill"></i>
                                                        </div>
                                                    </div>
                                                    <h4>Deposit Created Successfully!</h4>
                                                    <br></br>  <br></br>
                                                    <p className="text-muted" style={{padding:'10px',marginBottom:"50px"}}>
                                                        <h6>
                                                    Please hold on while we verify the transaction on the blockchain, this typically takes 1-2 minutes. If it isn't auto-verified, our team will manually review it. Rest assured, your funds are secure and your wallet will be updated shortly.</h6>
                                                    </p>

                                                <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                                                    onClick={() => {
                                                    navigate("/deposithistory");
                                                    }}
                                                >
                                                    View Deposit History
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-soft-warning waves-effect waves-light material-shadow-none w-100 mw-250"
                                                    onClick={() => {
                                                    navigate("/home");
                                                    }}
                                                >
                                                    Go to Dashboard
                                                </button>
                                                </div>


                                                </div>
                                            </TabPane>
                                            </TabContent>
                                        </Form>
                                        </CardBody>
                                    </Card>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ) : (
                        <Row className="text-center justify-content-center">

                                
                            <Col lg={12}>



                                <div className="text-center p-5">
                                <lord-icon
                                    src="https://cdn.lordicon.com/rslnizbt.json"
                                    trigger="loop"
                                    colors="primary:#fba189,secondary:#405189"
                                    style={{ width: "150px", height: "150px" }}
                                ></lord-icon>

                                </div>
                                <h5>Deposits are temporarily unavailable due to system maintenance. </h5>
                                <p className="text-muted mb-4">
                                    <h6></h6>
                                Please check back later.
                                </p>

                                <div className="hstack justify-content-center gap-2">
                               
                                </div>
                            </Col>
                            </Row>
                    )}
                </Container>
                <Modal isOpen={loadingState} toggle={toggleEditModal} centered>
                    <ModalHeader className="bg-light p-3" toggle={toggleEditModal}></ModalHeader>
                    <ModalBody>
                        <div className="d-flex justify-content-center">
                            <img src={loadingImg} alt="" height={120} />
                        </div>
                        <div className="d-flex mb-4  mt-4 justify-content-center">
                            <span className="" style={{ fontSize: "18px" }}>Transaction is in Progress..
                            </span>
                        </div>
                        <div className="d-flex mb-4  mt-4 justify-content-center">
                            <span className="" style={{ fontSize: "18px" }}>Please wait. Do not close this window. 
                            </span>
                        </div>
                    </ModalBody>
                </Modal>
                <Modal isOpen={done} toggle={toggleDone} centered>
                    <ModalHeader className="bg-light p-3" toggle={toggleDone}></ModalHeader>
                    <ModalBody className="gif">
                        <div className="d-flex justify-content-center" style={{ marginTop: "2rem" }}>
                            <span className="mt-3" style={{ fontSize: "50px", color: "lightgreen" }}>Congratulations
                            </span>
                        </div>
                        <div className="d-flex mb-4  mt-4 justify-content-center">
                            <span className="" style={{ fontSize: "26px" }}>Your Deposit is successful!
                            </span>
                        </div>
                        <div className="d-flex mb-4  mt-4 justify-content-center">
                            <span className="" style={{ fontSize: "20px" }}> Transaction hash:
                            </span>
                        </div>
                        <div className="d-flex mb-4 mt-4 justify-content-center">
                            <span style={{ fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                {hash}
                            </span>
                            <div onClick={handleCopy} className="ml-2 d-flex align-items-center cursor-pointer">
                                <img src={copy} alt="Copy Icon" />
                            </div>
                        </div>
                        <div className="d-flex justify-content-center" style={{ marginTop: "2rem" }}>
                            <span className="mt-3 mb-3 cursor-pointer" style={{ fontSize: "20px", color: "orange", textDecoration: "underline" }} onClick={() => { window.open(`${chain?.id == 137 ? `https://polygonscan.com/tx/${hash}` : `https://flarescan.com/tx/${hash}`}`) }}>View on block explorer
                            </span>
                        </div>


                    </ModalBody>

                </Modal>
                <ToastContainer closeButton={false} limit={1} />
            </div>
        </React.Fragment>
    );
};

export default Deposit;
