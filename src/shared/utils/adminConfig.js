const adminData = {
  '918188005373': { // Admin 1
    name: 'Admin 1',
    locations: ["Lanka", "Sigra", "Durgakund", "Mahmoorganj", "Bhelupur", "Ravindrapuri", "Kamachha", "Chitaipur", "Chetganj", "DLW", "Assi"]
  },
  '918756525373': { // Admin 2
    name: 'Admin 2',
    locations: ["Shivpur", "Pandeypur", "Sarnath", "Ashapur", "Pahadiya", "Orderly Bazar", "Gilat Bazar", "Bhojubeer", "Hukulganj", "Nadesar", "Hyderabad Gate", "Godowlia", "Bhagwanpur", "Nati Imli", "Lahartara", "Meerapur Basahi", "Tarna", "Susuwahi", "Sunderpur"]
  }
};

const defaultAdmin = {
  name: 'Support Team',
  phone: '918756525373'
}; // Default fallback

export const getAdminForLocation = (locationSlug) => {
  const locationName = locationSlug.replace(/-/g, ' ');

  for (const phone in adminData) {
    if (adminData[phone].locations.some(area => area.toLowerCase() === locationName.toLowerCase())) {
      return { phone, name: adminData[phone].name };
    }
  }
  return defaultAdmin;
};
