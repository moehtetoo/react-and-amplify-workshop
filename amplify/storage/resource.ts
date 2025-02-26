import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'userPhotos',
  access: (allow) => ({
    'profile-pictures/{entity_id}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  })
});