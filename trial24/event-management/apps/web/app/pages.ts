// TRACED:WEB-HOME
// TRACED:WEB-LOGIN
// TRACED:WEB-REGISTER
// TRACED:WEB-EVENTS-PAGE
// TRACED:WEB-VENUES-PAGE
// TRACED:WEB-SETTINGS-PAGE
// TRACED:WEB-SESSIONS-PAGE
// TRACED:WEB-SPEAKERS-PAGE
// TRACED:WEB-TICKETS-PAGE
// TRACED:WEB-LAYOUT

// Page route traceability index
// Each tag maps to the corresponding page.tsx in its route directory
export const PAGE_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  events: '/events',
  venues: '/venues',
  settings: '/settings',
  sessions: '/sessions',
  speakers: '/speakers',
  tickets: '/tickets',
} as const;
