import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  
  h1 {
    font-size: 1.5rem;
    margin: 0;
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  position: fixed;
  bottom: 0;
  width: 100%;
`;

const MainLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
      <Header>
        <Logo to="/">
          <h1>Genotek</h1>
        </Logo>
        <Nav>
          <ul>
            <li>
              <NavLink to="/" className={isActive('/') ? 'active' : ''}>
                Trees List
              </NavLink>
            </li>
            <li>
              <NavLink to="/tree/new" className={isActive('/tree/new') ? 'active' : ''}>
                Upload Tree
              </NavLink>
            </li>
          </ul>
        </Nav>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>
        <p>&copy; 2024 Genotek. All rights reserved.</p>
      </Footer>
    </div>
  );
};

export default MainLayout; 