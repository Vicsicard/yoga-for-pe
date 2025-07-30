'use client';

import { useState, useEffect } from 'react';
import styles from './auth-test.module.css';

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/auth-test');
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setTestResults(data);
      } catch (err) {
        console.error('Error running auth test:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  // Helper function to render status with appropriate color
  const renderStatus = (status) => {
    const statusColors = {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      pending: '#2196f3'
    };
    
    return (
      <span style={{ 
        color: statusColors[status] || '#000',
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Authentication System Test</h1>
      
      {loading && <p className={styles.loading}>Running tests...</p>}
      
      {error && (
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {testResults && (
        <div className={styles.results}>
          <div className={styles.summary}>
            <h2>Test Summary</h2>
            <p>
              Overall Status: {renderStatus(testResults.results.overall)}
            </p>
            <p>Timestamp: {new Date(testResults.timestamp).toLocaleString()}</p>
          </div>
          
          <div className={styles.section}>
            <h3>Database Connection</h3>
            <p>Status: {renderStatus(testResults.results.database.status)}</p>
            <p>{testResults.results.database.message}</p>
            {testResults.results.database.userCount !== undefined && (
              <p>User Count: {testResults.results.database.userCount}</p>
            )}
            {testResults.results.database.testUser && (
              <div className={styles.testUser}>
                <h4>Test User</h4>
                <p>ID: {testResults.results.database.testUser.id}</p>
                <p>Email: {testResults.results.database.testUser.email}</p>
                <p>Name: {testResults.results.database.testUser.name}</p>
                <p>Has Subscription: {testResults.results.database.testUser.hasSubscription ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
          
          <div className={styles.section}>
            <h3>Authentication</h3>
            <p>Status: {renderStatus(testResults.results.auth.status)}</p>
            {testResults.results.auth.message && (
              <p>{testResults.results.auth.message}</p>
            )}
            {testResults.results.auth.token && (
              <p>Token: {testResults.results.auth.token}</p>
            )}
            {testResults.results.auth.decoded && (
              <div className={styles.decoded}>
                <h4>Decoded Token</h4>
                <pre>{JSON.stringify(testResults.results.auth.decoded, null, 2)}</pre>
              </div>
            )}
          </div>
          
          <div className={styles.section}>
            <h3>Subscription</h3>
            <p>Status: {renderStatus(testResults.results.subscription.status)}</p>
            {testResults.results.subscription.message && (
              <p>{testResults.results.subscription.message}</p>
            )}
            {testResults.results.subscription.data && (
              <div className={styles.subscription}>
                <p>Status: {testResults.results.subscription.data.status}</p>
                <p>Plan: {testResults.results.subscription.data.plan}</p>
                <p>Has Stripe ID: {testResults.results.subscription.data.hasStripeId ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
