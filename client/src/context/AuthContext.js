import { createContext } from "react";

// The shared "box" that holds auth data for the whole app
const AuthContext = createContext(null);

export default AuthContext;