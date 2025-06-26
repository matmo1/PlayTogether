import { loadStripe } from "@stripe/stripe-js";
import api from "../api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export default function StripeCheckoutButton({ bookingId }) {
  const handleCheckout = async () => {
    try {
      const { data } = await api.post("/payments/checkout-session", {
        booking_id: bookingId,
      });
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error(err);
      alert("Грешка при плащане");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-secondary text-white px-4 py-2 rounded-lg"
    >
      Плати с карта
    </button>
  );
}
