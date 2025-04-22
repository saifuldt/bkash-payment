const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const USERNAME = "01770618567";
const PASSWORD = "D7DaC<*E*eG";
const APP_KEY = "0vWQuCRGiUX7EPVjQDr0EUAYtc";
const APP_SECRET = "jcUNPBgbcqEDedNKdvE4G1cAK7D3hCjmJccNPZZBq96QIxxwAMEx";

let bkashToken = "";

async function getBkashToken() {
  const response = await axios.post(
    "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant",
    {
      app_key: APP_KEY,
      app_secret: APP_SECRET
    },
    {
      headers: {
        username: USERNAME,
        password: PASSWORD,
        "Content-Type": "application/json"
      }
    }
  );
  bkashToken = response.data.id_token;
  return bkashToken;
}

app.post("/create-payment", async (req, res) => {
  try {
    if (!bkashToken) await getBkashToken();

    const invoiceId = "Inv" + Date.now();

    const response = await axios.post(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
      {
        mode: "0011",
        payerReference: "01770618567",
        callbackURL: "https://bkash-payment-bkend.vercel.app/success.html",
        amount: req.body.amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceId
      },
      {
        headers: {
          authorization: bkashToken,
          "x-app-key": APP_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Payment failed");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
