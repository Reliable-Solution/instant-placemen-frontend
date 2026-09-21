// Razorpay Client SDK Loader & Checkout Utility

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface CheckoutOptions {
  planId: string;
  planTitle: string;
  amount?: number;
  employerName?: string;
  employerEmail?: string;
  employerPhone?: string;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
  onClose?: () => void;
}

export const initiateRazorpayCheckout = async (options: CheckoutOptions) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      options.onError("Failed to load Razorpay payment gateway. Please check your internet connection.");
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";
    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;

    // 1. Create order on backend
    const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        planId: options.planId,
        employerEmail: options.employerEmail,
        employerPhone: options.employerPhone,
        customAmount: options.amount,
      }),
    });

    const orderData = await orderRes.json();
    if (!orderData.success || !orderData.order) {
      throw new Error(orderData.message || "Failed to initialize payment order.");
    }

    const { id: orderId, amount, key } = orderData.order;

    // 2. Configure Razorpay modal
    const razorpayOptions = {
      key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TcFHTmoU96y71Z",
      amount,
      currency: "INR",
      name: "Instant Placement",
      description: options.planTitle,
      order_id: orderId,
      prefill: {
        name: options.employerName || "Hiring Manager",
        email: options.employerEmail || "recruiter@instantplacement.in",
        contact: options.employerPhone || "9876543210",
      },
      theme: {
        color: "#2563eb",
      },
      handler: async function (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) {
        try {
          // 3. Cryptographically verify signature on backend
          const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            options.onSuccess(verifyData);
          } else {
            options.onError(verifyData.message || "Payment verification failed.");
          }
        } catch (verifyErr: any) {
          options.onError(verifyErr.message || "Error validating payment.");
        }
      },
      modal: {
        ondismiss: function () {
          if (options.onClose) options.onClose();
        },
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.on("payment.failed", function (failResponse: any) {
      options.onError(failResponse.error?.description || "Payment failed or cancelled.");
    });
    rzp.open();
  } catch (err: any) {
    options.onError(err.message || "Payment initiation failed.");
  }
};
