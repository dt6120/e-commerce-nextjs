import {
  Typography,
  List,
  ListItem,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import CheckoutWizard from "../../components/CheckoutWizard";
import Layout from "../../components/Layout";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import { useSnackbar } from "notistack";

const PaymentScreen = () => {
  const classes = useStyles();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState("");

  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems, shippingAddress },
  } = state;

  useEffect(() => {
    if (!userInfo) {
      enqueueSnackbar("Login to proceed", { variant: "error" });
      router.push("/login?redirect=/shipping");
    }

    if (cartItems.length === 0) {
      enqueueSnackbar("No items in cart", { variant: "error" });
      router.push("/");
    }

    if (!shippingAddress.address) {
      enqueueSnackbar("Shipping address not found", { variant: "error" });
      router.push("/shipping");
    }

    setPaymentMethod(Cookies.get("paymentMethod") || "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    closeSnackbar();

    if (!paymentMethod) {
      enqueueSnackbar("Select a payment method to proceed", {
        variant: "error",
      });
      return;
    }

    dispatch({ type: "SAVE_PAYMENT_METHOD", payload: paymentMethod });
    router.push("/order");
  };

  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2} />
      <form className={classes.form} onSubmit={handleSubmit}>
        <Typography component="h1" variant="h1">
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  label="PayPal"
                  value="PayPal"
                  control={<Radio />}
                />
                <FormControlLabel
                  label="Stripe"
                  value="Stripe"
                  control={<Radio />}
                />
                <FormControlLabel
                  label="Cash"
                  value="Cash"
                  control={<Radio />}
                />
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button variant="contained" color="primary" fullWidth type="submit">
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push("/shipping")}
            >
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
};

export default PaymentScreen;
