// This file is the single source of truth for the structure of a discount submission.

export const initialFormData = {
  // Financials
  saasProduct: '', companySize: '', industry: '', listPrice: '',
  finalPrice: '', licensesPurchased: '', contractTerm: '1 year',
  paymentTerms: 'Annual upfront', primaryUseCase: '',
  oneTimeCredits: false, oneTimeCreditsAmount: 5000,
  // Concessions
  concessions: {
    netTerms: 'Net 30', deferredPayments: { software: false, implementation: false },
    extendedRamp: 0, trainingCredits: false, futureDiscountLock: false,
    futureDiscountLockInValue: 0, renewalPriceIncreaseLock: 0,
    legalTermConcessions: false, legalConcessionsDetails: '',
  },
  // Ratings
  ratings: {
    salesProcessRating: 5, understandingOfNeedsRating: 5, negotiationTransparencyRating: 5,
    implementationRating: 5, trainingRating: 5, productPromiseRating: 5,
    supportQualityRating: 5, successManagementRating: 5, communicationRating: 5,
    overallValueRating: 5,
  }
};

// NEW: A detailed definition for all form fields
export const formSections = {
  financial: {
    title: 'Financial Incentives',
    fields: [
      { name: 'saasProduct', label: 'Which SaaS Product Did You Purchase?*', type: 'select', options: [] }, // Options will be populated from DB
      { name: 'companySize', label: 'Your Company Size', type: 'select', options: ['1-50 Employees', '51-200 Employees', '201-1,000 Employees', '1,001+ Employees'] },
      { name: 'industry', label: 'Your Industry', type: 'select', options: ['Financial Services', 'Insurance', 'Retail', 'Utilities', 'Machinery', 'Government / PubSec', 'Non Profit'] },
      { name: 'listPrice', label: 'Annual Contract Value (List Price)*', type: 'number', placeholder: 'e.g., 100000' },
      { name: 'finalPrice', label: 'Final Amount Paid (After Discount)*', type: 'number', placeholder: 'e.g., 80000' },
      { name: 'licensesPurchased', label: 'Number of Licenses Purchased', type: 'select', options: ['1-10', '11-50', '51-200', '201+'] },
      { name: 'contractTerm', label: 'Contract Term', type: 'radio', options: ['1 year', '2 years', '3+ years'] },
      { name: 'paymentTerms', label: 'Payment Terms', type: 'radio', options: ['Monthly', 'Annual upfront', 'Multi-year prepay'] },
      { name: 'primaryUseCase', label: 'Primary Use Case', type: 'text', placeholder: 'e.g., Sales CRM, Marketing Automation' },
      { name: 'oneTimeCredits', label: 'One Time Credits Received?', type: 'toggle' },
      { name: 'oneTimeCreditsAmount', label: 'Amount', type: 'range', min: 500, max: 1000000, step: 500, conditionalField: 'oneTimeCredits' },
    ]
  },
   concessions: {
    title: 'Additional Concessions (Optional)',
    // NEW: Detailed structure for the concessions tab
    subsections: [
      {
        title: 'Payment & Billing',
        fields: [
          { name: 'extendedRamp', label: 'Extended Ramp Period', type: 'range', min: 0, max: 180, step: 30, unit: 'days' },
          { name: 'deferredPayments.software', label: 'For Software', type: 'toggle', group: 'Deferred Payments' },
          { name: 'deferredPayments.implementation', label: 'For Implementation', type: 'toggle', group: 'Deferred Payments' },
        ]
      },
      {
        title: 'Renewal Terms',
        fields: [
          { name: 'futureDiscountLock', label: 'Future Discount Lock-in?', type: 'toggle' },
          { name: 'futureDiscountLockInValue', label: 'Discount Locked-in at', type: 'range', min: 0, max: 100, step: 1, unit: '%', conditionalField: 'futureDiscountLock' },
          { name: 'renewalPriceIncreaseLock', label: 'Renewal Price Increase Cap', type: 'range', min: 0, max: 20, step: 1, unit: '%' },
        ]
      },
      {
        title: 'Product, Service & Legal',
        fields: [
          { name: 'trainingCredits', label: 'Training Credits Included', type: 'toggle' },
          { name: 'legalTermConcessions', label: 'Legal Term Concessions', type: 'toggle' },
          { name: 'legalConcessionsDetails', label: 'Briefly describe legal concessions...', type: 'text', placeholder: 'e.g., Capped liability, custom data processing agreement...', conditionalField: 'legalTermConcessions' },
        ]
      }
    ]
  },
experience: {
  title: 'Vendor Experience',
  // We now use 'subsections' to group the fields
  subsections: [
    {
      title: 'Presales',
      fields: {
        salesProcessRating: { label: 'Sales Process Quality', description: 'How organized, professional, and efficient was the overall sales process?' },
        understandingOfNeedsRating: { label: 'Understanding of Needs', description: 'How well did the sales team understand your specific business challenges and requirements?' },
        negotiationTransparencyRating: { label: 'Negotiation Transparency', description: 'How transparent and fair was the pricing and negotiation process?' },
      }
    },
    {
      title: 'Implementation & Onboarding',
      fields: {
        implementationRating: { label: 'Implementation Process', description: 'How smooth and efficient was the implementation and onboarding?' },
        trainingRating: { label: 'Training & Enablement', description: 'Effectiveness of training to get your team running.' },
        productPromiseRating: { label: 'Product vs. Promise', description: 'How well the product met the expectations from the sales cycle.' },
      }
    },
    {
      title: 'Post-Sales & Relationship',
      fields: {
        supportQualityRating: { label: 'Customer Support Quality', description: 'Responsiveness and helpfulness of customer support.' },
        successManagementRating: { label: 'Proactive Success Management', description: 'Value from your Customer Success or Account Manager.' },
        communicationRating: { label: 'Communication', description: 'Effectiveness of vendor communication and updates.' },
        overallValueRating: { label: 'Overall Value & Partnership', description: 'Overall value for money and likelihood to recommend.' },
      }
    }
  ]
}
};


// A flat list of all rating keys, derived from the object above.
export const allRatingKeys = formSections.experience.subsections.reduce((acc, subsection) => {
  return [...acc, ...Object.keys(subsection.fields)];
}, []);