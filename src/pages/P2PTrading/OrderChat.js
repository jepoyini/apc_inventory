import React, { useEffect, useRef, useState } from "react";
import { P2PApi } from "../../helpers/p2p_api";
import { Button, Input } from "reactstrap";

export default function OrderChat({ orderId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const fileRef = useRef();

  const load = async () => {
    if (!orderId) return;
    const obj = JSON.parse(sessionStorage.getItem("authUser")) || {};
    const uid = obj?.id;    
    const res = await P2PApi.listMessages({uid:uid,orderid:orderId});
    setMessages(res.messages || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [orderId]);

  const send = async () => {
    if (!text && !fileRef.current?.files?.length) return;

    let payload;
    const file = fileRef.current?.files?.[0];
    if (file) {
      payload = new FormData();
      payload.append("order_id", orderId);
      payload.append("message_text", text || "");
      payload.append("file", file);
    } else {
      payload = { order_id: orderId, message_text: text };
    }

    await P2PApi.postMessage(payload);
    setText("");
    if (fileRef.current) fileRef.current.value = "";
    await load();
  };

  return (
    <div className="border rounded p-2" style={{ minHeight: 260 }}>
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <small className="text-muted">
              {m.sender_username} · {new Date(m.created_at).toLocaleString()}
            </small>
            {m.message_text && <div>{m.message_text}</div>}
            {m.file_url && (
              <div>
                <a href={m.file_url} target="_blank" rel="noreferrer">
                  Attachment
                </a>
              </div>
            )}
          </div>
        ))}
        {!messages.length && <div className="text-muted">No messages yet.</div>}
      </div>
      <div className="d-flex gap-2 mt-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <input type="file" ref={fileRef} />
        <Button color="primary" onClick={send}>
          <i className="ri-send-plane-2-line" />
        </Button>
      </div>
    </div>
  );
}
