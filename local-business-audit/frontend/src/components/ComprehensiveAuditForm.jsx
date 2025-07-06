import { useState, useCallback } from "react";

// ========================================
// CONSTANTS & DATA
// ========================================
const COLORS = {
  primary: "#283948",
  white: "#FFFFFF",
  lightGray: "#E1E1E1",
  success: "#10B981",
  danger: "#EF4444",
  info: "#3B82F6",
  mockData: "#8B5CF6",
  text: "#000000", // Black text for body content
  textSecondary: "#666666", // Gray text for descriptions
};

const STEPS = [
  { id: 1, title: "Contact", icon: "👤", description: "Your information" },
  { id: 2, title: "Business", icon: "🏢", description: "Business details" },
  { id: 3, title: "Location", icon: "📍", description: "Service area" },
  { id: 4, title: "Online", icon: "🌐", description: "Digital presence" },
  { id: 5, title: "Goals", icon: "🎯", description: "Marketing objectives" },
];

const TRADE_TYPES = [
  "Plumber", "HVAC Contractor", "Electrician", "General Contractor", "Carpenter",
  "Roofer", "Painter", "Landscaper", "Handyman", "Concrete Contractor",
  "Flooring Contractor", "Kitchen & Bath Remodeler", "Solar Installer",
  "Pest Control", "Locksmith", "Auto Repair", "Tree Service", "Gutter Contractor",
  "Siding Contractor", "Window Contractor", "Door Installer", "Fence Contractor",
  "Deck Builder", "Pool Contractor", "Septic Services", "Well Drilling",
  "Waterproofing Contractor", "Foundation Repair", "Chimney Services", "Masonry Contractor",
  "Tile Contractor", "Drywall Contractor", "Insulation Contractor", "Garage Door Services",
  "Appliance Repair", "Cabinet Maker", "Countertop Installer", "Carpet Cleaner",
  "Pressure Washing", "Junk Removal", "Moving Services", "House Cleaning",
  "Window Cleaning", "Air Duct Cleaning", "Fire Damage Restoration", "Water Damage Restoration",
  "Mold Remediation", "Security System Installer", "Home Theater Installation", "Smart Home Installation",
  "Other"
];

const MARKETING_CHALLENGES = [
  "Not Getting Enough Leads", "Not Enough Reviews", "Low Visibility on Google",
  "Not Ranking on Maps", "Website Isn't Bringing In Leads", "No Online Presence",
  "Not Sure What To Focus On First", "Competitors Outranking Me",
  "Poor Social Media Presence", "Inconsistent Business Information Online",
];

const MARKETING_METHODS = [
  "Word of Mouth", "Google Ads", "Facebook Ads", "Email Marketing",
  "Social Media", "SEO Optimization", "Referral Marketing", "Direct Mail",
  "Local Networking", "Yellow Pages", "Yelp Advertising", "Home Advisor/Angi", "None",
];

const MOCK_DATA = {
  firstName: "Ross",
  lastName: "Logan", 
  email: "rosswlogan@gmail.com",
  contactPhone: "13855008437",
  businessName: "LM Finishing and Construction",
  tradeType: "Carpenter",
  customTradeType: "", 
  primaryServices: "Kitchen Finishing, Bathroom Remodeling, Custom Carpentry, Trim Work",
  businessPhone: "13855008437",
  businessAddress: "1760 E Fall St",
  city: "Eagle Mountain",
  state: "Utah",
  zipCode: "84005",
  serviceAreas: "Eagle Mountain, Utah County, Salt Lake County",
  websiteUrl: "https://lmfinishing.com/",
  googleBusinessProfileUrl: "https://www.google.com/maps/place/LM+Finishing+and+Construction/@40.303134,-112.0864737,13z/data=!4m9!1m2!2m1!1shandyman+professionals!3m5!1s0x874d7be36d45ddbb:0x7f9f0630f408973b!8m2!3d40.3031338!4d-112.0102561!16s%2Fg%2F11vcl97597?entry=ttu&g_ep=EgoyMDI1MDUwNy4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D",
  managesGoogleProfile: "Yes, I manage it myself",
  facebookUrl: "https://www.facebook.com/lm.fconstruction/",
  instagramUrl: "https://www.instagram.com/lm.fconstruction/",
  primaryGoal: "Get More Leads",
  marketingChallenges: [
    "Not Getting Enough Leads",
    "Website Isn't Bringing In Leads", 
    "Not Sure What To Focus On First"
  ],
  currentMarketing: [
    "Word of Mouth",
    "Direct Mail",
    "SEO Optimization", 
    "Referral Marketing"
  ],
  monthlyBudget: "Under $500",
  businessAge: "1-3 years",
  mainCompetitors: "Local handyman services, general contractors in Utah County",
  uniqueSellingPoint: "Quality finishing work with attention to detail, reliable and professional service",
  targetCustomer: "Homeowners in Utah County needing quality finishing and construction work",
};

