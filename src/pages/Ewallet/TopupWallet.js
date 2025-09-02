import React, { useState } from "react";
import { QRCodeCanvas } from 'qrcode.react';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert
} from "reactstrap";

const walletAddresses = {
  USDT: "0x1234567890abcdefUSDT",
  BTC: "bc1qexamplebtcaddress",
  ETH: "0xabcdef1234567890ETH"
};

const TopupWallet = () => {
  const [cryptoType, setCryptoType] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const walletAddress = walletAddresses[cryptoType];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!txHash || !senderAddress) return alert("Please fill in all fields.");
    setSubmitted(true);
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Top-Up Wallet</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="cryptoType">Select Crypto</Label>
              <Input
                type="select"
                value={cryptoType}
                onChange={(e) => setCryptoType(e.target.value)}
              >
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </Input>
            </FormGroup>

            <FormGroup>
              <Label for="amount">Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </FormGroup>

            <h5>Scan this QR Code to Send</h5>
            <QRCodeCanvas value={walletAddress} size={200} />
            <p className="mt-2">
              <strong>Wallet Address:</strong> {walletAddress}
            </p>
            <p>Please send exactly <strong>{amount || 0}</strong> {cryptoType}.</p>
          </Col>

          <Col md={6}>
            <FormGroup>
              <Label for="txHash">Transaction Hash</Label>
              <Input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Enter transaction hash"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="senderAddress">Sender Wallet Address</Label>
              <Input
                type="text"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                placeholder="Enter your wallet address"
                required
              />
            </FormGroup>

            <Button type="submit" color="primary">
              Submit Deposit
            </Button>

            {submitted && (
              <Alert color="success" className="mt-3">
                Deposit submitted! Please wait for confirmation.
              </Alert>
            )}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default TopupWallet;
