import formatDateTime from '../helpers/formatDateTime';

const trailStartedAt = formatDateTime(new Date());
export const MockTestData = {
  // Mocked user data
  existingUserDetails: {
    firstName: 'existing',
    lastName: 'user',
    email: 'existing@example.com',
    password: 'password',
    confirmPassword: 'password',
    username: 'existing',
    pushNotificationsEnabled: true,
    themePreference: 'light',
    trailId: '1',
    trailProgress: '0.0',
    traiStartedAt: trailStartedAt,
  },
  unfoundUserDetails: {
    firstName: 'unfound',
    lastName: 'user',
    email: 'unfound@example.com',
    password: 'password',
    confirmPassword: 'password',
    username: 'unfound',
  },
  trails: [
    {
      "trail_id": 1,
      "trail_name": "Old Faithful trail",
      "trail_distance": "2.2",
      "trail_lat": "44.4601",
      "trail_long": "-110.8281",
      "trail_difficulty": "short",
      "park_id": "1",
      "trail_image_url": "https://www.nps.gov/articles/images/19255d.jpg?maxwtrail_idth=1300&maxheight=1300&autorotate=false",
      "trail_elevation": "0"
    },
    {
      "trail_id": 2,
      "trail_name": "Mount Washburn trail",
      "trail_distance": "6.2",
      "trail_lat": "44.8938",
      "trail_long": "-110.4037",
      "trail_difficulty": "moderate",
      "park_id": "2",
      "trail_image_url": "https://www.nps.gov/common/uploads/place/import/f3f0cc30-0062-4229-af63-db99985d9ab2_image_350.jpg",
      "trail_elevation": "0"
    },
    {
      "trail_id": 3,
      "trail_name": "Fairy Falls trail",
      "trail_distance": "8.3",
      "trail_lat": "44.6677",
      "trail_long": "-110.8656",
      "trail_difficulty": "moderate",
      "park_id": "3",
      "trail_image_url": "https://www.nps.gov/common/uploads/cropped_image/primary/6E135C3B-1DD8-B71B-0B48ABBCAE1A44D6.jpg?wtrail_idth=1300&quality=90&mode=crop",
      "trail_elevation": "0"
    }],
  parks: [
    { "park_id": 1, "park_name": "Acadia", "park_type": "National" },
    {
      "park_id": 2,
      "park_name": "American Samoa",
      "park_type": "National"
    },
    { "park_id": 3, "park_name": "Arches", "park_type": "National" }],
  park_states: [
    {
      "park_id": 1,
      "state_code": "ME",
      "state_name": "Maine"
    },
    {
      "park_id": 2,
      "state_code": "AS",
      "state_name": "American Samoa"
    },
    {
      "park_id": 3,
      "state_code": "UT",
      "state_name": "Utah"
    }],
  achievements: [
    {
      "achievement_id": 1,
      "achievement_name": "Hiker Extraordinaire",
      "achievement_description": "Hiked 50 miles",
      "achievement_image_url": "https://example.com/achievement1.png"
    },
    {
      "achievement_id": 2,
      "achievement_name": "Hiker Novice",
      "achievement_description": "Hiked 20 miles",
      "achievement_image_url": "https://example.com/achievement2.png"
    },
    {
      "achievement_id": 3,
      "achievement_name": "First of Many",
      "achievement_description": "First 1.0 Miles",
      "achievement_image_url": "https://example.com/achievement2.png"
    }
  ],
  sessionCategories: [
    { "session_category_id": 1, "session_category_name": "Chores" },
    { "session_category_id": 2, "session_category_name": "Cooking" },
    { "session_category_id": 3, "session_category_name": "Drawing" },
    { "session_category_id": 4, "session_category_name": "Driving" },
    { "session_category_id": 5, "session_category_name": "Errands" },
    { "session_category_id": 6, "session_category_name": "Family" },
    { "session_category_id": 7, "session_category_name": "Meditating" },
    { "session_category_id": 8, "session_category_name": "Other" },
    { "session_category_id": 9, "session_category_name": "Outdoors" },
    { "session_category_id": 10, "session_category_name": "Pets" },
    { "session_category_id": 11, "session_category_name": "Reading" },
    { "session_category_id": 12, "session_category_name": "Social" },
    { "session_category_id": 13, "session_category_name": "Sports" },
    { "session_category_id": 14, "session_category_name": "Study" },
    { "session_category_id": 15, "session_category_name": "Work" },
    { "session_category_id": 16, "session_category_name": "Workout" },
    { "session_category_id": 17, "session_category_name": "Writing" },
    { "session_category_id": 18, "session_category_name": "Yoga" }
  ]
};
