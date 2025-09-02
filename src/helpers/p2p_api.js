import { APIClient } from "./api_helper";

const api = new APIClient();
const base = "/p2p";


// pull uid for header
function userId() {
  try {
    const obj = JSON.parse(sessionStorage.getItem("authUser")) || {};
    return obj?.id || "";
  } catch {
    return "";
  }
}

function withUidHeaders(extra = {}) {
  const uid = userId();
  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      "X-User-Id": uid ? String(uid) : "",
    },
  };
}

// Utility to always attach uid from session
function withUid(payload = {}) {
  const obj = JSON.parse(sessionStorage.getItem("authUser")) || {};
  const uid = obj?.id;
  return { uid: uid, ...payload };
}

export const P2PApi = {
  // catalogs (POST-only)
  listAssets:  () => api.post(`${base}/assets`, {}),
  listFiats:   () => api.post(`${base}/fiats`, {}),
  listPaymentMethods: () => api.post(`${base}/payment-methods`, {}),

  // user payment methods (POST-only, requires uid in payload)
  myPaymentMethods: (uid) =>
    api.post(`${base}/me/payment-methods/list`, { uid }),
  addMyPaymentMethod: (payload) =>
    api.post(`${base}/me/payment-methods/create`, payload), // {uid, payment_method_id, account_label, account_details}
  updateMyPaymentMethod: (payload) =>
    api.post(`${base}/me/payment-methods/update`, payload), // {uid, id, ...}
  deleteMyPaymentMethod: (payload) =>
    api.post(`${base}/me/payment-methods/delete`, payload), // {uid, id}

  // offers (POST-only)
  listOffers: (params) => api.post(`${base}/offers/list`, params, withUidHeaders()), // {side, asset_id?, fiat_id?}
  getOffer: (id) => api.post(`${base}/offers/get`, { id }),
  createOffer: (payload) => api.post(`${base}/offers/create`, payload),
  setOfferStatus: (id, status) => api.post(`${base}/offers/set-status`, { id, status }),
  modifyOffer: (payload) => api.post(`${base}/offers/modify`, withUid(payload)),
  cancelOffer: (payload) => api.post(`${base}/offers/cancel`,  withUid(payload)),
  listPaymentMethods: () => api.post(`${base}/payment-methods`, {}, withUidHeaders()),
  myOffers: (payload) => api.post(`${base}/offers/myoffers`, withUid(payload)),
  setOfferStatus: (payload) => api.post(`${base}/offers/setofferstatus`, withUid(payload)),


  // orders (POST-only)
  placeOrder: (payload) => api.post(`${base}/orders/place`, payload),          // {offer_id, amount_asset, payment_method_id}
  listOrders: (params) => api.post(`${base}/orders/list`, params),             // {role?, status?}
  getOrder: (payload) => api.post(`${base}/orders/get`, payload),
  markPaid: (payload) => api.post(`${base}/orders/mark-paid`, payload),        // {id, payment_method_id?, user_payment_method_id?, amount_paid_fiat?, reference_text?, note?}
  release: (payload) => api.post(`${base}/orders/release`,payload),
  cancel: (payload) => api.post(`${base}/orders/cancel`, payload),
  expire: (id) => api.post(`${base}/orders/expire`, { id }),

  // order chat (POST-only)
  listMessages: (payload) => api.post(`${base}/orders/messages/list`,payload),
  postMessage: (payload, opts) => api.post(
    `${base}/orders/messages/post`,
    payload,
    { isMultipart: !!(payload instanceof FormData) }
  ),

  // payment proof (POST-only, multipart)
  uploadPaymentProof: (order_id, file) => {
    const form = new FormData();
    form.append("order_id", order_id);
    form.append("proof", file);
    return api.post(`${base}/orders/payment-proof`, form, { isMultipart: true });
  },

  // disputes (POST-only)
  openDispute: (payload) => api.post(`${base}/disputes/open`, payload),        // {order_id, reason_code, description?}
  getDispute: (id) => api.post(`${base}/disputes/get`, { id }),
  postDisputeMessage: (payload) =>
    api.post(`${base}/disputes/messages/post`, payload, { isMultipart: !!(payload instanceof FormData) }),
  resolveDispute: (payload) => api.post(`${base}/disputes/resolve`, payload),

  // ratings
  rate: (payload) => api.post(`${base}/orders/rate`, payload),                 // {order_id, score, comment?}

  // --- Order chat ---
  listOrderMessages: ({ order_id }) =>
    api.post(`${base}/orders/${order_id}/messages/list`, { order_id }, withUidHeaders()),

  postOrderMessage: ({ order_id, message_text }) =>
    api.post(`${base}/orders/${order_id}/messages/post`, { order_id, message_text }, withUidHeaders()),

  uploadOrderMessageFile: async (order_id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    // The APIClient.post should detect FormData and not set content-type
    return api.post(`${base}/orders/${order_id}/messages/post`, fd, withUidHeaders());
  },

  // --- Payment proof upload (kept for order actions) ---
  uploadPaymentProof: async (orderId, file) => {
    const fd = new FormData();
    fd.append("proof", file);
    return api.post(`${base}/orders/${orderId}/upload-proof`, fd, withUidHeaders());
  },


};
