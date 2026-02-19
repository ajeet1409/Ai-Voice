# Component Structure Documentation

This document explains the refactored component structure of the AI HR Calling Agent application.

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── AnimatedBackground.jsx
│   ├── CallDetailsSection.jsx
│   ├── CallHistoryList.jsx
│   ├── CampaignTab.jsx
│   └── SingleCallTab.jsx
├── styles/              # Centralized styling
│   ├── appStyles.js     # Main styles object
│   └── animations.css   # CSS animations and effects
├── App.jsx              # Main application component
└── main.jsx             # Application entry point
```

## 🧩 Components Overview

### 1. AnimatedBackground.jsx
**Purpose**: Creates an interactive particle background effect

**Features**:
- Floating particles with random movement
- Mouse interaction (particles move away from cursor)
- Responsive to window resize
- Gradient overlay effects

**Props**:
- `canvasRef`: React ref for the canvas element
- `styles`: Style object

**Usage**:
```jsx
<AnimatedBackground canvasRef={canvasRef} styles={styles} />
```

---

### 2. SingleCallTab.jsx
**Purpose**: Handles single call functionality

**Features**:
- Phone number input with validation
- Call initiation button
- Loading states
- Status messages (success/error)

**Props**:
- `phoneNumber`: Current phone number value
- `setPhoneNumber`: Function to update phone number
- `onMakeCall`: Callback to initiate a call
- `isLoading`: Loading state indicator
- `status`: Status object with type and message
- `styles`: Style object

**Usage**:
```jsx
<SingleCallTab
  phoneNumber={phoneNumber}
  setPhoneNumber={setPhoneNumber}
  onMakeCall={makeCall}
  isLoading={isLoading}
  status={status}
  styles={styles}
/>
```

---

### 3. CampaignTab.jsx
**Purpose**: Handles bulk campaign creation

**Features**:
- Campaign name input
- CSV file upload
- File validation
- Campaign creation
- CSV format example display

**Props**:
- `campaignName`: Current campaign name value
- `setCampaignName`: Function to update campaign name
- `csvFile`: Selected CSV file
- `setCsvFile`: Function to update CSV file
- `onCreateCampaign`: Callback to create campaign
- `isLoading`: Loading state indicator
- `status`: Status object with type and message
- `styles`: Style object

**CSV Format**:
```csv
phone
+1234567890
+1987654321
```

**Usage**:
```jsx
<CampaignTab
  campaignName={campaignName}
  setCampaignName={setCampaignName}
  csvFile={csvFile}
  setCsvFile={setCsvFile}
  onCreateCampaign={createCampaign}
  isLoading={isLoading}
  status={status}
  styles={styles}
/>
```

---

### 4. CallHistoryList.jsx
**Purpose**: Displays paginated list of call history

**Features**:
- Shows 10 calls per page
- Pagination controls (Previous/Next)
- Click on call to view details
- Refresh button
- Loading states
- Empty state display

**Props**:
- `callsList`: Array of call objects
- `currentPage`: Current page number
- `setCurrentPage`: Function to update current page
- `onCallClick`: Callback when a call is clicked
- `onRefresh`: Callback to refresh the call list
- `isLoading`: Loading state indicator
- `styles`: Style object

**Usage**:
```jsx
<CallHistoryList
  callsList={callsList}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  onCallClick={fetchCallDetails}
  onRefresh={fetchCallsList}
  isLoading={isLoadingCalls}
  styles={styles}
/>
```

---

### 5. CallDetailsSection.jsx
**Purpose**: Displays detailed information about a selected call

**Features**:
- Call analysis with extracted candidate information
- Call recording player
- Call transcript display
- Full raw JSON data
- Back to list navigation

**Extracted Information**:
- Candidate Name
- City Location
- Position Applied
- Education Background
- Total Experience
- Last Job Role
- Key Skills
- Motivation to Join
- Expected Salary
- Notice Period
- Previous Company Experience
- Candidate Questions

**Props**:
- `call`: The call object containing all call data
- `onBack`: Callback function to return to call list
- `styles`: Style object

**Usage**:
```jsx
<CallDetailsSection
  call={selectedCall}
  onBack={handleBackToList}
  styles={styles}
/>
```

---

## 🎨 Styling System

### appStyles.js
Centralized styles object containing all component styles organized by section:
- Layout & Container Styles
- Animated Background Styles
- Header Styles
- Card & Panel Styles
- Tab Navigation Styles
- Form Styles
- Button Styles
- File Upload Styles
- Status Message Styles
- Feature Grid Styles
- Call History Styles
- Call Details Styles

### animations.css
CSS animations and interactive effects:
- Button hover effects
- Tab hover effects
- Call item hover effects
- File upload hover effects
- Input focus effects
- Loading spinner animation
- Slide in animation
- Fade in animation
- Pulse animation
- Ripple effect
- Glow effect
- Custom scrollbar
- Audio player styling

**CSS Classes**:
- `.primary-button` - Primary action buttons with gradient and glow
- `.interactive-button` - General interactive elements
- `.tab-button` - Tab navigation buttons
- `.call-item` - Call history items
- `.spinner` - Loading spinner
- `.fade-in` - Fade in animation
- `.status-pulse` - Pulsing status indicators
- `.ripple` - Ripple effect on click
- `.feature-card-glow` - Glowing feature cards

---

## 🔄 Data Flow

```
App.jsx (Main Component)
    ├── State Management
    ├── API Functions
    │   ├── makeCall()
    │   ├── fetchCallsList()
    │   ├── fetchCallDetails()
    │   └── createCampaign()
    └── Child Components
        ├── AnimatedBackground
        ├── SingleCallTab
        ├── CampaignTab
        ├── CallHistoryList
        └── CallDetailsSection
```

---

## 🚀 Usage Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import SingleCallTab from './components/SingleCallTab';
import styles from './styles/appStyles';
import './styles/animations.css';

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const canvasRef = useRef(null);
  
  const makeCall = async () => {
    // API call logic
  };
  
  return (
    <div style={styles.container}>
      <AnimatedBackground canvasRef={canvasRef} styles={styles} />
      <SingleCallTab
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        onMakeCall={makeCall}
        isLoading={false}
        status={{ type: '', message: '' }}
        styles={styles}
      />
    </div>
  );
}
```

---

## 📝 Best Practices

1. **Component Reusability**: Each component is self-contained and reusable
2. **Props Validation**: Always validate props before using them
3. **Error Handling**: Handle errors gracefully with user-friendly messages
4. **Loading States**: Show loading indicators for async operations
5. **Accessibility**: Use semantic HTML and ARIA labels where appropriate
6. **Performance**: Use React.memo() for expensive components if needed
7. **Code Comments**: Add JSDoc comments for functions and components

---

## 🐛 Troubleshooting

### Component not rendering?
- Check if all required props are passed
- Verify import paths are correct
- Check browser console for errors

### Styles not applying?
- Ensure `styles` object is imported correctly
- Check if `animations.css` is imported in App.jsx
- Verify CSS class names match

### API calls failing?
- Check API_TOKEN, ASSISTANT_ID, and PHONE_NUMBER_ID
- Verify network connection
- Check browser console for error messages

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vapi AI API Documentation](https://docs.vapi.ai/)
- [Lucide React Icons](https://lucide.dev/)

---

**Last Updated**: October 29, 2024
**Version**: 2.0

