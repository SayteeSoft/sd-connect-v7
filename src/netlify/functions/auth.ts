
import type { Handler, HandlerEvent } from '@netlify/functions';
import { getProfilesFromStore } from './utils/store';
import type { Profile } from './utils/types';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, password, profiles: clientProfiles } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }
    
    // If a list of profiles is passed from the client (e.g., after signup), use it.
    // Otherwise, always fetch the latest from the store to ensure reliability.
    const profilesToSearch: Profile[] = clientProfiles || await getProfilesFromStore();

    const foundUser = profilesToSearch.find(
      (p: Profile) => p.email && p.email.toLowerCase() === email.toLowerCase() && p.password === password
    );

    if (foundUser) {
      // In a real app, you'd return a JWT here. For this prototype, returning the user is sufficient.
      const { password, ...userToReturn } = foundUser;
      return {
        statusCode: 200,
        body: JSON.stringify({ user: userToReturn }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};
