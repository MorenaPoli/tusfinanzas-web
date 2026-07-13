import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/sections/Layout'

const LandingPage = lazy(() => import('@/sections/LandingPage'))
const AuthPage = lazy(() => import('@/sections/AuthPage'))
const Dashboard = lazy(() => import('@/sections/Dashboard'))
const AddTransaction = lazy(() => import('@/sections/AddTransaction'))
const Transactions = lazy(() => import('@/sections/Transactions'))
const Summary = lazy(() => import('@/sections/Summary'))
const Quotes = lazy(() => import('@/sections/Quotes'))
const AIChat = lazy(() => import('@/sections/AIChat'))
const Support = lazy(() => import('@/sections/Support'))
const Checkout = lazy(() => import('@/sections/Checkout'))
const PaymentSuccess = lazy(() => import('@/sections/PaymentSuccess'))
const PaymentFailure = lazy(() => import('@/sections/PaymentFailure'))
const PaymentPending = lazy(() => import('@/sections/PaymentPending'))
const AdminPanel = lazy(() => import('@/sections/AdminPanel'))
const Goals = lazy(() => import('@/sections/Goals'))
const Family = lazy(() => import('@/sections/Family'))
const Profile = lazy(() => import('@/sections/Profile'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

// IAfinanzas v2 - Build cache-bust
export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
          <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        </Route>
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/payment/pending" element={<ProtectedRoute><PaymentPending /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
