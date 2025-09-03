import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, Table } from 'reactstrap';
import { APIClient } from "../../helpers/api_helper";
import BreadCrumb from '../../Components/Common/BreadCrumb';

const OrderHistory = () => {
  document.title = "Order History | APC Inventory";
  const api = new APIClient();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));

    api.get(`/orderhistory/${obj.id}`).then(response => {
      if (response.success) {
        setOrders(response.orders);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Orde33 History" pageTitle="Dashboard" url="/dashboard" />

        <Row>
          <Col lg={12}>
            <Card>
              
              <CardBody>
                <h4 className="card-title">Your Purchase History</h4>
                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <Table className="table-hover mt-4" responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No purchases yet.</td>
                        </tr>
                      ) : (
                        orders.map((order, index) => (
                          <tr key={order.id}>
                            <td>{index + 1}</td>
                            <td>{order.title}</td>
                            <td>${parseFloat(order.amount).toFixed(2)}</td>
                            <td>{new Date(order.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OrderHistory;
