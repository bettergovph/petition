import Navbar from './components/layout/Navbar'
import HomePage from './components/HomePage'
import CreatePetition from './components/CreatePetition'
import ReviewPetition from './components/ReviewPetition'
import AllPetitions from './components/AllPetitions'
import FeaturedPetitions from './components/FeaturedPetitions'
import PetitionDetail from './components/PetitionDetail'
import HowItWorks from './components/HowItWorks'
import UserProfile from './components/UserProfile'
import EditPetition from './components/EditPetition'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import Footer from './components/layout/Footer'
import SignInPage from './components/auth/SignInPage'
import AuthErrorPage from './components/auth/AuthErrorPage'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './hooks/useAuth'
import { ModalProvider } from './contexts/ModalContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from '@dr.pogodin/react-helmet'
import './utils/cache-debug' // Initialize cache debugging in development

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <HelmetProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create" element={<CreatePetition />} />
                  <Route path="/review/:id" element={<ReviewPetition />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/petition/:slug" element={<PetitionDetail />} />
                  <Route path="/petition/:slug/edit" element={<EditPetition />} />
                  <Route path="/proposals/:slug" element={<PetitionDetail />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/petitions" element={<AllPetitions />} />
                  <Route path="/featured" element={<FeaturedPetitions />} />
                  <Route path="/auth/signin" element={<SignInPage />} />
                  <Route path="/auth/error" element={<AuthErrorPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </HelmetProvider>
      </ModalProvider>
    </AuthProvider>
  )
}

export default App
