import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MainLayout } from '@/layouts/MainLayout'
import { PageSkeleton } from '@/components/ui/LoadingSkeleton'
import { lazy, Suspense } from 'react'

const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const Members = lazy(() => import('@/pages/members/Members'))
const MemberDetail = lazy(() => import('@/pages/members/MemberDetail'))
const AddMember = lazy(() => import('@/pages/members/AddMember'))
const EditMember = lazy(() => import('@/pages/members/EditMember'))
const Plans = lazy(() => import('@/pages/plans/Plans'))
const Payments = lazy(() => import('@/pages/payments/Payments'))
const PaymentDetail = lazy(() => import('@/pages/payments/PaymentDetail'))
const Reports = lazy(() => import('@/pages/reports/Reports'))
const SettingsPage = lazy(() => import('@/pages/settings/Settings'))
const Profile = lazy(() => import('@/pages/auth/Profile'))
const NotFound = lazy(() => import('@/pages/errors/NotFound'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageSkeleton />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageSkeleton />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/add" element={<AddMember />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="members/:id/edit" element={<EditMember />} />
          <Route path="plans" element={<Plans />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payments/:id" element={<PaymentDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
