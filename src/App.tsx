import { useState } from 'react';
import { AuthProvider } from './components/AuthContext';
import { ChatBot } from './components/ChatBot';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { MoviesPage } from './components/pages/MoviesPage';
import { CinemasPage } from './components/pages/CinemasPage';
import { PromotionsPage } from './components/pages/PromotionsPage';
import { EventsPage } from './components/pages/EventsPage';
import { MyAccountPage } from './components/pages/MyAccountPage';
import { EditProfilePage } from './components/pages/EditProfilePage';
import { MyTicketsPage } from './components/pages/MyTicketsPage';
import { ViewHistoryPage } from './components/pages/ViewHistoryPage';
import { MovieDetailPage } from './components/pages/MovieDetailPage';
import { SeatSelectionPage } from './components/pages/SeatSelectionPage';
import { CheckoutPage } from './components/pages/CheckoutPage';
import { ShowtimesPage } from './components/pages/ShowtimesPage'; // Import ShowtimesPage

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'movies':
        return <MoviesPage onNavigate={handleNavigate} />;
      case 'cinemas':
        return <CinemasPage />;
      case 'promotions':
        return <PromotionsPage />;
      case 'events':
        return <EventsPage />;
      case 'my-account':
        return <MyAccountPage />;
      case 'edit-profile':
        return <EditProfilePage />;
      case 'my-tickets':
        return <MyTicketsPage />;
      case 'view-history':
        return <ViewHistoryPage />;
      case 'movie-detail':
        return <MovieDetailPage movieId={pageData?.movieId || 1} onNavigate={handleNavigate} />;
      case 'seat-selection':
        return <SeatSelectionPage bookingData={pageData} onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage bookingData={pageData} onNavigate={handleNavigate} />;
      case 'showtimes':
        return <ShowtimesPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <Footer />
        <ChatBot />
      </div>
    </AuthProvider>
  );
}