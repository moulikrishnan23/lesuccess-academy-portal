import { memo, useRef } from "react"
import useSectionMotion from "../../hooks/useSectionMotion.js"
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
import ConnectWithUs from '../../components/home/ConnectWithUs'

const Home = () => {
  const rootRef = useRef(null)
  useSectionMotion(rootRef)
  return (
    <div ref={rootRef}>
      <HeroVideo />
      <AboutSection/>
      <WhyChooseUs/>
      <StartingFromZero/>
      <SiteNumbers/>
      <DemoClass/>
      <HomeTicker/>
      <ChooseYourPath/>
      <UpcomingPrograms/>
      <div data-preserve-ui className="contents">
      <OurTeam/>
      <LifeAtLeSuccess/>
      <SuccessStoriesSection/>
      <WhereStudentsWork/>
      </div>
      <Testimonials/>
      <ConnectWithUs/>
    </div>
  )
}

export default memo(Home)
