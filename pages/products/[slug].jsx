import React, { useContext } from "react";
import axios from "axios";
import NextLink from "next/link";
// import Image from "next/image";
import Layout from "../../components/Layout";
import {
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  Card,
  CardMedia,
  Button,
} from "@material-ui/core";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import Product from "../../models/Product";
import db from "../../utils/db";
import { useSnackbar } from "notistack";

const ProductScreen = ({ product }) => {
  const classes = useStyles();

  const { dispatch, state } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleAddToCart = async () => {
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
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/" passhref>
          <Link>
            <Typography>Back to products</Typography>
          </Link>
        </NextLink>
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Card>
            <CardMedia
              component="img"
              image={product.image}
              title={product.name}
              height={640}
            />
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Rating: {product.rating} stars ({product.numReviews} reviews)
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>${product.price}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0 ? "In stock" : "Unavailable"}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleAddToCart}
                >
                  Add to cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ProductScreen;

export const getServerSideProps = async ({ params }) => {
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
};
