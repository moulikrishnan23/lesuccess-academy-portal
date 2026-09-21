import HeroVideo from '../components/home/HeroVideo'
import AboutSection from '../components/home/AboutSection'
import ChooseYourPath from '../components/home/ChooseYourPath'
import WhyChooseUs from '../components/home/WhyChooseUs'
import DemoClass from '../components/home/DemoClass'
import UpcomingPrograms from '../components/home/UpcomingPrograms'
import OurTeam from '../components/home/OurTeam'
import LifeAtLeSuccess from '../components/home/LifeAtLeSuccess'
import WhereStudentsWork from '../components/home/WhereStudentsWork'
import Testimonials from "../components/home/Testimonials"
import ConnectWithUs from '../components/home/ConnectWithUs'

const Home = () => {
  return (
    <div>
      <HeroVideo/>
      <AboutSection/>

      <WhyChooseUs/>
      <DemoClass/>
      <ChooseYourPath/>
      <UpcomingPrograms/>
      <OurTeam/>
      <LifeAtLeSuccess/>
      <WhereStudentsWork/>
      <Testimonials/>
      <ConnectWithUs/>
    </div>
  )
}

export default Home
