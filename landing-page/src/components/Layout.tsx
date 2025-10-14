import Header from "./sections/Header"
import Hero from "./sections/Hero"
import Feature from "./sections/Features"
import Membership from "./sections/Membership"
import CTASection from "./sections/CTASection"
// import Feedback from "./sections/Feedback"
import Footer from "./sections/Footer"  

const Layout = () => {
  return (
    <div>
      <Header/>
      <Hero />
      <Feature />
      <Membership />
      <CTASection/>
      {/* <Feedback /> */}
      <Footer />

    </div>
  )
}

export default Layout