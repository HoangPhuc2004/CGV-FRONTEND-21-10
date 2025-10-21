import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Clock, Star, Calendar, Loader2, Film } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface Movie {
  movie_id: number;
  title: string;
  genre: string;
  rating: number;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
}

interface MoviesPageProps {
    onNavigate: (page: string, data?: any) => void;
}

export function MoviesPage({ onNavigate }: MoviesPageProps) {
  const [selectedTab, setSelectedTab] = useState('now-showing');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/movies?status=${selectedTab}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error(`Lỗi khi tải phim ${selectedTab}:`, error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedTab]);

  const handleMovieClick = (movieId: number) => {
    onNavigate('movie-detail', { movieId: movieId });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-b from-red-50 to-white">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1515100235140-6cb3498e8031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBhdWRpdG9yaXVtfGVufDF8fHx8MTc2MDIzODI1OXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Rạp chiếu phim"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl text-gray-900 mb-4">Tất Cả Phim</h1>
            <p className="text-xl text-gray-700">
              Khám phá bộ sưu tập phim đầy đủ đang chiếu và sắp ra mắt
            </p>
          </div>
        </div>
      </section>

      {/* Movies Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="bg-white border border-gray-200 mb-8">
              <TabsTrigger 
                value="now-showing" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Đang Chiếu
              </TabsTrigger>
              <TabsTrigger 
                value="coming-soon"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Sắp Chiếu
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                         <Card key={index} className="bg-white border-gray-200 overflow-hidden">
                            <Skeleton className="h-96 w-full" />
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
              ) : movies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movies.map((movie) => (
                  <Card key={movie.movie_id} onClick={() => handleMovieClick(movie.movie_id)} className="bg-white border-gray-200 overflow-hidden hover:border-red-600 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                    <div className="relative h-96 overflow-hidden">
                      <ImageWithFallback
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {selectedTab === 'now-showing' && movie.rating > 0 && (
                        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-gray-900 text-sm">{movie.rating}</span>
                        </div>
                      )}
                      {selectedTab === 'coming-soon' && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-600 text-white">Sắp Chiếu</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-gray-900 text-xl mb-2 truncate">{movie.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 truncate">{movie.genre}</p>
                      <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{movie.duration_minutes} phút</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(movie.release_date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); handleMovieClick(movie.movie_id); }} className="w-full bg-red-600 hover:bg-red-700 text-white">
                        {selectedTab === 'now-showing' ? 'Đặt Vé' : 'Thông Tin Thêm'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                    <Film className="w-16 h-16 mx-auto text-gray-300 mb-4"/>
                    <h3 className="text-xl text-gray-800">Chưa có phim nào</h3>
                    <p>Vui lòng quay lại sau để xem các phim mới nhất.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}