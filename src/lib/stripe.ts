/// <reference types="stripe-event-types" />

import Stripe from "stripe";
import { ENV } from "@/env.mjs";
const stripe = new Stripe(ENV.STRIPE_API_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
export default stripe;
