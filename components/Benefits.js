import { FiBookOpen, FiActivity, FiHeart, FiUsers, FiCheckCircle, FiAward } from 'react-icons/fi'

const benefits = [
  {
    id,
    title: 'Improved Focus & Concentration',
    description: 'Research shows that regular yoga practice can significantly improve student attention spans and classroom focus.',
    longDescription: 'Research shows that regular yoga practice can significantly improve student attention spans and classroom focus. Through controlled breathing, mindfulness, and intentional movement, yoga teaches students how to calm their minds and stay present. This translates to better concentration not only during PE but also in academic classes. Students who regularly practice yoga often show improved cognitive function, emotional regulation, and the ability to stay on task—all crucial skills for learning and development.',
    standardsAlignment: 'Aligns with Standard 2, and movement control.',
    icon,
  {
    id,
    title: 'Stress & Anxiety Reduction',
    description: 'Yoga techniques provide students with lifelong tools to manage stress and regulate emotions in healthy ways.',
    longDescription: 'Yoga techniques provide students with lifelong tools to manage stress and regulate emotions in healthy ways. Through breathing exercises, mindfulness, and gentle movement, yoga promotes a calm nervous system and greater emotional resilience—skills students can apply in both school and life.',
    standardsAlignment: 'Aligns with Standard 3: Demonstrates the knowledge and skills to achieve and maintain a health-enhancing level of physical activity and fitness. Students develop self-regulation techniques and stress-reduction strategies that contribute to lifelong wellness and mental health, a core part of maintaining overall fitness.',
    icon,
  {
    id,
    title: 'Enhanced Physical Fitness',
    description: 'Improve strength, flexibility, balance, and coordination through age-appropriate yoga poses and sequences.',
    longDescription: 'Improve strength, flexibility, balance, and coordination through age-appropriate yoga poses and sequences. Yoga builds muscular endurance, enhances joint mobility, and improves motor skills—all of which support physical literacy across a variety of activities and sports.',
    standardsAlignment: 'Aligns with Standard 1, helping students become more physically literate and confident movers.',
    icon,
  {
    id,
    title: 'Standards-Aligned Curriculum',
    description: 'Our programs align with the 2024 SHAPE America National Physical Education Standards while supporting cross-curricular connections.',
    longDescription: 'Yoga fits beautifully into a well-rounded PE curriculum by supporting physical literacy and the development of social-emotional skills, cognitive understanding, and lifelong wellness habits. Our curriculum is specifically designed to meet the 2024 SHAPE America National Physical Education Standards.',
    standardsAlignment: 'Comprehensive alignment with all five 2024 SHAPE America standards, ensuring your program meets national benchmarks.',
    icon,
  {
    id,
    title: 'Inclusive for All Abilities',
    description: 'Yoga provides equitable opportunities through modifications and adaptations so all students can engage meaningfully and successfully.',
    longDescription: 'Yoga provides equitable opportunities by incorporating modifications and adaptations so that all students, regardless of ability, can engage meaningfully and successfully in physical activity.',
    standardsAlignment: 'Aligns with Standard 4, students also learn respect for individual differences and promote a positive class culture.',
    icon,
  {
    id,
    title: 'Professional Development',
    description: 'Comprehensive training and support for PE teachers to implement yoga with confidence and expertise.',
    longDescription: 'We offer comprehensive professional development through in-services, guest speaking, curriculum design, and one-on-one consulting/coaching to ensure you can implement yoga with confidence and expertise.',
    standardsAlignment: 'Supports teachers in meeting Standard 5, self-expression, and social interaction.',
    icon: FiAward
  }
]

export function Benefits() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-6">Why Include Yoga in Physical Education?</h2>
        <p className="text-center max-w-4xl mx-auto mb-12 text-gray-600">
          PE teachers should include yoga in their physical education classes for several great reasons that go beyond just flexibility and stretching. Here's a breakdown of why it's a smart and valuable addition:
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
          <p className="mt-4 text-md text-gray-600">
            Through consistent yoga practice, students develop flexibility, strength, and endurance, contributing to their overall physical fitness and promoting lifelong health.
          </p>
        </div>
      </div>
    </section>
  )
}
