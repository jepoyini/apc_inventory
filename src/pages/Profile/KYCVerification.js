import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Label,
  Input,Container
} from "reactstrap";
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Link } from "react-router-dom";
import vertication from "../../assets/images/verification-img.png";
import classnames from "classnames";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";

const KYCVerification = () => {
  const [isKycVerification, setIsKycVerification] = useState(false);
  const toggleKycVerification = () => setIsKycVerification(!isKycVerification);
  const [activeTab, setActiveTab] = useState(1);
  const [passedSteps, setPassedSteps] = useState([1]);
  const [selectedFiles, setselectedFiles] = useState([]);
  const navigate = useNavigate();

  function toggleTab(tab) {
    if (activeTab !== tab) {
      var modifiedSteps = [...passedSteps, tab];

      if (tab >= 1 && tab <= 3) {
        setActiveTab(tab);
        setPassedSteps(modifiedSteps);
      }
    }
  }

  const [selectCountry, setselectCountry] = useState(null);

  function handleselectCountry(selectCountry) {
    setselectCountry(selectCountry);
  }
  /**
   * Formats the size
   */
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function handleAcceptedFiles(files) {
    files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    );
    setselectedFiles(files);
  }

  const country = [
    {
      options: [
        { label: "Select country", value: "Select country" },
        { label: "Argentina", value: "Argentina" },
        { label: "Belgium", value: "Belgium" },
        { label: "Brazil", value: "Brazil" },
        { label: "Colombia", value: "Colombia" },
        { label: "Denmark", value: "Denmark" },
        { label: "France", value: "France" },
        { label: "Germany", value: "Germany" },
        { label: "Mexico", value: "Mexico" },
        { label: "Russia", value: "Russia" },
        { label: "Spain", value: "Spain" },
        { label: "Syria", value: "Syria" },
        { label: "United Kingdom", value: "United Kingdom" },
        {
          label: "United States of America",
          value: "United States of America",
        },
      ],
    },
  ];

  return (


  <React.Fragment>
  <div className="page-content">
      <Container fluid>
          <BreadCrumb title="KYC Verification" pageTitle="Dashboard" url="/dashboard" />
          <Row className="justify-content-center">
        <Col lg={6}>
          <Card>
            <CardBody>
              <div className="text-center">
                <Row className="justify-content-center">
                  <Col lg={9}>
                    <h4 className="mt-4 fw-semibold">KYC Verification</h4>
                    <p className="text-muted mt-3">
                      Once your KYC verification is complete, you'll gain full access to your account and wallet, including features like fund transfers, withdrawals, and more.{" "}
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={toggleKycVerification}
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        Click here for Verification
                      </button>
                    </div>
                  </Col>
                </Row>

                <Row className="justify-content-center mt-5 mb-2">
                  <Col sm={7} xs={8}>
                    <img src={vertication} alt="" className="img-fluid" />
                  </Col>
                </Row>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Modal
        isOpen={isKycVerification}
        toggle={toggleKycVerification}
        centered={true}
        size="lg"
      >
        <ModalHeader
          className="p-3 text-uppercase"
          toggle={toggleKycVerification}
        >
          Verify your Account
        </ModalHeader>
        <form action="#" className="checkout-tab">
          <ModalBody className="p-0">
            <div className="step-arrow-nav">
              <Nav
                className="nav-pills nav-justified custom-nav"
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === 1, done: (activeTab <= 3 && activeTab >= 0) }, "p-3")}
                    // onClick={() => {
                    //   toggleTab(1);
                    // }}
                  >
                    Personal Info
                  </NavLink>
                </NavItem>
               
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === 2, done: activeTab <= 3 && activeTab > 1 }, "p-3")}
                    // onClick={() => {
                    //   toggleTab(2);
                    // }}
                  >
                    Document Verification
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === 3, done: activeTab <= 3 && activeTab > 2 }, "p-3")}
                    // onClick={() => {
                    //   toggleTab(3);
                    // }}
                  >
                    Verified
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </ModalBody>
          <div className="modal-body">
            <TabContent activeTab={activeTab}>
              <TabPane tabId={1}>
                <Row className="g-3">
                  <Col lg={6}>
                    <div>
                      <Label for="firstName" className="form-label">
                        First Name
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="firstName"
                        placeholder="Enter your firstname"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div>
                      <Label for="lastName" className="form-label">
                        Last Name
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="lastName"
                        placeholder="Enter your lastname"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div>
                      <Label for="phoneNumber" className="form-label">
                        Phone
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div>
                      <Label for="dateofBirth" className="form-label">
                        Date of Birth
                      </Label>
                      <Flatpickr
                        className="form-control"
                        options={{
                          dateFormat: "d M, Y",
                        }}
                        placeholder="Enter your date of birth"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div>
                      <Label for="emailID" className="form-label">
                        Email ID
                      </Label>
                      <Input
                        type="email"
                        className="form-control"
                        id="emailID"
                        placeholder="Enter your email"
                      />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div>
                      <Label for="vatNo" className="form-label">
                        VAT/TIN No.
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="vatNo"
                        placeholder="Enter your VAT/TIN no"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div>
                      <Label for="serviceTax" className="form-label">
                        Service Tax No.
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="serviceTax"
                        placeholder="Enter your service tax no"
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div>
                      <Label for="country-select" className="form-label">
                        Country
                      </Label>
                      <Select
                            className="mb-0"
                            value={selectCountry}
                            onChange={(selectedOption) => handleselectCountry(selectedOption)}
                            options={country}
                            id="country-select"
                        />
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="d-flex align-items-start gap-3 mt-3">
                      <button
                        onClick={() => {
                          toggleTab(activeTab + 1);
                        }}
                        type="button"
                        className="btn btn-primary btn-label right ms-auto nexttab"
                      >
                        <i className="ri-arrow-right-line label-icon align-middle fs-16 ms-2"></i>{" "}
                        Next Step
                      </button>
                    </div>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tabId={2}>
                <h5 className="mb-3">Choose Document Type</h5>

                <div className="d-flex gap-2">
                  <div>
                    <Input
                      type="radio"
                      className="btn-check"
                      id="passport"
                      defaultChecked
                      name="choose-document"
                    />
                    <Label className="btn btn-outline-info" for="passport">
                      Passport
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="radio"
                      className="btn-check"
                      id="aadhar-card"
                      name="choose-document"
                    />
                    <Label className="btn btn-outline-info" for="aadhar-card">
                      Driver's License
                    </Label>
                  </div>
                  
                  <div>
                    <Input
                      type="radio"
                      className="btn-check"
                      id="other"
                      name="choose-document"
                    />
                    <Label className="btn btn-outline-info" for="other">
                      Other
                    </Label>
                  </div>
                </div>

                <Dropzone
                  onDrop={(acceptedFiles) => {
                    handleAcceptedFiles(acceptedFiles);
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div className="dropzone dz-clickable">
                      <div
                        className="dz-message needsclick pt-4"
                        {...getRootProps()}
                      >
                        <div className="mb-3">
                          <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                        </div>
                        <h4>Drop files here or click to upload.</h4>
                      </div>
                    </div>
                  )}
                </Dropzone>
                <div className="list-unstyled mb-0" id="file-previews">
                  {selectedFiles.map((f, i) => {
                    return (
                      <Card
                        className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                        key={i + "-file"}
                      >
                        <div className="p-2">
                          <Row className="align-items-center">
                            <Col className="col-auto">
                              <img
                                data-dz-thumbnail=""
                                height="80"
                                className="avatar-sm rounded bg-light"
                                alt={f.name}
                                src={f.preview}
                              />
                            </Col>
                            <Col>
                              <Link
                                to="#"
                                className="text-muted font-weight-bold"
                              >
                                {f.name}
                              </Link>
                              <p className="mb-0">
                                <strong>{f.formattedSize}</strong>
                              </p>
                            </Col>
                          </Row>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="d-flex align-items-start gap-3 mt-4">
                  <button
                    onClick={() => {
                      toggleTab(activeTab - 1);
                    }}
                    type="button"
                    className="btn btn-light btn-label previestab"
                    data-previous="pills-bill-address-tab"
                  >
                    <i className="ri-arrow-left-line label-icon align-middle fs-16 me-2"></i>
                    Back to Personal Info
                  </button>
                  <button
                    onClick={() => {
                      toggleTab(activeTab + 1);
                    }}
                    type="button"
                    className="btn btn-primary btn-label right ms-auto nexttab"
                    data-nexttab="pills-finish-tab"
                  >
                    <i className="ri-save-line label-icon align-middle fs-16 ms-2"></i>
                    Submit
                  </button>
                </div>
              </TabPane>

              <TabPane tabId={3}>
                <Row className="text-center justify-content-center">
                  <Col lg={12}>
                    <div className="mb-4">
                      <lord-icon
                        src="https://cdn.lordicon.com/lupuorrc.json"
                        trigger="loop"
                        colors="primary:#0ab39c,secondary:#405189"
                        style={{ width: "120px", height: "120px" }}
                      ></lord-icon>
                    </div>
                    <h5>Verification Completed</h5>
                    <p className="text-muted mb-4">
                    Your account is now verified, granting you full access to all site features. To maintain your verification status, please contact our support team if you need to update any information from your submitted documents.
                    </p>
                    <br></br>
                    <div className="hstack justify-content-center gap-2">
                     
                      <button
                          onClick={() => navigate("/dashboard")}
                          type="button"
                          className="btn btn-primary"
                      >
                          <i className="ri-home-4-line align-bottom ms-1"></i> Back to Home
                      </button>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </div>
        </form>
      </Modal>
      </Container>

  </div>


</React.Fragment>


);

};

export default KYCVerification;
