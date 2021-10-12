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
  Button,
  CircularProgress,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
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
import getError from "../../utils/error";

const OrderScreen = ({ params }) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const {
    state: { userInfo },
  } = useContext(Store);

  const router = useRouter();

  const orderId = params.id;

  const [order, setOrder] = useState();

  useEffect(() => {
    if (!userInfo) {
      enqueueSnackbar("Login to proceed", { variant: "error" });
      router.push("/login");
      return;
    }

    // if (userInfo._id !== order.user) {
    //   router.push("/");
    //   enqueueSnackbar("Order details not found", { variant: "error" });
    // }

    const fetchOrder = async () => {
      try {
        if (!orderId) {
          return;
        }
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        if (!data?._id) {
          enqueueSnackbar("Order not found", { variant: "error" });
          router.push("/");
        }

        setOrder(data);
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: "error" });
      }
    };

    fetchOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout title="Order Details">
      <CheckoutWizard activeStep={4} />
      <Typography component="h1" variant="h1">
        Order Id: {orderId}
      </Typography>
      {!order ? (
        <CircularProgress />
      ) : (
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
                  {order.shippingAddress.fullName} <br />
                  {order.shippingAddress.address} <br />
                  {order.shippingAddress.city}, {order.shippingAddress.country}{" "}
                  - {order.shippingAddress.postalCode}
                </ListItem>
                <ListItem>
                  Status:{" "}
                  {order.isDelivered
                    ? `Delivered on ${order.deliveredAt}`
                    : "Not delivered"}
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
                <ListItem>{order.paymentMethod}</ListItem>
                <ListItem>
                  Status:{" "}
                  {order.isPaid ? `Paid on ${order.paidAt}` : "Not paid"}
                </ListItem>
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
                        {order.orderItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <NextLink
                                href={`/products/${item.slug}`}
                                passHref
                              >
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
                              <NextLink
                                href={`/products/${item.slug}`}
                                passHref
                              >
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
                      <Typography align="right">${order.itemsPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography>Tax:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">${order.taxPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography>Shipping:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">
                        ${order.shippingPrice}
                      </Typography>
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
                        <strong>${order.totalPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </Card>
            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(OrderScreen), { ssr: false });

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

// export const getServerSideProps = async ({ params }) => {
//   const { id } = params;

//   await db.connect();
//   const order = await Order.findById(id).lean();
//   await db.disconnect();

//   return {
//     props: {
//       order: {
//         ...db.convertDocToObj(order),
//         orderItems: order.orderItems.map(db.convertDocToObj),
//         user: order.user.toString(),
//       },
//     },
//   };
// };
