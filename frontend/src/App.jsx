import {BrowserRouter, Routes, Route} from 'react-router-dom'
//import Home from './pages/Home'
//import Register from './pages/Register'
import Login from './pages/Login'
import Header from './components/Header'
import Footer from './components/Footer'
import Layout from './components/Layout'
import DashboardUpload from './pages/DashboardUpload'
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

function App() {

  return (
    <BrowserRouter>
      <div>
        <Header/>
        <Routes>
          {/*Routes without Sidebar*/}
          {/*<Route path='/register' element={<Register />}></Route>*/}
          <Route path='/login' element={<Login />}></Route>


          {/*Routes with Sidebar*/}
          <Route element={<Layout />}>
          {/*<Route path='/' element={<Home />}/>*/}
          <Route path='/' element={<DashboardUpload/>}/>
          <Route path='/branch-network' element={<BranchNetwork/>}/>
          <Route path='/documents' element={<Documents/>}/>

          {/*Sub Pages */}
          <Route path='/landingPage' element={<LandingPageContents/>}/>
          <Route path='/aboutPage' element={<AboutPageContents/>}/>
          <Route path='/productsPage' element={<ProductsPageContents/>}/>
          <Route path='/investorRelationsPage' element={<InvestorRelationsPageContents/>}/>
          <Route path='/contacts' element={<ContactPageContents/>}/>
          <Route path='/careers' element={<CareersPageContents/>}/>

          {/*Products Pages */}
          <Route path='/goldLoanPage' element={<GoldLoanPageContents/>}/>
          <Route path='/fixedDepositsPage' element={<FixedDepositsPageContents/>}/>
          <Route path='/leasingPage' element={<LeasingPageContents/>}/>
          <Route path='/mortgagePage' element={<MortgagePageContents/>}/>
          <Route path='/forexPage' element={<ForexPageContents/>}/>
          <Route path='/luckewalletPage' element={<LuckewalletPageContents/>}/>
          
          {/*Profiles */}
          <Route path='/profiles/add' element={<AddProfile/>}/>
          </Route>
        </Routes>
        <Footer/>
      </div>
    </BrowserRouter>
  )
}

export default App
