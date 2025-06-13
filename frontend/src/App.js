import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyles } from './theme/GlobalStyles';
import MainLayout from './components/layout/MainLayout';
import TreesList from './pages/TreesList';
import TreeView from './pages/TreeView';
import AnomalyAnalysis from './pages/AnomalyAnalysis';
import Reports from './pages/Reports';
import TreeCheck from './pages/TreeCheck';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<TreesList />} />
            <Route path="tree/new" element={<TreeView />} />
            <Route path="tree/:treeId" element={<TreeView />} />
            <Route path="anomaly-analysis/:treeId" element={<AnomalyAnalysis />} />
            <Route path="reports/:treeId" element={<Reports />} />
            <Route path="check" element={<TreeCheck />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 