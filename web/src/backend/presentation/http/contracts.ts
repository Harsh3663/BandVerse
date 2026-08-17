/**
 * Complete BandVerse API contract map.
 * Path prefixes are mounted under /api/v1.
 */

export const apiRoutes = {
  health: { method: "GET", path: "/api/v1/health" },

  authLogin: { method: "POST", path: "/api/v1/auth/login" },
  authRegister: { method: "POST", path: "/api/v1/auth/register" },
  authRefresh: { method: "POST", path: "/api/v1/auth/refresh" },
  authLogout: { method: "POST", path: "/api/v1/auth/logout" },

  usersMe: { method: "GET", path: "/api/v1/users/me" },
  usersUpdateMe: { method: "PATCH", path: "/api/v1/users/me" },

  performersList: { method: "GET", path: "/api/v1/performers" },
  performersDetail: { method: "GET", path: "/api/v1/performers/:id" },
  performersByHandle: { method: "GET", path: "/api/v1/performers/handle/:handle" },

  organizersList: { method: "GET", path: "/api/v1/organizers" },
  organizersDetail: { method: "GET", path: "/api/v1/organizers/:id" },

  venuesList: { method: "GET", path: "/api/v1/venues" },
  venuesDetail: { method: "GET", path: "/api/v1/venues/:id" },
  venuesByHandle: { method: "GET", path: "/api/v1/venues/handle/:handle" },

  eventsList: { method: "GET", path: "/api/v1/events" },
  eventsCreate: { method: "POST", path: "/api/v1/events" },
  eventsDetail: { method: "GET", path: "/api/v1/events/:id" },
  eventsUpdate: { method: "PATCH", path: "/api/v1/events/:id" },

  bookingsList: { method: "GET", path: "/api/v1/bookings" },
  bookingsCreate: { method: "POST", path: "/api/v1/bookings" },
  bookingsDetail: { method: "GET", path: "/api/v1/bookings/:id" },
  bookingsTransition: { method: "POST", path: "/api/v1/bookings/:id/transitions" },

  applicationsList: { method: "GET", path: "/api/v1/applications" },
  applicationsCreate: { method: "POST", path: "/api/v1/applications" },
  applicationsDetail: { method: "GET", path: "/api/v1/applications/:id" },
  applicationsTransition: {
    method: "POST",
    path: "/api/v1/applications/:id/transitions",
  },

  contractsList: { method: "GET", path: "/api/v1/contracts" },
  contractsCreate: { method: "POST", path: "/api/v1/contracts" },
  contractsDetail: { method: "GET", path: "/api/v1/contracts/:id" },

  paymentsList: { method: "GET", path: "/api/v1/payments" },
  paymentsCreate: { method: "POST", path: "/api/v1/payments" },
  paymentsDetail: { method: "GET", path: "/api/v1/payments/:id" },

  messagesList: { method: "GET", path: "/api/v1/messages" },
  messagesCreate: { method: "POST", path: "/api/v1/messages" },
  conversationsList: { method: "GET", path: "/api/v1/conversations" },
  conversationsCreate: { method: "POST", path: "/api/v1/conversations" },
  conversationsDetail: { method: "GET", path: "/api/v1/conversations/:id" },
  conversationsMessages: {
    method: "GET",
    path: "/api/v1/conversations/:id/messages",
  },
  conversationsOffers: {
    method: "GET",
    path: "/api/v1/conversations/:id/offers",
  },
  conversationsOffersCreate: {
    method: "POST",
    path: "/api/v1/conversations/:id/offers",
  },
  conversationsTyping: {
    method: "POST",
    path: "/api/v1/conversations/:id/typing",
  },
  conversationsByBooking: {
    method: "GET",
    path: "/api/v1/conversations/by-booking/:bookingId",
  },
  messagingAnalytics: { method: "GET", path: "/api/v1/messaging/analytics" },

  venueEcosystemFacilities: {
    method: "GET",
    path: "/api/v1/venue-ecosystem/:venueId/facilities",
  },
  venueEcosystemGallery: {
    method: "GET",
    path: "/api/v1/venue-ecosystem/:venueId/gallery",
  },
  venueEcosystemGigs: {
    method: "GET",
    path: "/api/v1/venue-ecosystem/:venueId/gigs",
  },
  venueEcosystemDashboard: {
    method: "GET",
    path: "/api/v1/venue-ecosystem/:venueId/dashboard",
  },
  venueEcosystemAnalytics: {
    method: "GET",
    path: "/api/v1/venue-ecosystem/:venueId/analytics",
  },
  eventsDiscover: { method: "GET", path: "/api/v1/events/discover" },
  nearbyOpportunities: { method: "GET", path: "/api/v1/opportunities/nearby" },

  matchingPerformers: { method: "GET", path: "/api/v1/matching/performers" },
  matchingVenues: { method: "GET", path: "/api/v1/matching/venues" },
  matchingEvents: { method: "GET", path: "/api/v1/matching/events" },
  matchingAnalytics: { method: "GET", path: "/api/v1/matching/analytics" },

  vendorsList: { method: "GET", path: "/api/v1/vendors" },
  vendorsCreate: { method: "POST", path: "/api/v1/vendors" },
  vendorsDetail: { method: "GET", path: "/api/v1/vendors/:id" },
  vendorsTypes: { method: "GET", path: "/api/v1/vendors/types" },

  packagesList: { method: "GET", path: "/api/v1/packages" },
  packagesUpsert: { method: "PUT", path: "/api/v1/packages" },
  packagesDetail: { method: "GET", path: "/api/v1/packages/:id" },

  eventPlanner: { method: "POST", path: "/api/v1/event-planner" },
  eventPlannerPlansCreate: {
    method: "POST",
    path: "/api/v1/event-planner/plans",
  },
  eventPlannerPlansCustomize: {
    method: "PATCH",
    path: "/api/v1/event-planner/plans/:id",
  },
  eventPlannerAnalytics: {
    method: "GET",
    path: "/api/v1/event-planner/analytics",
  },
  eventPlannerAnalyticsTrack: {
    method: "POST",
    path: "/api/v1/event-planner/analytics",
  },

  budgetEstimator: { method: "POST", path: "/api/v1/budget-estimator" },

  reviewsList: { method: "GET", path: "/api/v1/reviews" },
  reviewsCreate: { method: "POST", path: "/api/v1/reviews" },

  recommendationsCreate: { method: "POST", path: "/api/v1/recommendations" },

  mediaList: { method: "GET", path: "/api/v1/media" },
  mediaCreate: { method: "POST", path: "/api/v1/media" },

  portfolioDetail: { method: "GET", path: "/api/v1/portfolio/:performerId" },
  portfolioUpdate: { method: "PUT", path: "/api/v1/portfolio/:performerId" },
  portfolioMediaList: {
    method: "GET",
    path: "/api/v1/portfolio/:performerId/media",
  },
  portfolioMediaCreate: {
    method: "POST",
    path: "/api/v1/portfolio/:performerId/media",
  },
  portfolioMediaUpdate: {
    method: "PATCH",
    path: "/api/v1/portfolio/:performerId/media/:mediaId",
  },
  portfolioMediaDelete: {
    method: "DELETE",
    path: "/api/v1/portfolio/:performerId/media/:mediaId",
  },
  portfolioSetlists: {
    method: "GET",
    path: "/api/v1/portfolio/:performerId/setlists",
  },
  portfolioSetlistsCreate: {
    method: "POST",
    path: "/api/v1/portfolio/:performerId/setlists",
  },
  portfolioVerified: {
    method: "GET",
    path: "/api/v1/portfolio/:performerId/verified",
  },
  portfolioVerifiedCreate: {
    method: "POST",
    path: "/api/v1/portfolio/:performerId/verified",
  },
  portfolioAvailability: {
    method: "GET",
    path: "/api/v1/portfolio/:performerId/availability",
  },
  portfolioAvailabilityUpsert: {
    method: "PUT",
    path: "/api/v1/portfolio/:performerId/availability",
  },
  portfolioAvailabilitySync: {
    method: "POST",
    path: "/api/v1/portfolio/:performerId/availability/sync-lifecycle",
  },
  portfolioAnalytics: {
    method: "GET",
    path: "/api/v1/portfolio/:performerId/analytics",
  },
  portfolioAnalyticsTrack: {
    method: "POST",
    path: "/api/v1/portfolio/:performerId/analytics",
  },
  portfolioAnalyticsWidgets: {
    method: "GET",
    path: "/api/v1/portfolio/:performerId/analytics/widgets",
  },
  discoveryRank: { method: "POST", path: "/api/v1/discovery/rank" },

  analyticsOrganizer: { method: "GET", path: "/api/v1/analytics/organizer" },
  analyticsPerformer: {
    method: "GET",
    path: "/api/v1/analytics/performer/:performerId",
  },

  notificationsList: { method: "GET", path: "/api/v1/notifications" },

  availabilityList: { method: "GET", path: "/api/v1/availability" },
  availabilityUpsert: { method: "PUT", path: "/api/v1/availability" },

  verificationSubmit: { method: "POST", path: "/api/v1/verification" },
  verificationReview: {
    method: "POST",
    path: "/api/v1/verification/:id/review",
  },

  adminUsers: { method: "GET", path: "/api/v1/admin/users" },
} as const;

export type ApiRouteKey = keyof typeof apiRoutes;
