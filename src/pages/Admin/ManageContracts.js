import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { useAccount, useBalance } from "wagmi";
import config from "../../config"
import {
   getAccount,
   switchChain,
   waitForTransactionReceipt,
   writeContract,
   readContract
} from "@wagmi/core";
import Switch from "react-switch";
import { arbitrum, bsc, flare } from 'wagmi/chains'
import loadingGif from "../../assets/images/animation-loading.gif"
import copy from "../../assets/images/copy (3).png"
const ManageContracts = () => {
   const metadata = {
      name: 'Web3Modal',
      description: 'Web3Modal Example',
      url: 'https://web3modal.com', // origin must match your domain & subdomain
      icons: ['https://avatars.githubusercontent.com/u/37784886']
   }
   const [isCopied, setIsCopied] = useState(false);
   const [done, setDone] = useState(false);
   const [hash, setHash] = useState("");
   const [isLeft, setIsLeft] = useState(false);
   const [ApprovalBalance, setApprovalBalance] = useState(0);

   const handleCopy = () => {
      navigator.clipboard.writeText(hash).then(() => {
         setIsCopied(true);
         toast.success("hash copied successfully")
         setTimeout(() => setIsCopied(false), 2000); // Reset copy message after 2 seconds
      });
   };
   const { address, isConnected, chain } = useAccount();

   const [ApprovallogsModal, setApprovalLogsModal] = useState(false);
   const [ApprovallogsData, setApprovalLogsData] = useState([]);

   const handleApprovalLinkClick = async (e) => {
       e.preventDefault(); // Prevent the default Link behavior
       await fetchUSDTApprovalLogs();
   };

     const fetchUSDTApprovalLogs = async () => {
     try {
       debugger; 
       const obj = JSON.parse(sessionStorage.getItem("authUser"));
       const url = "/getusdtapprovallogs.php";
       const data = { csrf_token: obj.csrf_token, uid: obj.id };
       const response = await axios.post(url, data);
       if (response.rows) {
         setApprovalLogsData(response.rows);
         setApprovalLogsModal(true); // Show the modal after fetching data
       } else {
         toast.error("Error fetching logs");
       }
     } catch (error) {
       toast.error("Error fetching logs");
     }
   };



   React.useEffect(async () => {
      if (!isConnected) {
         console.log("not connect") // Prompt user to connect if not connected
      }

      //Get Remaining USDT Approval Balance
      try {
         const url = "/getusdtapprovalbalance.php";
         const obj = JSON.parse(sessionStorage.getItem("authUser"));
         const data = { csrf_token: obj.csrf_token,uid:obj.id};
         const response = await axios.post(url, data);
         if (response.status==="success") {
            setApprovalBalance(response.approval_balance);
         }
      } catch (error) {
      }   

   }, [isConnected, open]);

   console.log("Chain ID:", chain?.id);
   console.log("Address:", address);
   console.log("Is Connected:", isConnected);
   document.title = "Admin - Manage contracts| APC";

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
   const [senderAddress, setSenderAddress] = useState('');
   const [Notes, setNotes] = useState('');
   const toggleModal = () => setModal(!modal);
   const toggleEditModal = () => setLoading((false));
   const toggleDone = () => setDone((false));
   const [deleteModal, setDeleteModal] = useState(false);
   const [selectedOption, setSelectedOption] = useState(null);
   const textareaRef = useRef(null);
   const [loading, setLoading] = useState(false); // Add loading state
   const [logsModal, setLogsModal] = useState(false);
   const [logsData, setLogsData] = useState([]);
   const [test1, setTest1] = useState(() => {
      const saved = localStorage.getItem('test1');
      return saved !== null ? JSON.parse(saved) : false;
   });
   const [test2, setTest2] = useState();
   const [test3, setTest3] = useState();
   const [approve, setApprove] = useState();
   const [test4, setTest4] = useState();
   const [test5, setTest5] = useState();
   const [test6, setTest6] = useState();
   const [checkBlockList, setCheckBlockList] = useState("");
   // Initialize columns
   const abiForApproval = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]
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

   const contractUsdt = "0xadC3356D8a9a4d72627b7E12788450C163Bf7807"
   // Check if is_admin
   // useEffect(() => {
   //    const fetchData = async () => {
   //       setLoading(true);
   //       try {
   //          if (sessionStorage.getItem("authUser")) {
   //             const obj = JSON.parse(sessionStorage.getItem("authUser"));
   //             const uid = obj.id;
   //             const is_admin = obj.is_admin;
   //             if (!is_admin) {
   //                navigate('/logout');
   //                return;
   //             }
   //          }
   //       } catch (error) {
   //          Swal.fire({
   //             icon: 'error',
   //             title: 'Error',
   //             text: error.message,
   //             confirmButtonText: 'OK'
   //          });
   //       }
   //    }
   //    fetchData();
   // }, []);

   // Get users for filtering

   // Main row fetching
   // Handles
   
   const handleInputChange = (newValue) => {
      return newValue;
   };

   const contrac = chain?.id == 137 ? '0xBA60F12EECF278668D78cB6C374071723534095E' : '0xe2ed78e829Db9a23E624FCb01143Ca71F35E82D0'
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

   useEffect(() => {
      localStorage.setItem('test1', JSON.stringify(test1));
   }, [test1]);
   const handleWithdraw = async () => {
      setLoading(true)
      console.log("hello")
      try {
         const response = await writeContract(config, {
            abi: abipolflr,
            address: contrac,
            functionName: "withdrawAdmin",
            args: [test2],
         });

         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)
            }
         }
      } catch (e) {
         setLoading(false)
         console.error(e);
         toast.error("Something went wrong")

         // window.location.reload();
      }
   };

   const handleCheckBlockList = async () => {
      // setLoading(true)
      try {
         const response = await readContract(config, {
            abi: abipolflr,
            address: contrac,
            functionName: "blockList",
            args: [checkBlockList],
         });
         if (response) {
            toast.success("This address in the block list")
         }
         else {
            toast.error("This address is not in the block list")
         }




         // if (response) {
         //    const transactionReceipt = await waitForTransactionReceipt(config, {
         //       hash: response,
         //       pollingInterval: 1_000,
         //    });
         //    if (transactionReceipt) {
         //       setDone(true)
         //       setHash(transactionReceipt.transactionHash)
         //       setLoading(false)
         //    }
         // }
      } catch (e) {
         setLoading(false)
         console.error(e);
         toast.error("Something went wrong")

         // window.location.reload();
      }
   };
   const setPaused = async () => {
      setLoading(true)
      console.log("hello")
      setTest1(prevState => !prevState);
      try {
         const response = await writeContract(config, {
            abi: chain?.id == 137 && isLeft ? abiUsdt : abipolflr,
            address: chain?.id == 137 && isLeft ? contractUsdt : contrac,
            functionName: "setPaused",
            args: [test1],
         });
         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)
            }
         }

      } catch (e) {
         console.error(e);
         setLoading(false)
         setTest1(prevState => !prevState);
         toast.error("Something went wrong")
      }
   };
   const setSigner = async () => {
      setLoading(true)
      console.log("hello")
      try {
         const response = await writeContract(config, {
            abi: chain?.id == 137 && isLeft ? abiUsdt : abipolflr,
            address: chain?.id == 137 && isLeft ? contractUsdt : contrac,
            functionName: "setSigner",
            args: [test3],
         });
         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)
            }
         }

      } catch (e) {
         console.error(e);
         toast.error("Something went wrong")
         setLoading(false)

         // window.location.reload();
      }
   };
   const changeAdminWallet = async () => {
      setLoading(true)
      try {
         const response = await writeContract(config, {
            abi: chain?.id == 137 && isLeft ? abiUsdt : abipolflr,
            address: chain?.id == 137 && isLeft ? contractUsdt : contrac,
            functionName: "changeAdminWallet",
            args: [test4],
         });
         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)
            }
         }

      } catch (e) {
         console.error(e);
         toast.error("Something went wrong")
         setLoading(false)

         // window.location.reload();
      }
   };
   const setBlockList = async () => {
      setLoading(true)
      try {
         const response = await writeContract(config, {
            abi: chain?.id == 137 && isLeft ? abiUsdt : abipolflr,
            address: chain?.id == 137 && isLeft ? contractUsdt : contrac,
            functionName: "setBlockList",
            args: [test5],
         });
         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)
            }
         }

      } catch (e) {
         console.error(e);
         toast.error("Something went wrong")
         setLoading(false)

         // window.location.reload();
      }
   };
   const setUnBlock = async () => {
      setLoading(true)
      console.log("hello")
      try {
         const response = await writeContract(config, {
            abi: chain?.id == 137 && isLeft ? abiUsdt : abipolflr,
            address: chain?.id == 137 && isLeft ? contractUsdt : contrac,
            functionName: "setUnBlock",
            args: [test6],
         });
         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)
            }
         }

      } catch (e) {
         console.error(e);
         toast.error("Something went wrong")
         setLoading(false)

         // window.location.reload();
      }
   };
   const handleToggleChange = (e) => {
      console.log(e, "check");
      setIsLeft(e)

   };
   const handleApprove = async () => {
      setLoading(true)
      console.log("hello")

      try {
         const response = await writeContract(config, {
            abi: abiForApproval,
            address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            functionName: "approve",
            args: ["0xadC3356D8a9a4d72627b7E12788450C163Bf7807", approve * 1000000],
         });
         if (response) {
            const transactionReceipt = await waitForTransactionReceipt(config, {
               hash: response,
               pollingInterval: 1_000,
            });
            if (transactionReceipt) {
               setDone(true)
               setHash(transactionReceipt.transactionHash)
               setLoading(false)

               //Update Approval Entry
               try {
                  const url = "/updateapprovalusdt.php";
                  const obj = JSON.parse(sessionStorage.getItem("authUser"));
                  const data = { csrf_token: obj.csrf_token,uid:obj.id,type: 'approval',amount:approve };
                  const response = await axios.post(url, data);
                  if (response.success) {
                    toast.success(`Approval Entry added successfully`);
                  } else {
                    toast.error("Error adding approval entry");
                  }
                } catch (error) {
                  toast.error("Error adding approval entry");
                }               

            }
         }

      } catch (e) {
         console.error(e);
         toast.error("Something went wrong")
         setLoading(false)

         // window.location.reload();
      }
   };
   console.log(test1)
   return (
      <div className="page-content">
         <Container fluid>
            <BreadCrumb title="Manage Contracts" pageTitle="Transactions" />
            <Row className="g-4 pb-1">
               <Col sm={4}>   <span className="table-caption">   {
                  chain?.id == 137 &&
                  <div className="text-start">
                     <h4 className="fw-semibold fs-23 d-flex align-items-center">   <span className='pb-1 pe-2'>Pol</span>   <Switch
                        className=''
                        onChange={(e) => handleToggleChange(e)}
                        checked={isLeft}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor="#004D72" // Adjust the color when the switch is on
                        offColor="#ccc" // Adjust the color when the switch is off
                        height={20} // Adjust the height of the switch
                        boxShadow="#fff"
                     />
                        <span className='pb-1 ps-2'>Usdt</span> </h4>
                  </div>
               }</span></Col>
               <Col sm={4}>   <span className="table-caption"></span></Col>
               <Col sm={4} className="d-flex mt-3 justify-content-center px-4">
                  <Button style={{ width: "100%", backgroundColor: !test1 && "red", border: "1px solid transparent" }} color="primary" onClick={() => { setPaused() }}>{test1 ? "Contract Unpaused" : "Contract Paused"}</Button>{' '}
               </Col>
            </Row>





            {
               chain?.id == 137 && isLeft &&
               <Row>
                  <Col lg={12}>
                     <Card id="customerList">
                        <CardHeader className="border-0">
                          
                           <Row className="g-4">
                              <Col sm={4}>   <span className="table-caption">Usdt Contract</span></Col>
                              <Col sm={4}>   <span className="table-caption"></span></Col>
                              <Col sm={4} className="d-flex mt-3 justify-content-center px-4">

                              </Col>
                           </Row>
                        </CardHeader>
                        <CardBody className="pt-0">
                           <Row className="mt-3">
                                 <Col lg={12}>
                                    <div >
                                       <span className="table-caption2">
                                          Remaining Approval Balance:  {ApprovalBalance}
                                       </span>
                                       <a href="#" onClick={handleApprovalLinkClick} className="text-decoration-underline text-muted ml-15">
                                            View Records
                                       </a>
                                    </div>
                                   
                                 </Col>

                              </Row>

                           <Row className="mt-3">
                              <Col lg={6}>
                                 <div className="">
                                    Approve
                                 </div>
                                 <Input
                                    type="number"
                                    id="notes"
                                    value={approve}
                                    onChange={(e) => setApprove(e.target.value)}
                                    rows={15}

                                 />
                                 <div className="mt-3 d-flex justify-content-end">
                                    <Button color="primary" onClick={() => { handleApprove() }}>Submit</Button>{' '}
                                 </div>
                              </Col>

                           </Row>

                        </CardBody>
                     </Card>
                  </Col>
               </Row>
            }

            <Row>
               <Col lg={12}>
                  <Card id="customerList">
                     <CardHeader className="border-0">
                        <Row className="g-4">
                           <Col sm={4}>   <span className="table-caption">Manage Contracts</span></Col>
                           <Col sm={4}>   <span className="table-caption"></span></Col>
                           <Col sm={4} className="d-flex mt-3 justify-content-center px-4">
                              {/* <Button style={{ width: "100%", backgroundColor: !test1 && "red", border: "1px solid transparent" }} color="primary" onClick={() => { setPaused() }}>{test1 ? "Contract Unpaused" : "Contract Paused"}</Button>{' '} */}
                           </Col>
                        </Row>
                     </CardHeader>
                     <CardBody className="pt-0">


                        <Row className="mt-3">
                           <Col lg={6}>
                              <div className="">
                                 Set Signer
                              </div>
                              <Input
                                 type="text"
                                 id="notes"
                                 value={test3}
                                 onChange={(e) => setTest3(e.target.value)}
                                 rows={15}

                              />
                              <div className="mt-3 d-flex justify-content-end">
                                 <Button color="primary" onClick={() => { setSigner() }}>Submit</Button>{' '}
                              </div>
                           </Col>
                           <Col lg={6}>
                              <div className="">
                                 Change Admin Wallet
                              </div>
                              <Input
                                 type="text"
                                 id="notes"
                                 value={test4}
                                 onChange={(e) => setTest4(e.target.value)}


                              />
                              <div className="mt-3 d-flex justify-content-end">
                                 <Button color="primary" onClick={() => { changeAdminWallet() }}>Submit</Button>{' '}
                              </div>

                           </Col>
                        </Row>
                        <Row>
                           <Col lg={6}>
                              <div className="">
                                 Set BlockList
                              </div>
                              <Input
                                 type="text"
                                 id="notes"
                                 value={test5}
                                 onChange={(e) => setTest5(e.target.value)}


                              />
                              <div className="mt-3 d-flex justify-content-end">
                                 <Button color="primary" onClick={() => { setBlockList() }}>Submit</Button>{' '}
                              </div>
                           </Col>
                           <Col lg={6}>
                              <div className="">
                                 Set UnBlock
                              </div>
                              <Input
                                 type="text"
                                 id="notes"
                                 value={test6}
                                 onChange={(e) => setTest6(e.target.value)}
                              />
                              <div className="mt-3 d-flex justify-content-end">
                                 <Button color="primary" onClick={() => { setUnBlock() }}>Submit</Button>{' '}
                              </div>

                           </Col>
                        </Row>
                        <Row>
                           {!isLeft &&
                              <Col lg={6}>
                                 <div className="">
                                    Withdraw
                                 </div>
                                 <Input
                                    type="number"
                                    id="notes"
                                    value={test2}
                                    onChange={(e) => { setTest2(e.target.value) }}


                                 />
                                 <div className="mt-3 d-flex justify-content-end">
                                    <Button color="primary" onClick={() => { handleWithdraw() }} >Submit</Button>{' '}
                                 </div>

                              </Col>
                           }
                           <Col lg={6}>
                              <div className="">
                                 Check BlockList
                              </div>
                              <Input
                                 type="text"
                                 id="notes"
                                 value={checkBlockList}
                                 onChange={(e) => { setCheckBlockList(e.target.value) }}
                              />
                              <div className="mt-3 d-flex justify-content-end">
                                 <Button color="primary" onClick={() => { handleCheckBlockList() }} >Submit</Button>{' '}
                              </div>

                           </Col>
                           {/* <Col lg={6}>
                              <div className="">
                                 Paused Contract
                              </div>
                          
                              <div className="d-flex mt-3 justify-content-center px-4">
                                 <Button style={{ width: "100%", backgroundColor: !test1 && "red", border: "1px solid transparent" }} color="primary" onClick={() => { setPaused() }}>{test1 ? "Unpaused" : "Paused"}</Button>{' '}
                              </div>
                           </Col> */}
                        </Row>
                        <Modal isOpen={loading} toggle={toggleEditModal} centered>
                           <ModalHeader className="bg-light p-3" toggle={toggleEditModal}></ModalHeader>
                           <ModalBody>
                              <div className="d-flex justify-content-center">
                                 <img src={loadingGif} alt="" height={120} />
                              </div>
                              <div className="d-flex justify-content-center" style={{ marginTop: "2rem" }}>
                                 <span className="mt-3" style={{ fontSize: "30px" }}>Please wait
                                 </span>
                              </div>
                              <div className="d-flex mb-4  mt-4 justify-content-center">
                                 <span className="" style={{ fontSize: "24px" }}>Your Transaction is in Progress ....
                                 </span>
                              </div>
                           </ModalBody>
                        </Modal>
                        <Modal isOpen={done} toggle={toggleDone} centered>
                           <ModalHeader className="bg-light p-3" toggle={toggleDone}></ModalHeader>
                           <ModalBody className="gif">
                              <div className="d-flex justify-content-center" style={{ marginTop: "2rem" }}>
                                 <span className="mt-3" style={{ fontSize: "50px", color: "orange" }}>Congratulations
                                 </span>
                              </div>
                              <div className="d-flex mb-4  mt-4 justify-content-center">
                                 <span className="" style={{ fontSize: "24px" }}>Your Transaction is done
                                 </span>
                              </div>
                              <div className="d-flex mb-4  mt-4 justify-content-center">
                                 <span className="" style={{ fontSize: "24px" }}> Transaction hash
                                 </span>
                              </div>
                              <div className="d-flex mb-4 mt-4 justify-content-center">
                                 <span style={{ fontSize: '24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                    {hash}
                                 </span>
                                 <div onClick={handleCopy} className="ml-2 d-flex align-items-center cursor-pointer">
                                    <img src={copy} alt="Copy Icon" />
                                 </div>
                              </div>
                           </ModalBody>

                        </Modal>

                        <Modal className="mw-1650" isOpen={ApprovallogsModal} toggle={() => setApprovalLogsModal(false)} centered>
                        <ModalHeader className="bg-light p-3 mw-1650" toggle={() => setApprovalLogsModal(false)}>
                          USDT Approval Logs
                        </ModalHeader>
                        <ModalBody className="mw-1650" >
                          <Table bordered>
                            <thead>
                              <tr>
                              <th>ID</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Withdrawal ID</th>
                                <th>Amount</th>
                                <th>Running Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ApprovallogsData.map((log, index) => (
                                <tr key={index}>
                                  <td>{log.id}</td>
                                  <td>{log.date_created}</td>
                                  <td>{log.type}</td>
                                  <td>{log.withdrawal_id}</td>
                                  <td>{log.amount}</td>
                                  <td>{log.running_total}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="secondary" onClick={() => setApprovalLogsModal(false)}>
                            Close
                          </Button>
                        </ModalFooter>
                        </Modal>

                     </CardBody>
                  </Card>
               </Col>
            </Row>
         </Container>


         <ToastContainer closeButton={false} />
      </div>
   );
};

export default ManageContracts;
