import nc from "next-connect";
import Order from "../../../models/Order";
import db from "../../../utils/db";
import { isAuthenticated } from "../../../utils/auth";

// const handler = nc({
//   onError: async (err, req, res, next) => {
//     await db.disconnect();

//     res.status(500).send({ message: err.message });
//   },
// });

const handler = nc();

handler.use(isAuthenticated);

handler.get(async (req, res) => {
  await db.connect();

  const orders = await Order.find({ user: req.user._id });
  console.log(orders);

  await db.disconnect();

  res.send(orders);
});

export default handler;