const INITIAL_FORM_DATA = {
  firstName: "", lastName: "", email: "", contactPhone: "",
  businessName: "", tradeType: "", customTradeType: "", primaryServices: "", businessPhone: "",
  businessAddress: "", city: "", state: "", zipCode: "", serviceAreas: "",
  websiteUrl: "", googleBusinessProfileUrl: "", managesGoogleProfile: "", facebookUrl: "", instagramUrl: "",
  primaryGoal: "", marketingChallenges: [], currentMarketing: [], monthlyBudget: "",
  businessAge: "", mainCompetitors: "", uniqueSellingPoint: "", targetCustomer: "",
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
const cleanFormData = (data) => {
  const cleaned = { ...data };
  
  // Clean phone numbers
  if (cleaned.contactPhone) {
    cleaned.contactPhone = cleaned.contactPhone.replace(/\D/g, '');
  }
  if (cleaned.businessPhone) {
    cleaned.businessPhone = cleaned.businessPhone.replace(/\D/g, '');
  }
  
  // Clean primary services
  if (cleaned.primaryServices) {
    cleaned.primaryServices = cleaned.primaryServices
      .split(/[,;|]|\sand\s/)
      .map(service => service.trim())
      .filter(service => service.length > 0)
      .map(service => service.charAt(0).toUpperCase() + service.slice(1).toLowerCase())
      .join(', ');
  }
  
  // Clean URLs
  ['websiteUrl', 'googleBusinessProfileUrl', 'facebookUrl', 'instagramUrl'].forEach(field => {
    if (cleaned[field] && !cleaned[field].startsWith('http')) {
      cleaned[field] = 'https://' + cleaned[field];
    }
  });
  
  return cleaned;
};

// ========================================
// COMPONENTS
// ========================================

// Step Indicator Component
const StepIndicator = ({ currentStep }) => (
  <div style={{ marginBottom: "40px" }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    }}>
      {STEPS.map((step, index) => (
        <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: currentStep >= step.id ? COLORS.primary : COLORS.lightGray,
            color: currentStep >= step.id ? COLORS.white : COLORS.textSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "14px",
          }}>
            {currentStep > step.id ? "✓" : step.id}
          </div>
          <div style={{ marginLeft: "12px", flex: 1 }}>
            <div style={{
              fontWeight: "600",
              color: currentStep >= step.id ? COLORS.primary : COLORS.textSecondary,
              fontSize: "14px",
            }}>
              {step.title}
            </div>
            <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
              {step.description}
            </div>
          </div>
          {index < STEPS.length - 1 && (
            <div style={{
              flex: 1,
              height: "2px",
              background: currentStep > step.id ? COLORS.primary : COLORS.lightGray,
              margin: "0 16px",
            }} />
          )}
        </div>
      ))}
    </div>
  </div>
);

