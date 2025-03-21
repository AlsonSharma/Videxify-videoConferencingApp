import { lazy, Suspense, suspense } from "react";
import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication";
import Pricing from "./pages/Pricing";
import LoadingSpinner from "./pages/LoadingSpinner";
const Home = lazy(() => import("./pages/Home"));
const History = lazy(() => import("./pages/History"));
const CheckOut = lazy(() => import("./pages/CheckOut"));
const VideoMeeting = lazy(() => import("./pages/VideoMeeting"));
const NotFound = lazy(() => import("./pages/NotFound"));


//import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            {/* <Route path='/home' /> */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route
              path="/home"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Home />
                </Suspense>
              }
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route
              path="/check-out"
              element={
                <Elements stripe={stripePromise}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CheckOut />
                  </Suspense>
                </Elements>
              }
            />
            <Route
              path="/history"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <History />
                </Suspense>
              }
            />
            <Route
              path="/meet/:url"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <VideoMeeting />
                </Suspense>
              }
            />

            <Route
              path="*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
