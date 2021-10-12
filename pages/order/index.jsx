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
  Card,
  List,
  ListItem,
  CircularProgress,
} from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/Layout";
import CheckoutWizard from "../../components/CheckoutWizard";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import { useSnackbar } from "notistack";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import getError from "../../utils/error";

const PlaceOrder = () => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems, paymentMethod, shippingAddress },
  } = state;
  const { fullName, address, city, postalCode, country } = shippingAddress;

  const router = useRouter();

  const itemsPrice =
    Math.round(
      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100;

  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = Math.round(itemsPrice * 0.15 * 100) / 100;
  const totalPrice =
    Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  useEffect(() => {
    if (!userInfo) {
      enqueueSnackbar("Login to proceed", { variant: "error" });
      router.push("/login?redirect=/shipping");
    }

    if (cartItems.length === 0) {
      enqueueSnackbar("No items in cart", { variant: "error" });
      router.push("/");
    }

    if (!paymentMethod) {
      enqueueSnackbar("Select a payment method", { variant: "error" });
      router.push("/payment");
    }

    const loadPaypalScript = async () => {
      const { data: clientId } = await axios.get("/api/keys/paypal", {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });

      paypalDispatch({
        type: "resetOptions",
        value: { "client-id": clientId, currency: "USD" },
      });

      paypalDispatch({ type: "setLoadingStatus", value: "pending" });
    };

    loadPaypalScript();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createOrder = async (data, actions) => {
    const paypalOrderId = await actions.order.create({
      purchase_units: [{ amount: { value: totalPrice } }],
    });

    return paypalOrderId;
  };

  const onApprove = async () => {
    // const details = await actions.order.capture();
    try {
      const { data } = await axios.post(
        `/api/orders/pay`,
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          isPaid: true,
          paidAt: Date.now(),
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      if (data._id) {
        enqueueSnackbar("Order is paid", { variant: "success" });
        dispatch({ type: "CLEAR_CART" });
        router.push(`/order/${data._id}`);
      }
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: "error" });
    }
  };

  const onError = async (error) => {
    enqueueSnackbar(getError(error), { variant: "error" });
  };

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={3} />
      <Typography component="h1" variant="h1">
        Place Order
      </Typography>
      <Grid container spacing={1}>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Shipping Address
                </Typography>
              </ListItem>
              <ListItem>
                {fullName} <br />
                {address} <br />
                {city}, {country} - {postalCode}
              </ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Payment Method
                </Typography>
              </ListItem>
              <ListItem>{paymentMethod}</ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Order Items
                </Typography>
              </ListItem>
              <ListItem>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
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
                            <Typography>{item.quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>{item.price}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography variant="h2">Order Summary</Typography>
              </ListItem>
              <ListItem>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Items:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${itemsPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${taxPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Shipping:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${shippingPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <hr />
              <ListItem>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Total:</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">
                      <strong>${totalPrice}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                {/* <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button> */}
                {isPending ? (
                  <CircularProgress />
                ) : (
                  <PayPalButtons
                    className={classes.fullWidth}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(PlaceOrder), {
  ssr: false,
});
