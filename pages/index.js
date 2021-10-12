import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@material-ui/core";
import axios from "axios";
import NextLink from "next/link";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import Layout from "../components/Layout";
import Product from "../models/Product";
import db from "../utils/db";
import { Store } from "../utils/Store";

const Home = ({ products }) => {
  const { dispatch, state } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleAddToCart = async (product) => {
    closeSnackbar();

    const existItem = cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);
    if (quantity > data.countInStock) {
      enqueueSnackbar("Sorry, product is out of stock", { variant: "error" });
      return;
    }

    dispatch({
      type: "ADD_CART_ITEM",
      payload: { ...product, quantity },
    });

    enqueueSnackbar("Product added to cart", { variant: "success" });
  };

  return (
    <Layout title="Home">
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {!products
            ? "Loading..."
            : products.map((product) => (
                <Grid item md={4} key={product._id}>
                  <Card>
                    <NextLink href={`/products/${product.slug}`} passHref>
                      <CardActionArea>
                        <CardMedia
                          component="img"
                          image={product.image}
                          title={product.name}
                        />
                        <CardContent>
                          <Typography>{product.name}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </NextLink>
                    <CardActions>
                      <Typography>${product.price}</Typography>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </div>
    </Layout>
  );
};

export default Home;

export const getServerSideProps = async () => {
  await db.connect();
  const products = await Product.find({}).lean();
  await db.disconnect();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
};
