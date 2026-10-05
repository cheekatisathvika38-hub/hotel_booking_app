import { useContext } from "react";
import AuthContext from "../context/AuthContext.js";

// A custom hook: components call useAuth() instead of useContext(AuthContext)
const useAuth = () => useContext(AuthContext);

export default useAuth;