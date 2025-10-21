import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Film, Loader2, Star, MapPin } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from '@/components/ui/label';

// --- Định nghĩa kiểu dữ liệu ---
interface MovieWithShowtimes {
  movie_id: number;
  title: string;
  genre: string;
  duration_minutes: number;
  rating: number;
  age_rating: string;
  poster_url: string;
  features: string[];
  times: { showtime_id: number; start_time: string; ticket_price: string; }[];
}
interface Cinema { cinema_id: number; name: string; city: string; }
interface CityWithCount { city: string; count: string; }
interface ShowtimesPageProps { onNavigate: (page: string, data?: any) => void; }

const API_URL = 'http://localhost:5001/api';

// --- Component ---
export function ShowtimesPage({ onNavigate }: ShowtimesPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [cities, setCities] = useState<CityWithCount[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cinemasInCity, setCinemasInCity] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
  const [loading, setLoading] = useState({ cities: true, cinemas: true, showtimes: true });

  // 1. Lấy danh sách thành phố khi component được tải
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(prev => ({ ...prev, cities: true }));
      try {
        const res = await fetch(`${API_URL}/cinemas/cities`);
        const data: CityWithCount[] = await res.json();
        setCities(data);
        // Tự động chọn thành phố đầu tiên nếu có
        if (data.length > 0) {
            setSelectedCity(data[0].city);
        } else {
             setLoading(prev => ({...prev, cinemas: false, showtimes: false}));
        }
      } catch (e) { 
          console.error("Lỗi tải thành phố:", e); 
          setLoading(prev => ({...prev, cities: false, cinemas: false, showtimes: false}));
      }
    };
    fetchCities();
  }, []);

  // 2. Lấy danh sách rạp khi thành phố thay đổi
  useEffect(() => {
    if (!selectedCity) return;
    const fetchCinemas = async () => {
      setLoading(prev => ({...prev, cinemas: true, showtimes: true}));
      try {
        const res = await fetch(`${API_URL}/cinemas?city=${encodeURIComponent(selectedCity)}`);
        const data: Cinema[] = await res.json();
        setCinemasInCity(data);
        // Tự động chọn rạp đầu tiên
        if (data.length > 0) {
          setSelectedCinemaId(data[0].cinema_id);
        } else {
          setSelectedCinemaId(null);
        }
      } catch (e) { 
          console.error("Lỗi tải rạp:", e); 
          setCinemasInCity([]);
          setSelectedCinemaId(null);
      } finally { 
          setLoading(prev => ({...prev, cinemas: false}))
      }
    };
    fetchCinemas();
  }, [selectedCity]);

  // 3. Lấy lịch chiếu khi ngày hoặc rạp thay đổi
  useEffect(() => {
    if (!selectedDate || !selectedCinemaId) {
        setMovies([]);
        setLoading(prev => ({...prev, showtimes: false}));
        return;
    };
    const fetchShowtimes = async () => {
      setLoading(prev => ({...prev, showtimes: true}));
      const dateString = selectedDate.toISOString().split('T')[0];
      try {
        const res = await fetch(`${API_URL}/showtimes-by-cinema?cinemaId=${selectedCinemaId}&date=${dateString}`);
        const data = await res.json();
        setMovies(data);
      } catch (e) { 
        console.error("Lỗi tải lịch chiếu:", e); 
        setMovies([]); 
      }
      finally { setLoading(prev => ({...prev, showtimes: false }))}
    };
    fetchShowtimes();
  }, [selectedDate, selectedCinemaId]);


  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-red-50 to-white py-12 border-b">
        <div className="container mx-auto px-4"><h1 className="text-4xl text-gray-900 mb-2 flex items-center gap-3"><CalendarIcon className="w-8 h-8 text-red-600" />Lịch Chiếu Phim</h1><p className="text-gray-600">Xem lịch chiếu tất cả phim theo rạp và ngày</p></div>
      </section>

      <div className="py-6 bg-white border-b sticky top-[73px] z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            <div className="flex flex-col gap-2">
              <Label className="font-semibold text-gray-700">1. Chọn Ngày</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal py-5 text-base">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus fromDate={new Date()}/>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-semibold text-gray-700">2. Chọn Thành Phố</Label>
              <Select value={selectedCity || ''} onValueChange={(value) => setSelectedCity(value)}>
                <SelectTrigger className="w-full text-base py-5"><SelectValue placeholder="Chọn thành phố..." /></SelectTrigger>
                <SelectContent>{loading.cities ? <SelectItem value="loading" disabled>Đang tải...</SelectItem> : cities.map(c => <SelectItem key={c.city} value={c.city}>{c.city} ({c.count})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="font-semibold text-gray-700">3. Chọn Rạp</Label>
              <Select value={selectedCinemaId?.toString() || ''} onValueChange={(val) => setSelectedCinemaId(Number(val))}>
                <SelectTrigger className="w-full text-base py-5"><SelectValue placeholder="Chọn rạp..." /></SelectTrigger>
                <SelectContent>
                  {loading.cinemas ? <SelectItem value="loading" disabled>Đang tải rạp...</SelectItem> : 
                    cinemasInCity.length > 0 ? cinemasInCity.map((cinema) => (<SelectItem key={cinema.cinema_id} value={cinema.cinema_id.toString()}>{cinema.name}</SelectItem>)) : 
                    <SelectItem value="none" disabled>Không có rạp nào.</SelectItem>
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 space-y-6">
          {loading.showtimes ? (
            <div className="flex justify-center py-20"><Loader2 className="w-16 h-16 animate-spin text-red-600"/></div>
          ) : movies.length > 0 ? (
            movies.map(movie => (
              <Card key={movie.movie_id} className="bg-white border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow duration-300">
                <div className="md:w-48 flex-shrink-0">
                  <ImageWithFallback src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-xl text-gray-900 cursor-pointer hover:text-red-600" onClick={() => onNavigate('movie-detail', { movieId: movie.movie_id })}>{movie.title}</h3>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex-shrink-0">{movie.age_rating}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1.5"><Film className="w-4 h-4" />{movie.genre}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{movie.duration_minutes} phút</span>
                      <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500"/>{movie.rating}/10</span>
                  </div>
                  <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-800 mb-2">Định dạng:</p>
                      <div className="flex flex-wrap gap-2">
                          {movie.features?.map(f => <Badge key={f} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{f}</Badge>)}
                      </div>
                  </div>
                  <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Suất chiếu:</p>
                      <div className="flex flex-wrap gap-2">
                          {movie.times.map(time => (
                              <Button key={time.showtime_id} variant="outline" className="font-semibold hover:bg-red-50 hover:border-red-600 hover:text-red-700" onClick={() => onNavigate('seat-selection', { movie: { movie_id: movie.movie_id, title: movie.title }, showtime: { ...time, cinema_name: cinemasInCity.find(c=>c.cinema_id === selectedCinemaId)?.name }, format: movie.features?.[0] || '2D' })}>
                                  {new Date(time.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </Button>
                          ))}
                      </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
                <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl text-gray-800">Không có suất chiếu phù hợp</h3>
                <p>Vui lòng thử chọn ngày khác hoặc rạp chiếu khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}