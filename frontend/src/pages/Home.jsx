import React from 'react'
import HeroVideo from '../components/home/HeroVideo'
import AboutSection from '../components/home/AboutSection'
import ChooseYourPath from '../components/home/ChooseYourPath'
import WhyChooseUs from '../components/home/WhyChooseUs'
import DemoClass from '../components/home/DemoClass'
import UpcomingPrograms from '../components/home/UpcomingPrograms'

const Home = () => {
  return (
    <div>
      <HeroVideo/>
      <AboutSection/>

      <WhyChooseUs/>
      <DemoClass/>
      <ChooseYourPath/>
      <UpcomingPrograms/>
    </div>
  )
}

export default Home
