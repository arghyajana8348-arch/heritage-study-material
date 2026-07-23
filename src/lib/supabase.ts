import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

function isValidHttpUrl(string: string) {
  if (!string || string.includes("your_supabase_url") || string.includes("MY_SUPABASE_URL")) {
    return false;
  }
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function isValidKey(string: string) {
  if (!string || string.includes("your_supabase_anon_key") || string.includes("MY_SUPABASE_ANON_KEY")) {
    return false;
  }
  return string.length > 10;
}

const isConfigured = isValidHttpUrl(rawUrl) && isValidKey(rawKey);

const createMockClient = (msg?: string) => {
  const defaultError = new Error(
    msg || "Supabase is not configured. Please add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );

  const mockQuery = () => {
    const chainable: any = new Proxy(
      {
        then: (resolve: any) => resolve({ data: [], error: null }),
        catch: () => Promise.resolve({ data: [], error: null }),
      },
      {
        get(target, prop) {
          if (prop in target) return (target as any)[prop];
          if (prop === "single") return () => Promise.resolve({ data: null, error: null });
          return () => chainable;
        },
      }
    );
    return chainable;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_cb?: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async (..._args: any[]) => ({ data: { session: null }, error: defaultError }),
      signInWithPassword: async (..._args: any[]) => ({ data: { session: null }, error: defaultError }),
      signUp: async (..._args: any[]) => ({ data: { session: null }, error: defaultError }),
      resetPasswordForEmail: async (..._args: any[]) => ({ data: null, error: defaultError }),
      updateUser: async (..._args: any[]) => ({ data: null, error: defaultError }),
      signOut: async () => ({ error: null }),
    },
    from: mockQuery,
  };
};

const mock = createMockClient();

let rawClient: any = null;

if (isConfigured) {
  try {
    rawClient = createClient(rawUrl, rawKey);
  } catch (err) {
    console.warn("Failed to create Supabase client:", err);
  }
} else {
  console.warn("Supabase URL or Anon Key is missing or invalid placeholder. Using mock client.");
}

function makeSafeQuery(queryBuilder: any): any {
  if (!queryBuilder) return mock.from();
  return new Proxy(queryBuilder, {
    get(target, prop, receiver) {
      if (prop === "then") {
        return function (onfulfilled?: any, onrejected?: any) {
          return Promise.resolve()
            .then(() => target)
            .then(
              (res) => (onfulfilled ? onfulfilled(res) : res),
              (err) => {
                console.warn("Supabase query error caught:", err);
                const safeRes = { data: [], error: err };
                return onfulfilled ? onfulfilled(safeRes) : safeRes;
              }
            );
        };
      }
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === "function") {
        return function (...args: any[]) {
          try {
            const result = val.apply(target, args);
            if (result && (typeof result === "object" || typeof result === "function")) {
              return makeSafeQuery(result);
            }
            return result;
          } catch (err: any) {
            console.warn(`Supabase builder error on ${String(prop)}:`, err);
            return mock.from();
          }
        };
      }
      return val;
    },
  });
}

// Safe wrapper that intercepts network failures like "Failed to fetch"
export const supabase = {
  auth: {
    getSession: async () => {
      if (!rawClient) return mock.auth.getSession();
      try {
        return await rawClient.auth.getSession();
      } catch (err: any) {
        console.warn("Supabase auth error caught:", err);
        return { data: { session: null }, error: err };
      }
    },
    onAuthStateChange: (callback: any) => {
      if (!rawClient) return mock.auth.onAuthStateChange(callback);
      try {
        return rawClient.auth.onAuthStateChange(callback);
      } catch (err: any) {
        console.warn("Supabase onAuthStateChange error caught:", err);
        return mock.auth.onAuthStateChange(callback);
      }
    },
    signInWithOAuth: async (options: any) => {
      if (!rawClient) return mock.auth.signInWithOAuth();
      try {
        return await rawClient.auth.signInWithOAuth(options);
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    signInWithPassword: async (credentials: any) => {
      if (!rawClient) return mock.auth.signInWithPassword();
      try {
        return await rawClient.auth.signInWithPassword(credentials);
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    signUp: async (credentials: any) => {
      if (!rawClient) return mock.auth.signUp();
      try {
        return await rawClient.auth.signUp(credentials);
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    resetPasswordForEmail: async (email: string, options?: any) => {
      if (!rawClient) return mock.auth.resetPasswordForEmail();
      try {
        return await rawClient.auth.resetPasswordForEmail(email, options);
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    updateUser: async (attributes: any) => {
      if (!rawClient) return mock.auth.updateUser();
      try {
        return await rawClient.auth.updateUser(attributes);
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    signOut: async () => {
      if (!rawClient) return mock.auth.signOut();
      try {
        return await rawClient.auth.signOut();
      } catch (err: any) {
        return { error: err };
      }
    },
  },
  from: (table: string) => {
    if (!rawClient) return mock.from();
    try {
      const query = rawClient.from(table);
      return makeSafeQuery(query);
    } catch (err: any) {
      console.warn(`Supabase error accessing table ${table}:`, err);
      return mock.from();
    }
  },
};


