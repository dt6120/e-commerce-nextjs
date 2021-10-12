import {
  Typography,
  Link,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  Card,
  List,
  ListItem,
} from "@material-ui/core";
import React, { useContext } from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/Layout";
import { Store } from "../../utils/Store";
import { useSnackbar } from "notistack";

const CartScreen = () => {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const router = useRouter();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleCartUpdate = async (item, quantity) => {
    closeSnackbar();

    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      enqueueSnackbar("Sorry, product is out of stock", { variant: "error" });
      return;
    }

    dispatch({
      type: "ADD_CART_ITEM",
      payload: {
        ...item,
        quantity,
      },
    });

    enqueueSnackbar("Product quantity updated", { variant: "success" });
  };

  const handleRemoveItem = (item) => {
    dispatch({ type: "DELETE_CART_ITEM", payload: item });

    enqueueSnackbar("Product removed from cart", { variant: "success" });
  };

  const handleCheckout = () => {
    router.push("/shipping");
  };

  return (
    <Layout title="Cart">
      <Typography component="h1" variant="h1">
        Shopping Cart
      </Typography>
      {cartItems.length === 0 ? (
        <Typography>
          Cart is empty.{" "}
          <NextLink href="/" passHref>
            <Link>Go shopping</Link>
          </NextLink>
        </Typography>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <NextLink href={`/products/${item.slug}`} passHref>
                          <Link>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={50}
                              height={50}
                            />
                          </Link>
                        </NextLink>
                      </TableCell>
                      <TableCell>
                        <NextLink href={`/products/${item.slug}`} passHref>
                          <Link>
                            <Typography>{item.name}</Typography>
                          </Link>
                        </NextLink>
                      </TableCell>
                      <TableCell align="right">
                        <Select
                          value={item.quantity}
                          onChange={(e) =>
                            handleCartUpdate(item, e.target.value)
                          }
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <MenuItem key={x + 1} value={x + 1}>
                              {x + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="right">{item.price}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleRemoveItem(item)}
                        >
                          x
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <List>
                <ListItem>
                  <Typography variant="h2">
                    Subtotal (
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}{" "}
                    items) : ${" "}
                    {cartItems.reduce(
                      (price, item) => price + item.quantity * item.price,
                      0
                    )}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
