import nc from "next-connect";
import { isAuthenticated } from "../../../../utils/auth";

const handler = nc();

handler.use(isAuthenticated);

handler.get((req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});

export default handler;
