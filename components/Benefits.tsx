import { FiBookOpen, FiActivity, FiHeart, FiUsers } from 'react-icons/fi'

const benefits = [
  {
    id: 1,
    title: 'Improves Focus',
    description: 'Enhances concentration and mental clarity in students',
    icon: FiBookOpen
  },
  {
    id: 2,
    title: 'Builds Flexibility',
    description: 'Develops better range of motion and physical adaptability',
    icon: FiActivity
  },
  {
    id: 3,
    title: 'Reduces Stress',
    description: 'Teaches stress management techniques for overall wellbeing',
    icon: FiHeart
  },
  {
    id: 4,
    title: 'Promotes Inclusion',
    description: 'Accessible for students of all athletic abilities',
    icon: FiUsers
  }
]

export function Benefits() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Benefits of Yoga in PE</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="card p-6 text-center hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-primary-100 text-primary-600 rounded-full">
                <benefit.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-700">
            By incorporating yoga into physical education, schools can provide a holistic approach to fitness that nurtures both body and mind, helping students develop lifelong wellness habits.
          </p>
        </div>
      </div>
    </section>
  )
}
