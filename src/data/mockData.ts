export const DEPARTMENTS = [
  { id: '1', name: 'OPD', waitingCount: 12 },
  { id: '2', name: 'General Consultation', waitingCount: 8 },
  { id: '3', name: 'Emergency', waitingCount: 5 },
  { id: '4', name: 'Cardiology', waitingCount: 3 },
  { id: '5', name: 'Orthopedics', waitingCount: 7 },
  { id: '6', name: 'Pediatrics', waitingCount: 10 },
  { id: '7', name: 'General Medicine', waitingCount: 15 },
  { id: '8', name: 'Dermatology', waitingCount: 4 },
  { id: '9', name: 'ENT', waitingCount: 6 },
  { id: '10', name: 'Gynecology', waitingCount: 9 },
];

export const HOSPITAL_STATS = {
  waiting: 79,
  serving: 12,
  completed: 145,
};

export const QUICK_ACTIONS = [
  { id: 'join', title: 'Join Queue', icon: 'add-circle', screen: 'JoinQueue' },
  { id: 'scan', title: 'Scan QR', icon: 'qr-code', screen: 'ScanQR' },
  { id: 'status', title: 'My Status', icon: 'time', screen: 'MyStatus' },
  { id: 'ivr', title: 'IVR Phone', icon: 'call', screen: 'IVR' },
];
