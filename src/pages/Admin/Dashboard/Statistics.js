import React from 'react';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import { format } from "date-fns";

const Statistics =  ({ Maindata, setFromdate, setTodate })  => {
    const today = new Date();
    const formattedToday = format(today, "yyyy-MM-dd");

    const handleDateChange = (selectedDates) => {
        if (selectedDates.length === 2) {
          setFromdate(format(selectedDates[0], "yyyy-MM-dd"));
          setTodate(format(selectedDates[1], "yyyy-MM-dd"));
        } else if (selectedDates.length === 1) {
          setFromdate(format(selectedDates[0], "yyyy-MM-dd"));
          setTodate("");
        } else {
          setFromdate("");
          setTodate("");
        }
      };
    return (
        <React.Fragment>
            <Col xl={4}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Statistics</h4>
                        <div className="flex-shrink-0">
                        <div className="input-group">
                            <span className="input-group-text" id="basic-addon1"><i className="ri-calendar-2-line"></i></span>
                                <Flatpickr
                                    placeholder="Select date"
                                    className="form-control minw250"
                                    options={{
                                        mode: "range",
                                        dateFormat: "d M, Y",
                                        defaultDate: [today, today] 
                                    }}
                                    onChange={handleDateChange}
                                />
                        </div>
                </div>
                    </CardHeader>

                    <CardBody>

                        <div className="px-2 py-2 mt-1">
                            <p className="mtop-2 mb-1">Member Signups <span className="float-end">{Maindata.memberlogins}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>                            
                            <p className="mtop-2 mb-1">Member Logins <span className="float-end">{Maindata.memberlogins}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}>
                            </div>                            
                            <p className="mtop-2 mb-1">Donate Plan 10 <span className="float-end">{Maindata.purchased_plan10}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 50 <span className="float-end">{Maindata.purchased_plan50}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 100 <span className="float-end">{Maindata.purchased_plan100}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 250 <span className="float-end">{Maindata.purchased_plan250}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 500 <span className="float-end">{Maindata.purchased_plan500}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 1000 <span className="float-end">{Maindata.purchased_plan1000}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 2500 <span className="float-end">{Maindata.purchased_plan2500}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 5000 <span className="float-end">{Maindata.purchased_plan5000}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 7500 <span className="float-end">{Maindata.purchased_plan7500}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 10000 <span className="float-end">{Maindata.purchased_plan10000}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 15000 <span className="float-end">{Maindata.purchased_plan15000}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>
                            <p className="mtop-2 mb-1">Purchased Plan 20000 <span className="float-end">{Maindata.purchased_plan20000}</span></p>
                            <div className="progress mt-2" style={{ height: "2px" }}></div>

                        </div>

                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default Statistics;