import React from 'react';
import { useUI } from '../context/UIContext'; // Import the useUI hook

const ValuePropItem = ({ icon, title, description }) => (
  <div className="value-prop-item">
    <div className="value-prop-icon">{icon}</div>
    <h3 className="value-prop-title">{title}</h3>
    <p className="value-prop-description">{description}</p>
  </div>
);

const ValueProps = () => {
  const { openDiscountModal } = useUI(); // Get the function to open the modal

  return (
    <section className="value-props-section">
      <h2 className="section-title">Why Use SimulateScale?</h2>
      <div className="value-props-container">
        <ValuePropItem
          icon="📊"
          title="Access Real Data"
          description="Leverage thousands of crowdsourced data points on real software discounts to inform your next purchase."
        />
        <ValuePropItem
          icon="👤"
          title="Contribute Anonymously"
          description="Share your own discount data securely and anonymously to help the community and gain deeper insights."
        />
        <ValuePropItem
          icon="⚖️"
          title="Level the Playing Field"
          description="Stop guessing and start negotiating with the power of transparent pricing data. Get the best deal, every time."
        />
      </div>
      {/* --- NEW: Call-to-action button section --- */}
      <div className="value-props-footer">
        <button onClick={() => openDiscountModal()} className="btn btn-primary btn-large">
          Submit a Discount to Get Started
        </button>
      </div>
    </section>
  );
};

export default ValueProps;