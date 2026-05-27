import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileContainer } from './components/MobileContainer';
import { BottomNav } from './components/BottomNav';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Repertoire } from './screens/Repertoire';
import { PerformanceDetails } from './screens/PerformanceDetails';
import { Artists } from './screens/Artists';
import { ArtistProfile } from './screens/ArtistProfile';
import { Favorites } from './screens/Favorites';
import { Glossary } from './screens/Glossary';
import { Ballet } from './screens/Ballet';
import { Interactive } from './screens/Interactive';
import { Profile } from './screens/Profile';
import { AdminPanel } from './screens/AdminPanel';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MobileContainer>
      {children}
      <BottomNav />
    </MobileContainer>
  );
}

function SimpleLayout({ children }: { children: React.ReactNode }) {
  return <MobileContainer>{children}</MobileContainer>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={
          <SimpleLayout>
            <Onboarding />
          </SimpleLayout>
        } />
        <Route path="/home" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/repertoire" element={
          <Layout>
            <Repertoire />
          </Layout>
        } />
        <Route path="/performance/:id" element={
          <SimpleLayout>
            <PerformanceDetails />
          </SimpleLayout>
        } />
        <Route path="/artists" element={
          <Layout>
            <Artists />
          </Layout>
        } />
        <Route path="/artist/:id" element={
          <SimpleLayout>
            <ArtistProfile />
          </SimpleLayout>
        } />
        <Route path="/favorites" element={
          <SimpleLayout>
            <Favorites />
          </SimpleLayout>
        } />
        <Route path="/glossary" element={
          <SimpleLayout>
            <Glossary />
          </SimpleLayout>
        } />
        <Route path="/ballet" element={
          <SimpleLayout>
            <Ballet />
          </SimpleLayout>
        } />
        <Route path="/interactive" element={
          <SimpleLayout>
            <Interactive />
          </SimpleLayout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
        <Route path="/admin" element={
          <SimpleLayout>
            <AdminPanel />
          </SimpleLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;