// Mock Data Controls Component
const MockDataControls = ({ isUsingMockData, onFillMockData, onClearForm }) => (
  <div style={{
    background: isUsingMockData ? "#F0FDF4" : "#F8F4FF",
    border: `2px solid ${isUsingMockData ? COLORS.success : COLORS.mockData}40`,
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px"
    }}>
      <div>
        <h4 style={{
          margin: 0,
          color: isUsingMockData ? COLORS.success : COLORS.mockData,
          fontSize: "16px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {isUsingMockData ? "✓" : "🎭"} 
          {isUsingMockData ? "Using LM Finishing Data" : "Testing Mode"}
        </h4>
        <p style={{
          margin: "4px 0 0 0",
          fontSize: "14px",
          color: COLORS.textSecondary,
        }}>
          {isUsingMockData 
            ? "Perfect for comparison testing against ActivePieces results"
            : "Use real ActivePieces data for comparison testing"
          }
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={onFillMockData}
          disabled={isUsingMockData}
          style={{
            background: isUsingMockData ? "#ccc" : COLORS.mockData,
            color: COLORS.white,
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: isUsingMockData ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ⚡
          {isUsingMockData ? "Data Loaded" : "Fill with LM Finishing Data"}
        </button>
        <button
          type="button"
          onClick={onClearForm}
          style={{
            background: "transparent",
            color: isUsingMockData ? COLORS.success : COLORS.mockData,
            border: `1px solid ${isUsingMockData ? COLORS.success : COLORS.mockData}`,
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🔄
          Clear
        </button>
      </div>
    </div>
    
    <details style={{ fontSize: "12px", color: COLORS.textSecondary }}>
      <summary style={{ cursor: "pointer", fontWeight: "500" }}>
        📋 Mock Data Preview (click to expand)
      </summary>
      <div style={{
        marginTop: "8px",
        padding: "8px",
        background: "#FFF",
        borderRadius: "4px",
        fontFamily: "monospace",
      }}>
        <div><strong>Business:</strong> {MOCK_DATA.businessName}</div>
        <div><strong>Type:</strong> {MOCK_DATA.tradeType}</div>
        <div><strong>Location:</strong> {MOCK_DATA.city}, {MOCK_DATA.state}</div>
        <div><strong>Website:</strong> {MOCK_DATA.websiteUrl}</div>
        <div><strong>Goal:</strong> {MOCK_DATA.primaryGoal}</div>
        <div><strong>Budget:</strong> {MOCK_DATA.monthlyBudget}</div>
      </div>
    </details>
  </div>
);

// Input Field Component
const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, options = null, textarea = false, fieldKey, validationErrors }) => {
  const hasError = validationErrors[fieldKey];
  
  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        display: "block",
        marginBottom: "8px",
        fontWeight: "600",
        color: hasError ? COLORS.danger : COLORS.primary,
        fontSize: "14px",
      }}>
        {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
      </label>
      {options ? (
        <select
          key={fieldKey}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: `1px solid ${hasError ? COLORS.danger : COLORS.lightGray}`,
            borderRadius: "8px",
            fontSize: "14px",
            background: COLORS.white,
          }}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          key={fieldKey}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            border: `1px solid ${hasError ? COLORS.danger : COLORS.lightGray}`,
            borderRadius: "8px",
            fontSize: "14px",
            background: COLORS.white,
            resize: "vertical",
            fontFamily: "inherit",
          }}
          required={required}
        />
      ) : (
        <input
          key={fieldKey}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "12px",
            border: `1px solid ${hasError ? COLORS.danger : COLORS.lightGray}`,
            borderRadius: "8px",
            fontSize: "14px",
            background: COLORS.white,
          }}
          required={required}
        />
      )}
      {hasError && (
        <div style={{
          marginTop: "4px",
          fontSize: "12px",
          color: COLORS.danger,
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          ⚠️
          {hasError}
        </div>
      )}
    </div>
  );
};

