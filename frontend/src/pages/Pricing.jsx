import React from 'react';
import { Button, Card, CardContent, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import "../styles/pricing.css"
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
 const routeTo = useNavigate()
  return (
    <div className="pricingContainer">
      <Card className="pricingCard">
        <CardContent>
          <Typography variant="h4" className="pricingTitle">
            <span className="gradientText">Videxify Pro</span>
          </Typography>
          <Typography variant="h6" className="pricingSubtitle">
            Unlock Premium Features
          </Typography>

          <div className="priceCircle">
            <Typography variant="h3" className="priceText">
              $9.99
            </Typography>
            <Typography variant="subtitle1" className="priceDuration">
              /month
            </Typography>
          </div>

          <div className="featuresList">
            {[
              'HD Video Quality',
              'Unlimited Meeting Duration',
              'Advanced Screen Sharing',
              'Cloud Recording (10hrs/month)',
              'Custom Virtual Backgrounds',
              'Priority Customer Support'
            ].map((feature, index) => (
              <div key={index} className="featureItem">
                <CheckCircleIcon className="featureIcon" />
                <Typography variant="body1">{feature}</Typography>
              </div>
            ))}
          </div>

          <Button 
            fullWidth 
            variant="contained" 
            className="buyButton"
            onClick={() => {
              routeTo("/check-out")
            }}
          >
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

