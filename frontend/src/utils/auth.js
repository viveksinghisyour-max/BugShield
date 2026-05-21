export function getToken() {
  return localStorage.getItem("bugshield_token");
}

export function setSession(token, user) {
  localStorage.setItem("bugshield_token", token);
  localStorage.setItem("bugshield_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("bugshield_token");
  localStorage.removeItem("bugshield_user");
}

export function getUser() {
  try {
    const raw = localStorage.getItem("bugshield_user");
    let user = raw ? JSON.parse(raw) : null;
    
    // Fallback: if user object exists but role is missing (older sessions)
    // or if we just want to ensure it's normalized, we pull from JWT.
    if (user) {
      const token = getToken();
      if (token) {
        const payload = decodeJWT(token);
        if (payload && payload.role) {
          user.role = payload.role;
        }
      }
      if (user.role) {
        user.role = String(user.role).toLowerCase();
      }
    }
    
    return user;
  } catch (e) {
    return null;
  }
}

export function decodeJWT(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Properly decode UTF-8 characters
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  
  const payload = decodeJWT(token);
  if (!payload) return false; // Invalid token format
  
  // Check expiration if 'exp' claim exists (exp is in seconds)
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return false; // Token is expired
  }
  
  return true;
}

export function isAuthenticated() {
  const token = getToken();
  return isTokenValid(token);
}