// Checkbox Group Component
const CheckboxGroup = ({ label, options, selectedValues, onChange }) => (
  <div style={{ marginBottom: "24px" }}>
    <label style={{
      display: "block",
      marginBottom: "12px",
      fontWeight: "600",
      color: COLORS.primary,
      fontSize: "14px",
    }}>
      {label}
    </label>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "12px",
    }}>
      {options.map((option) => (
        <label
          key={option}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => onChange(option)}
            style={{ 
              marginRight: "8px",
              accentColor: COLORS.primary
            }}
          />
          <span style={{ fontSize: "14px", color: COLORS.text }}>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

// Navigation Buttons Component
const NavigationButtons = ({ currentStep, onPrevStep, onNextStep, onSubmit, isLoading, validationErrors }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "40px",
    paddingTop: "24px",
    borderTop: `1px solid ${COLORS.lightGray}`,
  }}>
    <button
      type="button"
      onClick={onPrevStep}
      disabled={currentStep === 1}
      style={{
        background: "transparent",
        border: `1px solid ${COLORS.lightGray}`,
        color: currentStep === 1 ? COLORS.textSecondary : COLORS.primary,
        padding: "12px 24px",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: currentStep === 1 ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      ← Previous
    </button>

    <div style={{ fontSize: "14px", color: COLORS.textSecondary }}>
      Step {currentStep} of {STEPS.length}
    </div>

    {currentStep < STEPS.length ? (
      <button
        type="button"
        onClick={onNextStep}
        style={{
          background: COLORS.primary,
          border: "none",
          color: COLORS.white,
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        Next →
      </button>
    ) : (
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        style={{
          background: isLoading ? "#ccc" : COLORS.primary,
          border: "none",
          color: COLORS.white,
          padding: "16px 32px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "16px",
          cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {isLoading ? "Analyzing Your Business..." : "Get My Free Audit 📊"}
      </button>
    )}
  </div>
);

// Validation Error Summary Component
const ValidationErrorSummary = ({ validationErrors }) => {
  if (Object.keys(validationErrors).length === 0) return null;
  
  return (
    <div style={{
      background: "#FEF2F2",
      border: `1px solid ${COLORS.danger}40`,
      borderRadius: "8px",
      padding: "16px",
      marginTop: "24px",
    }}>
      <div style={{
        color: COLORS.danger,
        fontWeight: "600",
        fontSize: "14px",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        ⚠️
        Please fix the following issues:
      </div>
      <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
        {Object.values(validationErrors).map((error, index) => (
          <li key={index} style={{ color: COLORS.danger }}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

// ========================================
// CUSTOM HOOKS
// ========================================
const useFormValidation = () => {
  const validateStep = useCallback((step, formData) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim()) errors.lastName = "Last name is required";
        if (!formData.email.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Please enter a valid email address";
        }
        if (!formData.contactPhone.trim()) errors.contactPhone = "Phone number is required";
        break;
      case 2:
        if (!formData.businessName.trim()) errors.businessName = "Business name is required";
        if (!formData.tradeType) errors.tradeType = "Business type is required";
        if (formData.tradeType === "Other" && !formData.customTradeType.trim()) {
          errors.customTradeType = "Please specify your trade type";
        }
        if (!formData.primaryServices.trim()) errors.primaryServices = "Primary services are required";
        if (!formData.businessPhone.trim()) errors.businessPhone = "Phone number is required";
        break;
      case 3:
        if (!formData.businessAddress.trim()) errors.businessAddress = "Business address is required";
        if (!formData.city.trim()) errors.city = "City is required";
        if (!formData.state.trim()) errors.state = "State is required";
        if (!formData.zipCode.trim()) errors.zipCode = "Zip code is required";
        break;
      case 4:
        if (!formData.websiteUrl.trim()) errors.websiteUrl = "Website URL is required";
        if (!formData.googleBusinessProfileUrl.trim()) errors.googleBusinessProfileUrl = "Google Business Profile URL is required";
        break;
      case 5:
        if (!formData.primaryGoal) errors.primaryGoal = "Primary goal is required";
        break;
    }
    
    return errors;
  }, []);

  return { validateStep };
};

// ========================================
// MAIN COMPONENT
// ========================================
const ComprehensiveAuditForm = ({ onSubmit, isLoading: externalLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState({});
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { validateStep } = useFormValidation();

  const fillWithMockData = useCallback(() => {
    setFormData(MOCK_DATA);
    setIsUsingMockData(true);
    setValidationErrors({});
  }, []);

  const clearForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setIsUsingMockData(false);
    setValidationErrors({});
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    if (isUsingMockData && JSON.stringify({...formData, [field]: value}) !== JSON.stringify(MOCK_DATA)) {
      setIsUsingMockData(false);
    }
  }, [formData, isUsingMockData, validationErrors]);

  const handleCheckboxChange = useCallback((value) => {
    const field = "marketingChallenges";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
    
    if (isUsingMockData) {
      setIsUsingMockData(false);
    }
  }, [isUsingMockData]);

  const handleCurrentMarketingChange = useCallback((value) => {
    const field = "currentMarketing";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
    
    if (isUsingMockData) {
      setIsUsingMockData(false);
    }
  }, [isUsingMockData]);

  const nextStep = useCallback(() => {
    const errors = validateStep(currentStep, formData);
    if (Object.keys(errors).length === 0) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setValidationErrors(errors);
    }
  }, [currentStep, formData, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  }, [currentStep]);

  const handleSubmit = useCallback(() => {
    const finalErrors = validateStep(currentStep, formData);
    if (Object.keys(finalErrors).length > 0) {
      setValidationErrors(finalErrors);
      return;
    }
    
    setIsLoading(true);
    
    const cleanedData = cleanFormData(formData);
    
    const auditData = {
      businessName: cleanedData.businessName.trim(),
      businessType: cleanedData.tradeType,
      primaryServices: cleanedData.primaryServices.trim(),
      city: cleanedData.city.trim(),
      state: cleanedData.state.trim(),
      address: cleanedData.businessAddress.trim(),
      zipCode: cleanedData.zipCode.trim(),
      location: `${cleanedData.city.trim()}, ${cleanedData.state.trim()}`,
      phone: cleanedData.businessPhone.trim(),
      website: cleanedData.websiteUrl.trim(),
      serviceAreas: cleanedData.serviceAreas.trim(),
      primaryGoal: cleanedData.primaryGoal,
      marketingChallenges: cleanedData.marketingChallenges,
      currentMarketing: cleanedData.currentMarketing,
      monthlyBudget: cleanedData.monthlyBudget,
      contactInfo: {
        firstName: cleanedData.firstName.trim(),
        lastName: cleanedData.lastName.trim(),
        email: cleanedData.email.trim(),
        phone: cleanedData.contactPhone.trim(),
      },
      businessContext: {
        socialMedia: {
          googleBusinessProfile: cleanedData.googleBusinessProfileUrl.trim(),
          managesGoogleProfile: cleanedData.managesGoogleProfile,
          facebook: cleanedData.facebookUrl.trim(),
          instagram: cleanedData.instagramUrl.trim(),
        }
      },
      submissionMetadata: {
        isMockData: isUsingMockData,
        mockDataSource: isUsingMockData ? "LM Finishing ActivePieces Submission 5/8/2025" : null,
        submittedAt: new Date().toISOString(),
        formVersion: "3.0-refactored",
        completedSteps: currentStep,
      }
    };
    
    // FIXED: Call the parent onSubmit function instead of showing an alert
    if (onSubmit) {
      onSubmit(auditData);
      // The parent component will handle the loading state
      setIsLoading(false);
    } else {
      // Fallback if no onSubmit prop is provided (for testing)
      setTimeout(() => {
        setIsLoading(false);
        console.log('Audit data submitted:', auditData);
        alert('🎉 Audit completed! Check console for data.');
      }, 3000);
    }
  }, [currentStep, formData, isUsingMockData, validateStep, onSubmit]);

  // Use external loading state if provided, otherwise use internal
  const loadingState = externalLoading !== undefined ? externalLoading : isLoading;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: COLORS.primary }}>
              Contact Information
            </h3>
            <p style={{ marginBottom: "32px", color: COLORS.textSecondary }}>
              Let's start with your basic contact details
            </p>

            <MockDataControls 
              isUsingMockData={isUsingMockData}
              onFillMockData={fillWithMockData}
              onClearForm={clearForm}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <InputField
                fieldKey="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleInputChange("firstName", value)}
                placeholder="John"
                required
                validationErrors={validationErrors}
              />
              <InputField
                fieldKey="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleInputChange("lastName", value)}
                placeholder="Smith"
                required
                validationErrors={validationErrors}
              />
            </div>

            <InputField
              fieldKey="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="john@example.com"
              required
              validationErrors={validationErrors}
            />

            <InputField
              fieldKey="contactPhone"
              label="Phone Number"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => handleInputChange("contactPhone", value)}
              placeholder="(555) 123-4567"
              required
              validationErrors={validationErrors}
            />
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: COLORS.primary }}>
              Business Information
            </h3>
            <p style={{ marginBottom: "32px", color: "#666" }}>
              Tell us about your business
            </p>

            <InputField
              fieldKey="businessName"
              label="Business Name"
              value={formData.businessName}
              onChange={(value) => handleInputChange("businessName", value)}
              placeholder="Exactly as it appears on Google Maps"
              required
              validationErrors={validationErrors}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <InputField
                  fieldKey="tradeType"
                  label="Trade Type / Industry"
                  value={formData.tradeType}
                  onChange={(value) => handleInputChange("tradeType", value)}
                  placeholder="Select your business type..."
                  options={TRADE_TYPES}
                  required
                  validationErrors={validationErrors}
                />
                
                {formData.tradeType === "Other" && (
                  <InputField
                    fieldKey="customTradeType"
                    label="Please specify your trade type"
                    value={formData.customTradeType}
                    onChange={(value) => handleInputChange("customTradeType", value)}
                    placeholder="Enter your specific trade type..."
                    required
                    validationErrors={validationErrors}
                  />
                )}
              </div>
              
              <InputField
                fieldKey="businessPhone"
                label="Business Phone Number"
                type="tel"
                value={formData.businessPhone}
                onChange={(value) => handleInputChange("businessPhone", value)}
                placeholder="(555) 123-4567"
                required
                validationErrors={validationErrors}
              />
            </div>
            
            <InputField
              fieldKey="primaryServices"
              label="Primary Services"
              value={formData.primaryServices}
              onChange={(value) => handleInputChange("primaryServices", value)}
              placeholder="Kitchen Remodeling, Bathroom Finishing, Custom Carpentry, Deck Building..."
              textarea
              required
              validationErrors={validationErrors}
            />
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: COLORS.primary }}>
              Business Location & Service Area
            </h3>
            <p style={{ marginBottom: "32px", color: "#666" }}>
              Where is your business located and what areas do you serve?
            </p>

            <InputField
              fieldKey="businessAddress"
              label="Business Address"
              value={formData.businessAddress}
              onChange={(value) => handleInputChange("businessAddress", value)}
              placeholder="123 Main Street"
              required
              validationErrors={validationErrors}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "20px" }}>
              <InputField
                fieldKey="city"
                label="City"
                value={formData.city}
                onChange={(value) => handleInputChange("city", value)}
                placeholder="City"
                required
                validationErrors={validationErrors}
              />
              <InputField
                fieldKey="state"
                label="State"
                value={formData.state}
                onChange={(value) => handleInputChange("state", value)}
                placeholder="State"
                required
                validationErrors={validationErrors}
              />
              <InputField
                fieldKey="zipCode"
                label="Zip Code"
                value={formData.zipCode}
                onChange={(value) => handleInputChange("zipCode", value)}
                placeholder="12345"
                required
                validationErrors={validationErrors}
              />
            </div>

            <InputField
              fieldKey="serviceAreas"
              label="Service Areas"
              value={formData.serviceAreas}
              onChange={(value) => handleInputChange("serviceAreas", value)}
              placeholder="List cities/areas you serve (e.g., Within 15 miles of downtown, City 1, City 2, City 3)"
              textarea
              validationErrors={validationErrors}
            />
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: COLORS.primary }}>
              Online Presence
            </h3>
            <p style={{ marginBottom: "24px", color: "#666" }}>
              Let's audit your current digital footprint
            </p>

            <div style={{
              background: "#FEF2F2",
              border: `2px solid ${COLORS.danger}`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "32px",
            }}>
              <div style={{
                color: COLORS.danger,
                fontWeight: "600",
                fontSize: "16px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                ⚠️ Important: Complete Information = Better Report
              </div>
              <p style={{
                margin: 0,
                fontSize: "14px",
                color: COLORS.danger,
                lineHeight: "1.5"
              }}>
                The more information we have about your online presence, the more accurate and comprehensive your audit report will be. Please fill out everything that is applicable to your business, even if some fields are optional.
              </p>
            </div>

            <InputField
              fieldKey="websiteUrl"
              label="Website URL"
              type="url"
              value={formData.websiteUrl}
              onChange={(value) => handleInputChange("websiteUrl", value)}
              placeholder="https://www.yourwebsite.com"
              required
              validationErrors={validationErrors}
            />

            <InputField
              fieldKey="googleBusinessProfileUrl"
              label="Google Business Profile URL"
              type="url"
              value={formData.googleBusinessProfileUrl}
              onChange={(value) => handleInputChange("googleBusinessProfileUrl", value)}
              placeholder="https://maps.google.com/..."
              required
              validationErrors={validationErrors}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <InputField
                fieldKey="managesGoogleProfile"
                label="Do you manage your Google Business Profile?"
                value={formData.managesGoogleProfile}
                onChange={(value) => handleInputChange("managesGoogleProfile", value)}
                options={[
                  "Yes, I manage it myself",
                  "Someone else manages it",
                  "Not sure",
                  "No, nobody manages it",
                ]}
                placeholder="Select option..."
                validationErrors={validationErrors}
              />
              <InputField
                fieldKey="facebookUrl"
                label="Facebook Business Page URL"
                type="url"
                value={formData.facebookUrl}
                onChange={(value) => handleInputChange("facebookUrl", value)}
                placeholder="https://facebook.com/yourbusiness"
                validationErrors={validationErrors}
              />
            </div>

            <InputField
              fieldKey="instagramUrl"
              label="Instagram Business Page URL"
              type="url"
              value={formData.instagramUrl}
              onChange={(value) => handleInputChange("instagramUrl", value)}
              placeholder="https://instagram.com/yourbusiness"
              validationErrors={validationErrors}
            />
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: COLORS.primary }}>
              Business Goals & Marketing
            </h3>
            <p style={{ marginBottom: "32px", color: "#666" }}>
              Help us understand your marketing objectives
            </p>

            <InputField
              fieldKey="primaryGoal"
              label="Primary Marketing Goal"
              value={formData.primaryGoal}
              onChange={(value) => handleInputChange("primaryGoal", value)}
              options={[
                "Get More Leads", "Improve Online Reviews", "Increase Local Visibility",
                "Beat Competitors", "Build Brand Awareness", "Expand Service Area",
                "Launch New Services", "Improve Website Performance",
              ]}
              placeholder="Select your main goal..."
              required
              validationErrors={validationErrors}
            />

            <InputField
              fieldKey="monthlyBudget"
              label="Monthly Marketing Budget"
              value={formData.monthlyBudget}
              onChange={(value) => handleInputChange("monthlyBudget", value)}
              options={[
                "Under $500", "$500-$1,000", "$1,000-$2,500", "$2,500-$5,000", "$5,000+",
              ]}
              placeholder="Select budget range..."
              validationErrors={validationErrors}
            />

            <CheckboxGroup
              label="What Are Your Main Marketing Challenges? (Select all that apply)"
              options={MARKETING_CHALLENGES}
              selectedValues={formData.marketingChallenges}
              onChange={handleCheckboxChange}
            />

            <CheckboxGroup
              label="What Are You Currently Doing For Marketing? (Select all that apply)"
              options={MARKETING_METHODS}
              selectedValues={formData.currentMarketing}
              onChange={handleCurrentMarketingChange}
            />

            <div style={{
              background: COLORS.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${COLORS.primary}`,
              marginTop: "24px",
            }}>
              <h4 style={{ color: COLORS.primary, marginBottom: "12px", fontSize: "16px" }}>
                🎯 What happens next?
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", color: COLORS.primary, fontSize: "14px" }}>
                <li>We'll analyze your digital presence across 1,000+ data points and 150+ ranking factors</li>
                <li>Compare your performance against local competitors</li>
                <li>Identify specific opportunities for growth</li>
                <li>Create a prioritized action plan</li>
                <li>Deliver your comprehensive audit in 2-3 minutes</li>
              </ul>
              
              {isUsingMockData && (
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: COLORS.success + "20",
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.success}40`,
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: "14px",
                    color: COLORS.success,
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    ✓ Using LM Finishing mock data for comparison testing
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1a2b38 100%)`,
      minHeight: "100vh",
      padding: "20px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          background: COLORS.white,
          padding: "12px 24px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}>
          <div style={{
            width: "24px",
            height: "24px",
            marginRight: "12px",
            background: COLORS.primary,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.white,
            fontWeight: "bold",
            fontSize: "14px",
          }}>
            ✕
          </div>
          <span style={{ fontSize: "18px", fontWeight: "600", color: COLORS.primary }}>
            BRANDAIDE
          </span>
        </div>

        <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "12px", color: COLORS.white }}>
          Comprehensive Business Audit
        </h1>
        <p style={{
          fontSize: "18px",
          color: COLORS.white,
          opacity: "0.9",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          Get a detailed analysis of your digital presence and actionable recommendations to grow your business
        </p>
      </div>

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: COLORS.white,
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      }}>
        <StepIndicator currentStep={currentStep} />
        
        {renderStepContent()}

        <ValidationErrorSummary validationErrors={validationErrors} />

        <NavigationButtons
          currentStep={currentStep}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmit={handleSubmit}
          isLoading={loadingState}
          validationErrors={validationErrors}
        />
      </div>
    </div>
  );
};

export default ComprehensiveAuditForm;