
import React, { useState } from 'react';
import { useCookieStore } from '../../lib/store';
import { Cookie } from 'lucide-react';
import './LoginScreen.css';

export function LoginScreen() {
  const { login } = useCookieStore();
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isAdminUser = user.trim().toLowerCase() === 'courtneys';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    const success = await login(user, pin);
    setIsLoggingIn(false);
    if (!success) {
      setError(
        isAdminUser
          ? 'Invalid password. Please enter your admin password.'
          : 'Invalid username or PIN. Ask your troop leader for your login info!'
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-pulse"><Cookie size={40} color="white" /></div>
          <h1>CookieCommand</h1>
          <p>Troop 04326 Portal</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              autoFocus
              placeholder="e.g. abigailn"
              value={user}
              onChange={e => { setUser(e.target.value); setError(''); }}
            />
          </div>
          <div className="field">
            <label>{isAdminUser ? 'Password' : 'PIN'}</label>
            <input
              type="password"
              placeholder={isAdminUser ? 'Enter your password' : '4-digit PIN'}
              maxLength={isAdminUser ? 64 : 4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              inputMode={isAdminUser ? undefined : 'numeric'}
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing In...' : 'Enter Portal'}
          </button>
        </form>
        <div className="login-footer">
          Ask your Troop Leader for your username and 4-digit PIN.<br />
          <strong>Admin?</strong> Username: courtneys
        </div>
      </div>
    </div>
  );
}
