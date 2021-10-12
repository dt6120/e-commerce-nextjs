import {
  Typography,
  List,
  ListItem,
  TextField,
  Button,
  Switch,
} from "@material-ui/core";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import CheckoutWizard from "../../components/CheckoutWizard";
import { Store } from "../../utils/Store";
import useStyles from "../../utils/styles";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

const Shipping = () => {
  const classes = useStyles();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const router = useRouter();
  // const { redirect } = router.query;

  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems, shippingAddress },
  } = state;

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const [usePrevAddress, setUsePrevAddress] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      // enqueueSnackbar("Login to proceed", { variant: "error" });
      router.push("/login?redirect=/shipping");
    }

    if (cartItems.length === 0) {
      enqueueSnackbar("No items in cart", { variant: "error" });
      router.push("/");
    }
  }, []);

  const handleUseSavedAddress = () => {
    closeSnackbar();

    if (usePrevAddress) {
      setUsePrevAddress(false);
      setValue("fullName", "");
      setValue("address", "");
      setValue("city", "");
      setValue("postalCode", "");
      setValue("country", "");
    } else if (shippingAddress?.address) {
      setUsePrevAddress(true);
      setValue("fullName", shippingAddress.fullName);
      setValue("address", shippingAddress.address);
      setValue("city", shippingAddress.city);
      setValue("postalCode", shippingAddress.postalCode);
      setValue("country", shippingAddress.country);
    } else {
      enqueueSnackbar("Saved address not found", {
        variant: "error",
      });
    }
  };

  const submitHandler = ({ fullName, address, city, postalCode, country }) => {
    dispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: { fullName, address, city, postalCode, country },
    });
    router.push("/payment");
  };

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <Typography component="h1" variant="h1">
          Shipping Address
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 4,
                pattern: /[A-Za-z]/,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  inputProps={{ type: "text" }}
                  error={Boolean(errors.fullName)}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === "required"
                        ? "Full name is required"
                        : errors.fullName.type === "minLength"
                        ? "Full name should have minimum 4 characters"
                        : "Full name is invalid"
                      : ""
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="address"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 4,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="address"
                  label="Address"
                  inputProps={{ type: "text" }}
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address
                      ? errors.address.type === "required"
                        ? "Address is required"
                        : "Address should have minimum 4 characters"
                      : ""
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="city"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
                pattern: /[A-Za-z]/,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="city"
                  label="City"
                  inputProps={{ type: "text" }}
                  error={Boolean(errors.city)}
                  helperText={
                    errors.city
                      ? errors.city.type === "required"
                        ? "City is required"
                        : errors.city.type === "minLength"
                        ? "City should have minimum 4 characters"
                        : "City is invalid"
                      : ""
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="postalCode"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 6,
                pattern: /[0-9]/,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="postalCode"
                  label="Postal Code"
                  inputProps={{ type: "text" }}
                  error={Boolean(errors.postalCode)}
                  helperText={
                    errors.postalCode
                      ? errors.postalCode.type === "required"
                        ? "Postal Code is required"
                        : errors.postalCode.type === "minLength"
                        ? "Postal Code should have minimum 6 characters"
                        : "Postal Code is invalid"
                      : ""
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="country"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
                pattern: /[A-Za-z]/,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="country"
                  label="Country"
                  inputProps={{ type: "text" }}
                  error={Boolean(errors.country)}
                  helperText={
                    errors.country
                      ? errors.country.type === "required"
                        ? "Country is required"
                        : errors.country.type === "minLength"
                        ? "Country should have minimum 6 characters"
                        : "Country is invalid"
                      : ""
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Switch checked={usePrevAddress} onChange={handleUseSavedAddress} />
            Get saved address
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Continue
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Shipping), { ssr: false });
