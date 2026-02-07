import paramImg from './images/why-choose-param.jpg';
import learningImg from './images/personalized-learning.jpg';
import safetyImg from './images/quality-and-safety.jpg';
import benefitsImg from './images/benefits-of-home-tuition.jpg';
import careerImg from './images/career-opportunities-teachers.jpg';
import tutorImg from './images/successful-home-tutor.jpg';
import coachingImg from './images/home-tuition-vs-coaching.jpg';
import parentsImg from './images/choose-right-tutor.jpg';
import onlineImg from './images/online-vs-offline-tuition.jpg';
import growthImg from './images/home-tuition-market-growth.jpg';

export const blogPosts = [
  {
    title: 'Benefits of Home Tuition in India',
    description: 'Discover why home tuition is becoming the preferred choice for parents and students across India, offering personalized attention and better results.',
    image: benefitsImg,
  },
  {
    title: 'Why Choose Param Tuition Bureau for Your Child',
    description: 'Learn about our rigorous selection process, verified tutors, and commitment to quality education that sets us apart in Varanasi.',
    image: paramImg,
  },
  {
    title: 'How to Become a Successful Home Tutor in Varanasi',
    description: 'Tips and strategies for aspiring educators to build a successful career in home tutoring and make a real difference.',
    image: tutorImg,
  },
  {
    title: 'Home Tuition vs Coaching Institutes Which is Better',
    description: 'A comparative analysis of home tuition and coaching institutes to help you decide the best learning path for your child.',
    image: coachingImg,
  },
  {
    title: 'The Importance of Personalized Learning in a Students Life',
    description: 'Understanding how customized teaching methods can boost confidence and academic performance in students.',
    image: learningImg,
  },
  {
    title: 'Career Opportunities for Teachers Beyond the Classroom',
    description: 'Exploring the growing opportunities for teachers in the private tutoring sector and how to leverage them.',
    image: careerImg,
  },
  {
    title: 'How Parents Can Choose the Right Tutor for Their Child',
    description: 'A guide for parents on what to look for when hiring a home tutor to ensure the best match for their child\'s needs.',
    image: parentsImg,
  },
  {
    title: 'Online vs Offline Tuition Finding the Right Balance',
    description: 'Weighing the pros and cons of online and offline tuition to find the right balance for modern education.',
    image: onlineImg,
  },
  {
    title: 'The Growth of Home Tuition Market in Varanasi',
    description: 'An insight into the expanding home tuition market in Varanasi and what it means for students and teachers.',
    image: growthImg,
  },
  {
    title: 'How Param Tuition Bureau Ensures Quality and Safety',
    description: 'Our safety protocols and quality assurance measures that make us the most trusted tuition bureau in the city.',
    image: safetyImg,
  },
];

export const blogDataMap = {};
blogPosts.forEach(post => {
    // Matches the slugify function in Blog.js
    const slug = post.title.toLowerCase().replaceAll(/\s+/g, '-').replaceAll(/[^\w-]+/g, '');
    blogDataMap[slug] = post;
});