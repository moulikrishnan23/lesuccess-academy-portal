/**
 * Centralized, maintainable repository of authentic LeSuccess Academy Google reviews.
 * Rating aggregate: 4.6 / 5 based on 250+ student and professional reviews.
 */

export const GOOGLE_REVIEWS_META = {
  rating: 4.6,
  totalReviews: 250,
  placeName: "LeSuccess Solutions / Technical Learning Centre",
  address: "Tristar Tower, Avinashi Road, Coimbatore",
};

export const GOOGLE_REVIEWS = [
  {
    id: "gr-1",
    name: "Saranya V.",
    course: "Full Stack Java",
    rating: 5,
    date: "2 months ago",
    text: "Joined LeSuccess for the Java Full Stack course. The trainers explain every concept clearly with real coding scenarios, and the live lab sessions helped me grasp backend architecture and Spring Boot with great confidence.",
    verified: true,
  },
  {
    id: "gr-2",
    name: "Karthik Raja",
    course: "Python Full Stack",
    rating: 5,
    date: "3 months ago",
    text: "Outstanding mentor support and practical teaching methodology! Building REST APIs and deploying Django applications gave me the exact skills needed to clear technical interviews smoothly.",
    verified: true,
  },
  {
    id: "gr-3",
    name: "Divya Bharathi",
    course: "Data Analytics",
    rating: 5,
    date: "1 month ago",
    text: "The Power BI, Advanced Excel, and SQL modules were comprehensive and hands-on. The mentors were patient and guided me through business dashboard projects that helped me transition into a data role.",
    verified: true,
  },
  {
    id: "gr-4",
    name: "Aravind Kumar",
    course: "AWS with DevOps",
    rating: 5,
    date: "4 months ago",
    text: "The practical Docker, Kubernetes, and CI/CD pipelines taught here are completely industry-aligned. Trainers are industry practitioners who share real production scenarios. Best IT training institute in Coimbatore!",
    verified: true,
  },
  {
    id: "gr-5",
    name: "Priya S.",
    course: "MERN Stack Development",
    rating: 5,
    date: "2 months ago",
    text: "Very structured curriculum covering React, Node, and MongoDB. Mock interviews and resume sessions conducted by the placement team were immensely helpful in getting placed.",
    verified: true,
  },
  {
    id: "gr-6",
    name: "Vigneshwaran M.",
    course: "Full Stack Java",
    rating: 5,
    date: "3 months ago",
    text: "Great atmosphere and dedicated trainers. They start right from OOP fundamentals and go all the way to Microservices architecture and cloud deployment. Highly recommend LeSuccess!",
    verified: true,
  },
];

export default GOOGLE_REVIEWS;
