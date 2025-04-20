import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import './Layout.css';
import Footer from './Footer';
function Layout() {
  const location = useLocation();
  const showHeader = location.pathname !== '/dashboard';

  return (
    <div className="layout-container">
      {showHeader && (
        <header className="layout-header">
          <Header />
        </header>
      )}
      <div className="content-wrapper">
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;