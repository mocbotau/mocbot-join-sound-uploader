import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();
  const [token, setToken] = useState<string | null>(null);

  const fetchToken = async () => {
    let token;
    try {
      token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUDIENCE_URL,
        },
      });
    } catch (e: any) {
      if (e.error === "consent_required" || e.error === "login_required") {
        token = await getAccessTokenWithPopup({
          authorizationParams: {
            audience: import.meta.env.VITE_AUDIENCE_URL,
          },
        });
      } else {
        throw e;
      }
    }
    return token;
  };

  useEffect(() => {
    if (isAuthenticated && user && !token) {
      fetchToken().then((t) => setToken(t as string));
    }
  }, [isAuthenticated, user]);

  return { user, isAuthenticated, token, fetchToken };
};
