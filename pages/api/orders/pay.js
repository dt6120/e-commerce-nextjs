import nc from "next-connect";
import { isAuthenticated } from "../../../utils/auth";
import Order from "../../../models/Order";
import db from "../../../utils/db";

const handler = nc();

handler.use(isAuthenticated);

handler.post(async (req, res) => {
  await db.connect();

  const newOrder = new Order({
    ...req.body,
    user: req.user._id,
  });
  const order = await newOrder.save();

  await db.disconnect();

  res.status(201).send(order);
});

export default handler;
