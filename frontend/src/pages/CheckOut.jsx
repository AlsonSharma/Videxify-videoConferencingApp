import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../styles/Checkout.css";
import { TextField } from '@mui/material';
import Pricing from './Pricing';


const CheckOut = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // Get price from navigation state
  const amount = location.state?.amount || 999; // Default $50.00
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('http://localhost:8000/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) throw error;
      
      setSucceeded(true);
      setProcessing(false);

      setTimeout(() => {
        navigate("/auth")
      }, 2000)
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (

    <div className="checkout-page">

        <div className='left-panel'>
            <Pricing/>
        </div>

        <div className="right-panel">
            <h2>Complete Your Payment</h2>
      <form onSubmit={handleSubmit}>
        <CardElement className='card-details'/>
        <TextField className='name' label="Full Name" sx={{marginBottom: "1rem"}}></TextField>
        <TextField className='address' label="Billing Address"></TextField>
        <button disabled={processing || succeeded} className='payButton'>
          {processing ? 'Processing...' : `Pay $9.99`}
        </button>
        {error && <div className="error">{error}</div>}
        {succeeded && <div className="success">Payment Successful!</div>}
      </form>
        </div>
        {succeeded && (
        <div className="snackbar">
          Payment Successful! 🎉 Off to the signup page we go!
        </div>
      )}
    </div>
  );
};

export default CheckOut;
