import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import { Store } from "../../utils/Store";
import { useSnackbar } from "notistack";
import {
  CircularProgress,
  Typography,
  Link,
  Card,
  List,
  ListItem,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Button,
  ListItemText,
} from "@material-ui/core";
import getError from "../../utils/error";
import useStyles from "../../utils/styles";

const OrderHistory = () => {
  const router = useRouter();

  const classes = useStyles();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    state: { userInfo },
  } = useContext(Store);

  const [orders, setOrders] = useState();

  useEffect(() => {
    closeSnackbar();

    if (!userInfo) {
      enqueueSnackbar("Login to procedd", { variant: "error" });
      router.push("/login?redirect=/order/history");
    }

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/orders", {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        setOrders(data);
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: "error" });
        setOrders([]);
      }
    };

    fetchOrders();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout title="Order History">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/profile" passHref>
                <ListItem button component="a">
                  <ListItemText primary="User Profile" />
                </ListItem>
              </NextLink>
              <NextLink href="/order/history" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Order History" />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Order History
                </Typography>
              </ListItem>
              <ListItem>
                {!orders ? (
                  <CircularProgress />
                ) : orders.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>DATE</TableCell>
                          <TableCell>TOTAL</TableCell>
                          <TableCell>DELIVERED</TableCell>
                          <TableCell>ACTION</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order._id.substring(20, 24)}</TableCell>
                            <TableCell>{order.createdAt}</TableCell>
                            <TableCell>$ {order.totalPrice}</TableCell>
                            <TableCell>
                              {order.isDelivered
                                ? `Delivered on ${order.deliveredAt}`
                                : "Not delivered"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                onClick={() =>
                                  router.push(`/order/${order._id}`)
                                }
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography>
                    No orders found.{" "}
                    <NextLink href="/" passHref>
                      <Link>Go to home</Link>
                    </NextLink>
                  </Typography>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });
