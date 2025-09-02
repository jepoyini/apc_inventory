import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
import { recentOrders } from '../../common/data';
import axios from 'axios';
import Swal from 'sweetalert2';

const RecentOrders = () => {

    const [Earnings,setEarnings] = useState();

    function FetchData()
    {
        const fetchData = async () => {
            if (sessionStorage.getItem("authUser")) {
                const obj = JSON.parse(sessionStorage.getItem("authUser"));
                const uid = obj.id;
                const url = '/earnings.php';
                const response = await axios.post(url,{id:uid});
                setEarnings(response.rows)
            }
        }
        fetchData();
    }

    useEffect(() => {
        FetchData();
    }, []);

    return (
        <React.Fragment>
            <Col xl={8}>
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Recent Earnings</h4>
                        <div className="flex-shrink-0">
                        <Link to="/apps-ecommerce-order-details" className="fw-medium link-primary">View All Earnings</Link>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive table-card">
                            <table className="table table-hover table-borderless table-striped table-centered align-middle table-nowrap mb-0">
                                <thead className="text-muted table-light">
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">From</th>
                                        <th scope="col">Plan</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(recentOrders || []).map((item, key) => (<tr key={key}>
                                        <td>
                                            <Link to="/apps-ecommerce-order-details" className="fw-medium link-primary">{item.orderId}</Link>
                                        </td>
                                        <td>{item.date}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="flex-shrink-0 me-2">
                                                    <img src={item.img} alt="" className="avatar-xs rounded-circle" />
                                                </div>
                                                <div className="flex-grow-1">{item.name}</div>
                                            </div>
                                        </td>
                                        <td>{item.plan}</td>
                                        <td>
                                            <span className="text-success">${item.amount}</span>
                                        </td>
                                        <td>
                                        <span className={`badge bg-${item.statusClass}-subtle text-${item.statusClass}`}>{item.status}</span>
                                        </td>
                                        
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default RecentOrders;