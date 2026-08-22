/**
 * AWS Amplify Integration Configuration & Service Placeholders
 * 
 * Ready for full AWS Amplify backend integration (AWS Cognito, AppSync GraphQL, DynamoDB & S3).
 * To connect your live AWS Amplify backend:
 * 1. Run `amplify init` / `amplify add auth` / `amplify add api` in your Amplify CLI.
 * 2. Update awsAmplifyConfig with your generated `aws-exports.js` values.
 */

export interface AWSAmplifyConfig {
  Auth: {
    region: string;
    userPoolId?: string;
    userPoolWebClientId?: string;
    identityPoolId?: string;
    mandatorySignIn?: boolean;
  };
  API?: {
    GraphQL?: {
      endpoint: string;
      region: string;
      defaultAuthMode: 'apiKey' | 'userPool' | 'iam' | 'oidc';
      apiKey?: string;
    };
    REST?: Record<string, {
      endpoint: string;
      region: string;
    }>;
  };
  Storage?: {
    S3?: {
      bucket: string;
      region: string;
    };
  };
}

// AWS Amplify project configuration placeholder
export const awsAmplifyConfig: AWSAmplifyConfig = {
  Auth: {
    region: 'ap-south-1',
    userPoolId: process.env.VITE_AWS_USER_POOL_ID || '',
    userPoolWebClientId: process.env.VITE_AWS_CLIENT_ID || '',
    mandatorySignIn: false,
  },
  API: {
    GraphQL: {
      endpoint: process.env.VITE_AWS_APPSYNC_ENDPOINT || '',
      region: 'ap-south-1',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.VITE_AWS_APPSYNC_API_KEY || '',
    }
  }
};

export interface AmplifyUserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    username?: string;
  } | null;
  session: {
    accessToken?: string;
    idToken?: string;
  } | null;
}

type AuthStateCallback = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: AmplifyUserSession['session'] & { user?: AmplifyUserSession['user'] }) => void;

class AmplifyAuthPlaceholder {
  private listeners: Set<AuthStateCallback> = new Set();
  private currentSession: AmplifyUserSession = {
    user: null,
    session: null
  };

  constructor() {
    this.initSessionFromStorage();
  }

  private initSessionFromStorage() {
    try {
      const savedUser = localStorage.getItem('amplify_auth_user') || localStorage.getItem('user_profile');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const email = parsed.email || parsed.userId || '';
        const name = parsed.customerName || parsed.name || (email ? email.split('@')[0] : '');
        if (email || name) {
          this.currentSession = {
            user: {
              id: parsed.id || `usr-${Date.now()}`,
              email,
              name,
              username: name || email
            },
            session: {
              accessToken: 'placeholder-jwt-access-token',
              idToken: 'placeholder-jwt-id-token'
            }
          };
        }
      }
    } catch (e) {
      console.warn('Amplify auth session initialization notice:', e);
    }
  }

  public async signInWithPassword(params: { email: string; password?: string }): Promise<{
    data: { user: AmplifyUserSession['user']; session: AmplifyUserSession['session'] };
    error: { message: string } | null;
  }> {
    const { email } = params;
    
    // AWS Amplify Cognito sign-in placeholder handler
    if (!email || !email.includes('@')) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid email address provided.' }
      };
    }

    const username = email.split('@')[0] || 'ssroadways';
    const user = {
      id: `usr_${Date.now()}`,
      email,
      name: username,
      username
    };

    const session = {
      accessToken: `amplify_token_${Date.now()}`,
      idToken: `amplify_id_${Date.now()}`
    };

    this.currentSession = { user, session };
    localStorage.setItem('amplify_auth_user', JSON.stringify(user));

    // Notify auth state subscribers
    this.notifyListeners('SIGNED_IN', { ...session, user });

    return {
      data: { user, session },
      error: null
    };
  }

  public async getSession(): Promise<{ data: { session: AmplifyUserSession['session'] & { user?: AmplifyUserSession['user'] } | null } }> {
    if (this.currentSession.user) {
      return {
        data: {
          session: {
            ...this.currentSession.session,
            user: this.currentSession.user
          }
        }
      };
    }
    return { data: { session: null } };
  }

  public onAuthStateChange(callback: AuthStateCallback): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          }
        }
      }
    };
  }

  public async signOut(): Promise<{ error: null }> {
    this.currentSession = { user: null, session: null };
    localStorage.removeItem('amplify_auth_user');
    this.notifyListeners('SIGNED_OUT', {});
    return { error: null };
  }

  public async resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<{ error: null }> {
    // AWS Amplify Auth.forgotPassword / resetPassword placeholder
    console.info(`AWS Amplify Auth: Password reset initiated for ${email}`);
    return { error: null };
  }

  public async resend(params: { type?: string; email: string; options?: any }): Promise<{ error: null }> {
    // AWS Amplify Auth.resendSignUp placeholder
    console.info(`AWS Amplify Auth: Resent verification code to ${params.email}`);
    return { error: null };
  }

  private notifyListeners(event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: any) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, session);
      } catch (err) {
        console.error('Error notifying auth state change listener:', err);
      }
    });
  }
}

// Export singleton placeholder auth client ready for AWS Amplify backend
export const amplifyAuth = new AmplifyAuthPlaceholder();

// AWS Amplify API & DataStore placeholder interface
export const amplifyData = {
  products: {
    query: async () => [],
    create: async (item: any) => item,
    update: async (item: any) => item,
    delete: async (id: string) => ({ id }),
  },
  orders: {
    query: async () => [],
    create: async (item: any) => item,
    update: async (item: any) => item,
  }
};
