import axios from "axios";
import { api } from "../config";
import Swal from "sweetalert2";

let navigate = null; // Global variable to store navigation function

/**
 * Set the navigation function (to be set in a component)
 */
export const setNavigate = (navFunction) => {
  navigate = navFunction;
};


// default
axios.defaults.baseURL = api.API_URL;
// content type
axios.defaults.headers.post["Content-Type"] = "application/json";


export const setAuthToken = (token) => {

  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    sessionStorage.setItem("authToken", token); // Store token persistently
  } else {
    delete axios.defaults.headers.common["Authorization"];
    sessionStorage.removeItem("authToken"); // Remove token on logout
  }
};

const authUserRaw = sessionStorage.getItem("authUser");

let storedToken = null;
if (authUserRaw) {
  try {
    const authUser = JSON.parse(authUserRaw);
    storedToken = authUser?.csrf_token || null;
  } catch (error) {
    sessionStorage.removeItem("authUser"); // Remove token on logout
    sessionStorage.removeItem("authToken"); // Remove token on logout
    storedToken = null; // Set to null if parsing fails
  }

}

  setAuthToken(storedToken);

// intercepting to capture errors
axios.interceptors.response.use(
  function (response) {
    return  response.data ? response.data : response;
  },
  function (error) {
debugger; 
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    let message;
    switch (error.status) {
      case 500:
        message = "Internal Server Error";
        break;
      case 401:
        message = "Invalid credentials";
        sessionStorage.removeItem("authUser"); // Clear session storage
        sessionStorage.removeItem("authToken");
        
        break;
      case 404:
        message = "Sorry! the data you are looking for could not be found";
        break;
      default:
        let msg = "";
        try {
          // Try to parse CodeIgniter error
          const data = JSON.parse(error?.request?.responseText || "{}");
          msg = data?.messages?.error || data?.message || msg;
        } catch (e) {
          // fallback to Axios' parsed response (if any)
          msg = error?.response?.data?.messages?.error ||
                error?.response?.data?.message ||
                error?.message ||
                msg;
        }
        message = msg;
    }
    return Promise.reject(message);
  }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */

  //  get = (url, params) => {
  //   return axios.get(url, params);
  // };
  get = (url, params) => {

    let response;

    let paramKeys = [];

    if (params) {
      Object.keys(params).map(key => {
        paramKeys.push(key + '=' + params[key]);
        return paramKeys;
      });

      const queryString = paramKeys && paramKeys.length ? paramKeys.join('&') : "";
      response = axios.get(`${url}?${queryString}`, params);
    } else {
      response = axios.get(`${url}`, params);
    }

    return response;
  };
  /**
   * post given data to url
   */
  create = (url, data) => {
    let response;
    response = axios.post(url, data);
    return response;
  };
  post = async (url, data,options = { showLoader: false }) => {

   // If it's FormData, let Axios set multipart headers automatically
    if (data instanceof FormData) {
      axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
    }

    try {
      if (options.showLoader) {
        Swal.fire({
          title: 'Processing...',
          text: 'Please wait while we processing your request.',          
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
      }
  
      const response = await axios.post(url, data);
  
      if (options.showLoader) Swal.close();
  
      return response;
    } catch (error) {
      if (options.showLoader) Swal.close();
  
      if (error==="Invalid credentials") {
        Swal.fire({
          icon: "error",
          title: "Access Denied!",
          text: "Invalid Credentials or session timed out.",
        }).then(() => {
          navigate("/logout");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Access Denied!",
          text: error || "Something went wrong.",
        });
      }
  
      return Promise.reject(error);
    }

  };  
  /**
   * Updates data
   */
  update = (url, data) => {
    return axios.patch(url, data);
  };

  put = (url, data) => {
    return axios.put(url, data);
  };
  /**
   * Delete
   */
  delete = (url, config) => {
    return axios.delete(url, { ...config });
  };
}
const getLoggedinUser = () => {
  const user = sessionStorage.getItem("authUser");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };