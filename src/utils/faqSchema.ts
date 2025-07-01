// FAQ Schema Data for Different Pages
export interface FAQItem {
  question: string;
  answer: string;
}

export const generateFAQSchema = (faqs: FAQItem[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Homepage FAQ
export const homepageFAQs: FAQItem[] = [
  {
    question: "What does 'Natty or Juicy' mean?",
    answer: "Natty (Natural) refers to someone who achieves their physique without performance-enhancing drugs. Juicy refers to someone who uses steroids or other enhancements. Our platform allows users to vote and analyze fitness influencers based on expert opinions and community input."
  },
  {
    question: "How accurate are the assessments?",
    answer: "Our assessments combine community voting with expert analysis from certified fitness professionals. While not 100% definitive, we provide educated opinions based on visible signs, timeline analysis, and professional expertise."
  },
  {
    question: "Is this platform free to use?",
    answer: "Yes! Browsing, voting, and reading expert reviews is completely free. We also offer premium merchandise for fitness enthusiasts."
  },
  {
    question: "Can I suggest an influencer for analysis?",
    answer: "Absolutely! Use our suggestion form to submit influencers for community analysis. We review all submissions and add popular requests to our database."
  }
];

// Merch Page FAQ
export const merchFAQs: FAQItem[] = [
  {
    question: "What is The Juicy Lightning™?",
    answer: "The Juicy Lightning™ is professional-grade equipment designed to enhance your fitness content creation. It's a secret weapon that helps natural influencers create high-quality content that stands out."
  },
  {
    question: "How long does shipping take?",
    answer: "We offer free shipping on all orders with delivery in 1-2 business days within the US. International shipping is available with tracking provided."
  },
  {
    question: "Is there a warranty?",
    answer: "Yes! All our products come with a 1-year warranty against manufacturing defects. We also offer a 30-day money-back guarantee if you're not satisfied."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and Shop Pay through our secure Shopify checkout."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied, contact our support team for a full refund."
  }
];

// Experts Page FAQ
export const expertsFAQs: FAQItem[] = [
  {
    question: "Who are the expert reviewers?",
    answer: "Our experts are certified fitness professionals, former competitive bodybuilders, sports scientists, and medical professionals with extensive experience in natural vs enhanced physique analysis."
  },
  {
    question: "How do experts make their assessments?",
    answer: "Experts analyze multiple factors including muscle development timeline, proportions, vascularity, skin quality, training history, and other physical indicators to provide educated opinions."
  },
  {
    question: "Can I become an expert reviewer?",
    answer: "We're always looking for qualified professionals. If you have relevant credentials and experience, you can apply through our expert application process."
  }
];

// Utility function to add FAQ schema to page
export const addFAQSchemaToPage = (faqs: FAQItem[]) => {
  if (typeof window === 'undefined') return;
  
  // Remove existing FAQ schema
  const existingScript = document.querySelector('script[data-faq-schema="true"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new FAQ schema
  const schema = generateFAQSchema(faqs);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-faq-schema', 'true');
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

// FAQ data export for use in components 