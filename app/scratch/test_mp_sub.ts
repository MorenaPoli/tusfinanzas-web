import dotenv from "dotenv";
dotenv.config();

import { MercadoPagoConfig, PreApproval } from "mercadopago";

async function run() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  console.log("Token:", token ? token.substring(0, 15) + "..." : "undefined");
  
  if (!token) {
    console.error("MERCADOPAGO_ACCESS_TOKEN is missing");
    return;
  }

  const config = new MercadoPagoConfig({ accessToken: token });
  const pa = new PreApproval(config);

  try {
    const resp = await pa.create({
      body: {
        reason: "Tus Finanzas Pro (mes)",
        external_reference: "1:pro:monthly",
        back_url: "https://tusfinanzas.app/payment/success",
        payer_email: "test_user_123@testuser.com",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 5000,
          currency_id: "ARS",
          start_date: new Date(Date.now() + 60000).toISOString(), // start in 1 minute
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }
    });
    console.log("SUCCESS:", resp);
  } catch (err: any) {
    console.error("ERROR name:", err.name);
    console.error("ERROR message:", err.message);
    if (err.cause) {
      console.error("ERROR cause:", JSON.stringify(err.cause, null, 2));
    }
  }
}

run();
