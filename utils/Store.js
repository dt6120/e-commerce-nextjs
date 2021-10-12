import { createContext, useReducer } from "react";
import Cookies from "js-cookie";

export const Store = createContext();

const initialState = {
  darkMode: Cookies.get("darkMode") === "ON" ? true : false,
  cart: {
    cartItems: Cookies.get("cartItems")
      ? JSON.parse(Cookies.get("cartItems"))
      : [],
    shippingAddress: Cookies.get("shippingAddress")
      ? JSON.parse(Cookies.get("shippingAddress"))
      : {},
    paymentMethod: Cookies.get("paymentMethod") || "",
  },
  userInfo: Cookies.get("userInfo")
    ? JSON.parse(Cookies.get("userInfo"))
    : null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "DARK_MODE_ON": {
      Cookies.set("darkMode", "ON");
      return { ...state, darkMode: true };
    }
    case "DARK_MODE_OFF": {
      Cookies.set("darkMode", "OFF");
      return { ...state, darkMode: false };
    }

    case "ADD_CART_ITEM": {
      const newItem = action.payload;
      const existingItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      let cartItems = [];
      if (existingItem) {
        cartItems = state.cart.cartItems.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      } else {
        cartItems = [...state.cart.cartItems, newItem];
      }
      Cookies.set("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "DELETE_CART_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      Cookies.set("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CLEAR_CART": {
      Cookies.remove("cartItems");
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    }

    case "SAVE_SHIPPING_ADDRESS": {
      Cookies.set("shippingAddress", JSON.stringify(action.payload));
      return {
        ...state,
        cart: { ...state.cart, shippingAddress: action.payload },
      };
    }

    case "SAVE_PAYMENT_METHOD": {
      Cookies.set("paymentMethod", action.payload);
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    }

    case "USER_LOGIN": {
      Cookies.set("userInfo", JSON.stringify(action.payload));
      return { ...state, userInfo: action.payload };
    }
    case "USER_LOGOUT": {
      Cookies.remove("userInfo");
      Cookies.remove("cartItems");
      return {
        ...state,
        cart: { cartItems: [], shippingAddress: {}, paymentMethod: "" },
        userInfo: null,
      };
    }

    default:
      return state;
  }
};

const StoreProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
};

export default StoreProvider;
