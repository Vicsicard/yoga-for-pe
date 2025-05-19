import { FiBookOpen, FiActivity, FiHeart, FiUsers, FiCheckCircle, FiAward } from 'react-icons/fi'

const benefits = [
  {
    id: 1,
    title: 'Improves Focus & Concentration',
    description: 'Research shows that regular yoga practice can significantly improve student attention spans and classroom focus.',
    standardsAlignment: 'Aligns with Standard 2: Applies knowledge of concepts, principles, strategies, and tactics related to movement and performance.',
    icon: FiCheckCircle
  },
  {
    id: 2,
    title: 'Stress & Anxiety Reduction',
    description: 'Yoga techniques provide students with lifelong tools to manage stress and regulate emotions in healthy ways.',
    standardsAlignment: 'Aligns with Standard 3: Demonstrates the knowledge and skills to achieve and maintain a health-enhancing level of physical activity and fitness.',
    icon: FiHeart
  },
  {
    id: 3,
    title: 'Enhanced Physical Fitness',
    description: 'Improve strength, flexibility, balance, and coordination through age-appropriate yoga poses and sequences.',
    standardsAlignment: 'Aligns with Standard 1: Demonstrates competency in a variety of motor skills and movement patterns.',
    icon: FiActivity
  },
  {
    id: 4,
    title: 'Standards-Aligned Curriculum',
    description: 'Our programs align with the 2024 SHAPE America National Physical Education Standards while supporting cross-curricular connections.',
    standardsAlignment: 'Comprehensive alignment with all five 2024 SHAPE America standards.',
    icon: FiBookOpen
  },
  {
    id: 5,
    title: 'Inclusive for All Abilities',
    description: 'Yoga provides equitable opportunities through modifications and adaptations so all students can engage meaningfully and successfully.',
    standardsAlignment: 'Aligns with Standard 4: Exhibits responsible personal and social behavior that respects self and others.',
    icon: FiUsers
  },
  {
    id: 6,
    title: 'Professional Development',
    description: 'Comprehensive training and support for PE teachers to implement yoga with confidence and expertise.',
    standardsAlignment: 'Supports teachers in meeting Standard 5: Recognizes the value of physical activity for health, enjoyment, challenge, self-expression, and social interaction.',
    icon: FiAward
  }
]

export function Benefits() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-6">Why Include Yoga in Physical Education?</h2>
        <p className="text-center max-w-4xl mx-auto mb-12 text-gray-600">
          PE teachers should include yoga in their physical education classes for several great reasons that go beyond just flexibility and stretching. Yoga supports the whole student and aligns perfectly with national physical education standards.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="card p-6 hover:shadow-lg transition-all duration-300 rounded-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-primary-100 text-primary-600 rounded-full">
                <benefit.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-gray-600 mb-4">{benefit.description}</p>
              <p className="text-sm text-primary-600 font-medium border-t pt-4 mt-4">{benefit.standardsAlignment}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-700">
            Bend the body, brighten the mind, and bloom the soul creating a strong foundation for lifelong well-being.
          </p>
        </div>
      </div>
    </section>
  )
}
