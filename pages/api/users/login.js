import nc from "next-connect";
import bcrypt from "bcryptjs";
import { signToken } from "../../../utils/auth";
import User from "../../../models/User";
import db from "../../../utils/db";

const handler = nc();

handler.post(async (req, res) => {
  await db.connect();

  const user = await User.findOne({ email: req.body.email });

  await db.disconnect();

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = signToken(user);
      res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401).send({ message: "Invalid password" });
    }
  } else {
    res.status(401).send({ message: "User does not exist" });
  }
});

export default handler;
