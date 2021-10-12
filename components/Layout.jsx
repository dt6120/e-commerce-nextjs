import React, { useContext, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import {
  AppBar,
  Container,
  CssBaseline,
  Link,
  Switch,
  Toolbar,
  Typography,
  Badge,
  Button,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import useStyles from "../utils/styles";
import { Store } from "../utils/Store";
import { useRouter } from "next/router";

const Layout = ({ children, title, description }) => {
  const classes = useStyles();
  const router = useRouter();

  const { state, dispatch } = useContext(Store);
  const {
    darkMode,
    cart: { cartItems },
    userInfo,
  } = state;

  const theme = createTheme({
    typography: {
      h1: {
        fontSize: "1.6rem",
        fontWeight: 400,
        margin: "1rem 0",
      },
      h2: {
        fontSize: "1.4rem",
        fontWeight: 400,
        margin: "1rem 0",
      },
    },
    palette: {
      type: darkMode ? "dark" : "light",
      primary: {
        main: "#f0c000",
      },
      secondary: {
        main: "#208080",
      },
    },
  });

  const [anchorEl, setAchorEl] = useState();

  const handleLoginClick = (e) => {
    setAchorEl(e.currentTarget);
  };

  const handleMenuClose = (e, redirect) => {
    setAchorEl(null);
    router.push(redirect);
  };

  const handleLogout = () => {
    dispatch({ type: "USER_LOGOUT" });
    setAchorEl(null);
    router.push("/");
  };

  const handleDarkModeChange = () => {
    dispatch({ type: darkMode ? "DARK_MODE_OFF" : "DARK_MODE_ON" });
  };

  return (
    <div>
      <Head>
        <title>{title && `${title} - `}Next Amazon</title>
        {description && <meta name="description" content={description}></meta>}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" className={classes.navbar}>
          <Toolbar>
            <NextLink href="/" passHref>
              <Link>
                <Typography className={classes.brand}>Amazon</Typography>
              </Link>
            </NextLink>
            <div className={classes.grow}></div>
            <div>
              <Switch checked={darkMode} onChange={handleDarkModeChange} />
              <NextLink href="/cart" passHref>
                <Link>
                  {cartItems.length > 0 ? (
                    <Badge color="secondary" badgeContent={cartItems.length}>
                      Cart
                    </Badge>
                  ) : (
                    "Cart"
                  )}
                </Link>
              </NextLink>
              {userInfo ? (
                <>
                  <Button
                    onClick={handleLoginClick}
                    className={classes.navbarButton}
                  >
                    {userInfo.name}
                  </Button>
                  <Menu
                    id="user-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={(e) => handleMenuClose(e, "/profile")}>
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={(e) => handleMenuClose(e, "/order/history")}
                    >
                      Order History
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <NextLink href="/login" passHref>
                  <Link>Login</Link>
                </NextLink>
              )}
            </div>
          </Toolbar>
        </AppBar>
        <Container className={classes.main}>{children}</Container>
        <footer className={classes.footer}>
          <Typography>&copy; All rights reserved. Next Amazon.</Typography>
        </footer>
      </ThemeProvider>
    </div>
  );
};

export default Layout;
