import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { ServiceContext } from '../services/ServiceContext';
const Payment = () => {
 const { id } = useParams(); // order ID from URL
 const { customerService } = useContext(ServiceContext);
 const navigate = useNavigate();
 const [order, setOrder] = useState(null);
 const [loading, setLoading] = useState(true);
 const [processing, setProcessing] = useState(false);
 const [updating, setUpdating] = useState(false);
 const [error, setError] = useState('');
 // Fetch the order
 useEffect(() => {
   const fetchOrder = async () => {
     try {
       const token = localStorage.getItem('token');
       const response = await fetch(`${customerService}/api/orders/${id}`, {
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       });
       if (!response.ok) throw new Error('Failed to fetch order');
       const result = await response.json();
       setOrder(result?.data || result);
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   fetchOrder();
 }, [id, customerService]);
 const handlePayment = async () => {
   setProcessing(true);
   setError('');
   try {
     const token = localStorage.getItem('token');
     const response = await fetch(`${customerService}/api/orders/${id}`, {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
       },
       body: JSON.stringify({
         paymentStatus: 'completed',
       }),
     });
     if (!response.ok) throw new Error('Payment update failed');
     navigate(`/order-confirmation/${id}`);
   } catch (err) {
     setError(err.message);
   } finally {
     setProcessing(false);
   }
 };
 const handlePaymentLater = async () => {
    setProcessing(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${customerService}/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentStatus: 'pending',
        }),
      });
      if (!response.ok) throw new Error('Payment update failed');
      navigate(`/order-confirmation/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };
 if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
 if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;
 if (!order) return <div>No order found</div>;
return (
<Container className="mt-5">
<Card>
<Card.Body>
<Card.Title>Pay for Order #{order?._id}</Card.Title>
<p><strong>Status:</strong> {order?.paymentStatus}</p>
<p><strong>Total:</strong> ₹{order?.totalAmount || 'N/A'}</p>
<div  style={{display: 'flex',gap:'10px' ,marginTop:"20px"}}>
<Button type="submit" variant="primary" onClick={handlePayment} disabled={processing}>
           {processing ? 'Processing...' : 'Pay Now'}
</Button>
<Button variant="outline-primary" size="sm"  onClick={handlePaymentLater} disabled={processing}>
           {processing ? 'Processing...' : 'Pay Later'}
</Button>
</div>
</Card.Body>
</Card>
</Container>
 );
};
export default Payment;