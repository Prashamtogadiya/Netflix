import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../api';
import { setUser } from '../features/user/userSlice';

export default function RedirectIfAuth({ children }) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(!!user);

  useEffect(() => {
    if (!user) {
      api.get('/auth/check')
        .then(res => {
          if (res.data.authenticated) {
            dispatch(setUser({
              userId: res.data.userId,
              email: res.data.email,
              role: res.data.role 
            }));
            setIsAuth(true);
          } else {
            setIsAuth(false);
          }
        })
        .catch(() => {
         
          setIsAuth(false);
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
      setIsAuth(true);
    }
  }, [user, dispatch]);

  if (checking) return null;

  if (isAuth) {
    return <Navigate to="/profiles" replace />;
  }
  return children;
}