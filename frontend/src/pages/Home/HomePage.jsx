import HeroVideo from '../../components/home/HeroVideo'
import AboutSection from '../../components/home/AboutSection'
import ChooseYourPath from '../../components/home/ChooseYourPath'
import WhyChooseUs from '../../components/home/WhyChooseUs'
import StartingFromZero from '../../components/home/StartingFromZero'
import SiteNumbers from '../../components/home/SiteNumbers'
import DemoClass from '../../components/home/DemoClass'
import HomeTicker from '../../components/home/HomeTicker'
import UpcomingPrograms from '../../components/home/UpcomingPrograms'
import OurTeam from '../../components/home/OurTeam'
import LifeAtLeSuccess from '../../components/home/LifeAtLeSuccess'
import WhereStudentsWork from '../../components/home/WhereStudentsWork'
import Testimonials from "../../components/home/Testimonials"
import SuccessStoriesSection from '../../components/home/SuccessStoriesSection'
import HomeStatement from '../../components/home/HomeStatement'
import ConnectWithUs from '../../components/home/ConnectWithUs'

const Home = () => {
  return (
    <div>
      <HeroVideo />
      <AboutSection/>
      <WhyChooseUs/>
      <StartingFromZero/>
      <SiteNumbers/>
      <DemoClass/>
      <HomeTicker/>
      <ChooseYourPath/>
      <UpcomingPrograms/>
      <OurTeam/>
      <LifeAtLeSuccess/>
      <SuccessStoriesSection/>
      <WhereStudentsWork/>
      <Testimonials/>
      <HomeStatement/>
      <ConnectWithUs/>
    </div>
  )
}

export default Home
