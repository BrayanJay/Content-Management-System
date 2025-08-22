import {BrowserRouter, Routes, Route} from 'react-router-dom'
//import Home from './pages/Home'
//import Register from './pages/Register'
import Login from './pages/Login'
import Header from './components/Header'
import Footer from './components/Footer'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/Unauthorized'
import SecurityMonitor from './components/SecurityMonitor'
import Dashboard from './pages/Dashboard'
import LandingPageContents from './pages/sub_pages/LandingPageContents'
import AboutPageContents from './pages/sub_pages/AboutPageContents'
import ProductsPageContents from './pages/sub_pages/ProductsPageContents'
import InvestorRelationsPageContents from './pages/sub_pages/InvestorRelationsPageContents'
import ContactPageContents from './pages/sub_pages/ContactPageContents'
import CareersPageContents from './pages/sub_pages/CareersPageContents'
import GoldLoanPageContents from './pages/sub_pages/products_pages/GoldLoanPageContents'
import FixedDepositsPageContents from './pages/sub_pages/products_pages/FixedDepositsPageContents'
import LeasingPageContents from './pages/sub_pages/products_pages/LeasingPageContents'
import MortgagePageContents from './pages/sub_pages/products_pages/MortgagePageContents'
import ForexPageContents from './pages/sub_pages/products_pages/ForexPageContents'
import LuckewalletPageContents from './pages/sub_pages/products_pages/LuckewalletPageContents'
import BranchNetwork from './pages/BranchNetwork'
import Documents from './pages/Documents'
import AddProfile from './components/profiles/AddProfile'
import AddBranch from './components/AddBranch'
import UserManagement from './pages/admin/UserManagement'
import SystemLogs from './pages/admin/SystemLogs'
import { AuthProvider } from './contexts/AuthContext'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header/>
          <SecurityMonitor />
          <Routes>
            {/*Routes without Sidebar*/}
            <Route path='/login' element={<Login />}></Route>
            <Route path='/unauthorized' element={<Unauthorized />}></Route>

            {/*Routes with Sidebar - All require authentication*/}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              
              {/* Dashboard/Upload - Contributors and above can upload */}
              <Route path='/' element={
                <ProtectedRoute requiredRole="contributor+">
                  <Dashboard/>
                </ProtectedRoute>
              }/>

              {/* Branch Network - All authenticated users can view */}
              <Route path='/branch-network' element={
                <ProtectedRoute requiredPermission="branches:read">
                  <BranchNetwork/>
                </ProtectedRoute>
              }/>
              <Route path='/branches' element={
                <ProtectedRoute requiredPermission="branches:read">
                  <BranchNetwork/>
                </ProtectedRoute>
              }/>

              {/* Add Branch - Contributors and above can create */}
              <Route path='/branches/add' element={
                <ProtectedRoute requiredPermission="branches:create">
                  <AddBranch/>
                </ProtectedRoute>
              }/>

              {/* Documents - All authenticated users can view */}
              <Route path='/documents' element={
                <ProtectedRoute requiredPermission="files:read">
                  <Documents/>
                </ProtectedRoute>
              }/>

              {/* Content Pages - Contributors and above can edit */}
              <Route path='/landingPage' element={
                <ProtectedRoute requiredPermission="content:read">
                  <LandingPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/aboutPage' element={
                <ProtectedRoute requiredPermission="content:read">
                  <AboutPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/productsPage' element={
                <ProtectedRoute requiredPermission="content:read">
                  <ProductsPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/investorRelationsPage' element={
                <ProtectedRoute requiredPermission="content:read">
                  <InvestorRelationsPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/contacts' element={
                <ProtectedRoute requiredPermission="content:read">
                  <ContactPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/careers' element={
                <ProtectedRoute requiredPermission="content:read">
                  <CareersPageContents/>
                </ProtectedRoute>
              }/>

              {/* Product Pages */}
              <Route path='/goldLoanPage' element={
                <ProtectedRoute requiredPermission="products:read">
                  <GoldLoanPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/fixedDepositsPage' element={
                <ProtectedRoute requiredPermission="products:read">
                  <FixedDepositsPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/leasingPage' element={
                <ProtectedRoute requiredPermission="products:read">
                  <LeasingPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/mortgagePage' element={
                <ProtectedRoute requiredPermission="products:read">
                  <MortgagePageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/forexPage' element={
                <ProtectedRoute requiredPermission="products:read">
                  <ForexPageContents/>
                </ProtectedRoute>
              }/>
              <Route path='/luckewalletPage' element={
                <ProtectedRoute requiredPermission="products:read">
                  <LuckewalletPageContents/>
                </ProtectedRoute>
              }/>
              
              {/* Profiles */}
              <Route path='/profiles/add' element={
                <ProtectedRoute requiredPermission="profiles:create">
                  <AddProfile/>
                </ProtectedRoute>
              }/>

              {/* Admin Routes - Admin only */}
              <Route path='/users' element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement/>
                </ProtectedRoute>
              }/>

              {/* System Logs - Admin only */}
              <Route path='/logs' element={
                <ProtectedRoute requiredRole="admin">
                  <SystemLogs/>
                </ProtectedRoute>
              }/>

            </Route>
          </Routes>
          <Footer/>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
