'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to reservations page
      router.push('/reservations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937'
      }}>
        Sign In
      </h2>
      
      {error && (
        <div style={{ 
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '4px',
          border: '1px solid #fca5a5'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Email Address
          </div>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#1f2937',
              '&::placeholder': {
                color: '#6b7280'
              },
              '--tw-text-opacity': '1',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Password
          </div>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#1f2937',
              '&::placeholder': {
                color: '#6b7280'
              },
              '--tw-text-opacity': '1',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#d97706',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{ 
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p style={{ 
            fontSize: '14px',
            color: '#4b5563'
          }}>
            Don't have an account?{' '}
            <Link 
              href="/register" 
              style={{ 
                color: '#d97706',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
} 