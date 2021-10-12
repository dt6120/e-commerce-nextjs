import nc from "next-connect";
import db from "../../utils/db";
import data from "../../utils/data";
import User from "../../models/User";
import Product from "../../models/Product";

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();

  await Product.deleteMany();
  await Product.insertMany(data.products);

  await User.deleteMany();
  await User.insertMany(data.users);

  await db.disconnect();

  res.send({ message: "Seeded successfully" });
});

export default handler;
