import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

type FeatureSectionProps = {
  title: string;
  description: string;
  features: string[];
  isInView: boolean;
  orderClass?: string; // Optional for order differences
  paddingClass?: string; // Optional for padding differences
  initialX?: number; // Optional for custom initial X value
};

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  features,
  isInView,
  orderClass = 'order-2 md:order-1',
  paddingClass = '',
  initialX = -50,
}) => {
  return (
    <motion.div
      className={`w-full md:w-1/2 ${orderClass} ${paddingClass}`}
      initial={{ x: initialX }}
      animate={isInView ? { x: 0 } : { x: initialX }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <h3 className="text-3xl font-bold mb-6 text-gray-800">{title}</h3>
      <p className="text-lg text-gray-600 mb-6">{description}</p>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default FeatureSection;
