import React, { useMemo,useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
// import TableContainer from "../../Components/Common/TableContainerReactTable";
import TableContainer from "../../Components/Common/TableContainer";
import { recentOrders } from '../../common/data';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Spinner } from 'reactstrap';

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


    const columns = useMemo(
        () => [
          {
            header: "ID",
            cell: (cell) => {
              return (
                <span className="fw-semibold">{cell.getValue()}</span>
              );
            },
            accessorKey: "id",
            enableColumnFilter: false,
          },
    
          {
            header: "Date",
            accessorKey: "date_created",
            enableColumnFilter: false,
          },
          {
            header: "From",
            accessorKey: "from",
            enableColumnFilter: false,
          },
          {
            header: "Plan",
            accessorKey: "plan",
            enableColumnFilter: false,
          },
          {
            header: "Amount",
            accessorKey: "amount",
            enableColumnFilter: false,
          },
          {
            header: "Status",
            accessorKey: "status",
            enableColumnFilter: false,
          }          
        ],
        []
      );

    return (
        <React.Fragment>
            <Col xl={8}>
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Recent Earnings</h4>
                        <div className="flex-shrink-0">
                        <Link to="/earnings" className="fw-medium link-primary">View All Earnings</Link>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive table-card table table-hover table-borderless table-striped table-centered align-middle table-nowrap mb-0">
                            <TableContainer
                                columns={(columns || [])}
                                data={(Earnings || [])}
                                SearchPlaceholder='Search...'
                            />
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default RecentOrders;