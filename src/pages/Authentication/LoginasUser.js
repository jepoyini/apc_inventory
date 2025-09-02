import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APIClient } from "../../helpers/api_helper";
import { setAuthToken } from "../../helpers/api_helper"; 

const LoginAsUser = () => {
  const api = new APIClient();
  const navigate = useNavigate();
  // Check if is_admin
  useEffect(() => {
    const fetchData =  () => {

      try {
        if (sessionStorage.getItem("authUser")) {

          const obj = JSON.parse(sessionStorage.getItem("authUser"));
          const uid = obj.id;
          const is_admin =obj.is_admin; 
          if (!is_admin)
          {
            navigate('/accessdenied');
            return; 
          }

          // Go
            // Function to set sessionStorage and redirect
            const setSessionAndRedirect = async (inputValue) => {

                const url = "/loginasuser";
                const data = { id: inputValue , uid: uid };

                const response = await api.post(url, data);

                let result = response.data ? response.data : response;
                if (result.id) {
                  const user = result;
                  var finallogin = JSON.stringify(user);
                  sessionStorage.setItem("authUser", finallogin);
                  debugger;
                  // Update axios headers dynamically
                  setAuthToken(user.csrf_token);      
                  navigate('/dashboard');
                    // var finallogin = JSON.stringify(response);
                    // finallogin = JSON.parse(finallogin)
              
                    // if (finallogin.status === "success") {
                    //   sessionStorage.setItem("csrf_token", finallogin.session);
                    //   sessionStorage.setItem("authUser", JSON.stringify({
                    //     id: finallogin.data.id || "",
                    //     firstname: finallogin.data.firstname || "",
                    //     lastname: finallogin.data.lastname || "",
                    //     username: finallogin.data.username || "",
                    //     email: finallogin.data.email || "",
                    //     phone: finallogin.data.phone || "",
                    //     address: finallogin.data.address || "",
                    //     city: finallogin.data.city || "",
                    //     country: finallogin.data.country || "",
                    //     zip: finallogin.data.zip || "",
                    //     avatar: finallogin.data.avatar,
                    //     is_admin: finallogin.data.is_admin,
                    //     date_created: finallogin.data.date_created,
                    //     sponsor_id: finallogin.data.sponsor_id,
                    //     sponsor_name: finallogin.data.sponsor_name,
                    //     status: finallogin.data.status,
                    //     replicated_link: finallogin.data.replicated_link,
                    //     payment_wallet_address: finallogin.data.payment_wallet_address,
                    //     payment_current_password: finallogin.data.payment_current_password,
                    //     withdrawal_wallet_address: finallogin.data.withdrawal_wallet_address,
                    //     withdrawal_current_password: finallogin.data.withdrawal_current_password,
                    //     coinbase_wallet: finallogin.data.coinbase_wallet,
                    //     enable_2fa: finallogin.data.enable_2fa,
                    //     email_notification: finallogin.data.email_notification,
                    //     comm_notification: finallogin.data.comm_notification,
                    //     deleted: finallogin.data.deleted,
                    //     pwd: "",
                    //     newpwd: "",
                    //     aid: finallogin.data.aid,
                    //     csrf_token: finallogin.session
                    // }));

                    // navigate('/dashboard');

                    // }
              
                }

            };
        
            // Extract the input value from the URL query parameter
            const queryParams = new URLSearchParams(window.location.search);
            const inputValue = queryParams.get('authUser');

            // Call the function with the extracted input value
            if (inputValue) {

                if (inputValue === '1' || inputValue ==='2')
                {
                    navigate('/404');
                    return; 
                } else {
                  setSessionAndRedirect(inputValue);
                }
            } else {
                console.error('No input value provided');
            }

        }

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonText: 'OK'
        });
      }
    }
    fetchData();
  }, []);


  return (
    <div>
      {/* You can display a loading indicator or message here if needed */}
      <p>Loading...</p>
    </div>
  );
};

export default LoginAsUser;
