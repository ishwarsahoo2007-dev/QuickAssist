import React, { useState, useRef, useEffect } from 'react';
import { AppView, User, ServiceProvider } from './types';
import AuthPage from './components/AuthPage';
import HeroSection from './components/HeroSection';
import BackgroundAnimation from './components/BackgroundAnimation';
import { findNearbyProviders } from './services/geminiService';
import { LogOut, Car, HeartPulse, Sparkles, Home, Hammer, GraduationCap, Plane, ChevronRight, MapPin, User as UserIcon, LayoutDashboard, Camera, Menu, X, Loader2, Star, Phone, Navigation, ArrowLeft, Share2, ChevronDown, ChevronUp, Crosshair, Calendar, CheckCircle, Clock, Trash2, Activity, Search, Map as MapIcon, MessageSquare, Send, Bell, Zap, ShieldCheck, Info } from 'lucide-react';

// --- Data Definitions ---
const CATEGORIES = [
  {
    id: 'vehicle',
    title: 'Vehicle & Road Help',
    icon: <Car size={40} />, 
    color: 'bg-brand-primary',
    textColor: 'text-brand-primary',
    animation: 'animate-drive',
    items: ['Mechanic / Garage', 'Puncture Repair', 'Fuel Delivery', 'Tow Truck', 'Battery Jump-start', 'Car Washing', 'Spare Parts', 'Driving Schools']
  },
  {
    id: 'health',
    title: 'Emergency & Health',
    icon: <HeartPulse size={40} />,
    color: 'bg-brand-health',
    textColor: 'text-brand-health',
    animation: 'animate-heartbeat',
    items: ['Hospital / Clinic', 'Ambulance', 'Mental Health Helpline', 'Police / Fire']
  },
  {
    id: 'religious',
    title: 'Religious & Cultural',
    icon: <Sparkles size={40} />,
    color: 'bg-brand-spiritual',
    textColor: 'text-brand-spiritual',
    animation: 'animate-spin-slow',
    items: ['Brahmin / Pandit', 'Temple Locations', 'Priest Booking']
  },
  {
    id: 'home',
    title: 'Home & Daily Services',
    icon: <Home size={40} />,
    color: 'bg-brand-home',
    textColor: 'text-brand-home',
    animation: 'animate-bounce',
    items: ['Electrician', 'Plumber', 'Carpenter', 'AC / Fridge Repair', 'House Cleaning', 'Water Purifier', 'Interior Design']
  },
  {
    id: 'worker',
    title: 'Worker & Labour',
    icon: <Hammer size={40} />,
    color: 'bg-brand-worker',
    textColor: 'text-brand-worker',
    animation: 'animate-swing',
    items: ['Daily Labour', 'Painter', 'Welder', 'Construction Worker', 'Movers & Packers', 'Gardening', 'Security Guard']
  },
  {
    id: 'education',
    title: 'Education & Study',
    icon: <GraduationCap size={40} />,
    color: 'bg-brand-edu',
    textColor: 'text-brand-edu',
    animation: 'animate-float',
    items: ['Coaching Centers', 'Computer Classes', 'Bookshops']
  },
  {
    id: 'travel',
    title: 'Travel & Stay',
    icon: <Plane size={40} />,
    color: 'bg-brand-travel',
    textColor: 'text-brand-travel',
    animation: 'animate-fly',
    items: ['Hotels / Lodges', 'Tourist Guides']
  }
];

type DashboardView = 'HOME' | 'PROFILE' | 'SEARCH_RESULTS' | 'HISTORY';

// Default Location: Bhubaneswar, Odisha (Used ONLY as fallback)
const DEFAULT_LAT = 20.2961;
const DEFAULT_LNG = 85.8245;

interface ServiceHistoryItem {
  id: string;
  name: string;
  category: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Booked' | 'Tracking' | 'Job Accepted';
  userRating?: number;
  userReview?: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardView, setDashboardView] = useState<DashboardView>('HOME');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Geolocation Watcher Ref
  const watchIdRef = useRef<number | null>(null);

  // Search & Location State
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ServiceProvider[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  
  // UI State
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState<ServiceProvider | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingType, setBookingType] = useState('Marriage');
  
  // Donation Modal State
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationStep, setDonationStep] = useState<'FORM' | 'SEARCHING' | 'RESULT'>('FORM');
  const [donationType, setDonationType] = useState('Blood');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Tracking Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingProvider, setTrackingProvider] = useState<ServiceProvider | null>(null);
  const [trackingProgress, setTrackingProgress] = useState(0);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ServiceHistoryItem | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempReview, setTempReview] = useState('');

  // Partner Notification State
  const [incomingJob, setIncomingJob] = useState<{customer: string, service: string, distance: string} | null>(null);

  // History State
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Simulate Incoming Job for Partner
  useEffect(() => {
    if (user?.role === 'provider' && currentView === AppView.DASHBOARD) {
        // Wait 8 seconds then trigger a fake job matching their profession
        const timer = setTimeout(() => {
            setIncomingJob({
                customer: 'Amit Patel',
                service: user.profession || 'General Help',
                distance: '2.5 km'
            });
            // Play sound (simulated)
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
        }, 8000);
        return () => clearTimeout(timer);
    }
  }, [user, currentView]);

  // Tracking Animation Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTrackingModalOpen) {
      setTrackingProgress(0);
      interval = setInterval(() => {
        setTrackingProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 0.3; // Slower animation for realism
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isTrackingModalOpen]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(AppView.LANDING);
    setDashboardView('HOME');
    setSearchResults([]);
    setActiveService(null);
    setUserLocation(null);
    if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
    }
    setIncomingJob(null);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, avatar: imageUrl });
    }
  };

  const addToHistory = (providerName: string, category: string, status: 'Completed' | 'Pending' | 'Booked' | 'Tracking' | 'Job Accepted') => {
    setServiceHistory(prev => [{
        id: Date.now().toString(),
        name: providerName,
        category: category,
        date: new Date().toLocaleDateString(),
        status: status
    }, ...prev]);
  };

  const deleteHistoryItem = (id: string) => {
    setServiceHistory(prev => prev.filter(item => item.id !== id));
  };

  const acceptJob = () => {
      if(incomingJob) {
          addToHistory(incomingJob.customer, incomingJob.service, 'Job Accepted');
          alert(`You accepted the job for ${incomingJob.customer}! Navigating to customer location...`);
          setIncomingJob(null);
          // In real app, open map to customer
      }
  };

  // --- Review Logic ---

  const handleOpenReview = (item: ServiceHistoryItem) => {
      setReviewTarget(item);
      setTempRating(0);
      setTempReview('');
      setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
      if (reviewTarget && tempRating > 0) {
          setServiceHistory(prev => prev.map(item => {
              if (item.id === reviewTarget.id) {
                  return { ...item, userRating: tempRating, userReview: tempReview };
              }
              return item;
          }));
          setIsReviewModalOpen(false);
          alert(`Review submitted for ${reviewTarget.name}! Thank you for helping the community.`);
      }
  };

  // --- Geolocation & Search Logic ---

  const detectLocation = () => {
    setLocationStatus('Locating...');
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setLocationStatus('');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus('Live Tracking On');
      },
      (error) => {
        console.error("Geo Error", error);
        // Only fallback if we strictly have NO location
        if (!userLocation) {
            alert('GPS Signal failed. Using Odisha Default for demo.');
            setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG }); 
        }
        setLocationStatus('Signal Lost');
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000 
      }
    );
    
    watchIdRef.current = id;
  };

  const performSearch = async (serviceName: string, lat: number, lng: number) => {
    setLocationStatus(`Searching nearby...`);
    try {
        const results = await findNearbyProviders(serviceName, lat, lng);
        setSearchResults(results);
    } catch (e) {
        console.error(e);
        setLocationStatus('Failed to fetch data.');
    } finally {
        setIsSearching(false);
        if (watchIdRef.current !== null) {
            setLocationStatus('Live Tracking On');
        } else {
            setLocationStatus('');
        }
    }
  };

  const handleServiceClick = async (serviceName: string) => {
    setActiveService(serviceName);
    setDashboardView('SEARCH_RESULTS');
    setIsSearching(true);
    setSearchResults([]);
    
    const lat = userLocation ? userLocation.lat : DEFAULT_LAT;
    const lng = userLocation ? userLocation.lng : DEFAULT_LNG;
    
    if (!userLocation) {
        setUserLocation({ lat, lng });
    }

    performSearch(serviceName, lat, lng);
  };

  const handleBackToDashboard = () => {
    setDashboardView('HOME');
    setActiveService(null);
    setSearchResults([]);
  };

  const toggleCategory = (id: string) => {
    if (expandedCategory === id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(id);
    }
  };

  // --- Action Handlers ---

  const handleCall = (name: string) => {
      // Just record history, call is handled by anchor tag now
      addToHistory(name, activeService || 'Service', 'Completed');
  };

  const handleNavigateClick = (provider: ServiceProvider) => {
      setTrackingProvider(provider);
      setIsTrackingModalOpen(true);
      addToHistory(provider.name, activeService || 'Service', 'Tracking');
  };

  const openGoogleMaps = () => {
      if(trackingProvider) {
         const query = encodeURIComponent(trackingProvider.address);
         window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      }
  };

  const openBookingModal = (provider: ServiceProvider) => {
      setSelectedPriest(provider);
      setIsBookingModalOpen(true);
  };

  const confirmBooking = () => {
      if (selectedPriest) {
          addToHistory(selectedPriest.name, `Priest Booking - ${bookingType}`, 'Booked');
          alert(`Booking Confirmed for ${bookingType} with ${selectedPriest.name} on ${bookingDate}. Check History tab.`);
          setIsBookingModalOpen(false);
      }
  };

  const openDonationModal = () => {
      setDonationStep('FORM');
      setIsDonationModalOpen(true);
  };

  const handleDonationSearch = () => {
      setDonationStep('SEARCHING');
      setTimeout(() => {
          setDonationStep('RESULT');
      }, 3000); 
  };

  // --- Views ---

  const renderSearchResults = () => (
    <div className="w-full max-w-5xl mx-auto pb-20">
      <button 
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Categories
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
         <div>
            <h2 className="text-3xl font-bold text-white mb-2">{activeService}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
               {isSearching ? (
                 <span className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                    <Loader2 size={16} className="animate-spin" /> {locationStatus}
                 </span>
               ) : (
                 <>
                   <span className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      <MapPin size={16} className={`${locationStatus === 'Live Tracking On' ? 'animate-pulse' : ''}`} /> 
                      {/* Accurate Location Text Logic */}
                      {userLocation && userLocation.lat !== DEFAULT_LAT ? (
                          <span>
                              GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                          </span>
                      ) : (
                          <span>Bhubaneswar (Odisha)</span>
                      )}
                      
                      {locationStatus === 'Live Tracking On' && <span className="ml-2 text-[10px] uppercase font-bold text-green-500 animate-pulse">(Live)</span>}
                   </span>
                 </>
               )}
            </div>
         </div>
      </div>

      <div className="grid gap-4">
        {/* Loading Skeleton */}
        {isSearching && (
           [1, 2, 3].map((i) => (
             <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-pulse h-40"></div>
           ))
        )}

        {/* Results */}
        {!isSearching && searchResults.map((provider, idx) => (
           <div key={idx} className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-brand-secondary/50 transition-all group flex flex-col md:flex-row gap-6 animate-grid-flow" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex-1">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-secondary transition-colors">{provider.name}</h3>
                    <span className="bg-slate-900 text-xs font-mono px-2 py-1 rounded text-slate-400 border border-slate-700">
                        {activeService?.includes('Temple') ? 'Famous Site' : 'Nearby'}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-yellow-500 text-sm">
                       <Star size={14} fill="currentColor" />
                       <span className="ml-1 font-bold">{provider.rating}</span>
                       <span className="text-slate-500 ml-1">({provider.reviewCount} reviews)</span>
                    </div>
                    {provider.mobile !== 'N/A' && (
                        <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300 text-sm font-mono">{provider.mobile}</span>
                        </>
                    )}
                 </div>

                 <p className="text-slate-400 text-sm mb-3 flex items-start gap-2">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-slate-500" />
                    {provider.address}
                 </p>

                 {/* Description Field for History/Facts */}
                 {provider.description && (
                    <div className="mb-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                        <p className="text-slate-300 text-xs leading-relaxed flex gap-2">
                            <Info size={14} className="shrink-0 text-brand-secondary mt-0.5" />
                            {provider.description}
                        </p>
                    </div>
                 )}
              </div>

              <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                 {/* No call button for temples */}
                 {!activeService?.includes('Temple') && (
                     activeService === 'Priest Booking' ? (
                         <button 
                            onClick={() => openBookingModal(provider)}
                            className="flex-1 md:flex-none px-6 py-3 bg-brand-spiritual hover:bg-orange-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                         >
                            <Calendar size={18} /> Book Priest
                         </button>
                     ) : (
                         <a 
                            href={`tel:${provider.mobile}`}
                            onClick={() => handleCall(provider.name)}
                            className="flex-1 md:flex-none px-6 py-3 bg-brand-secondary hover:bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                         >
                            <Phone size={18} /> Call Now
                         </a>
                     )
                 )}
                 
                 <button 
                    onClick={() => handleNavigateClick(provider)}
                    className="flex-1 md:flex-none px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                 >
                    <Navigation size={18} /> Navigate
                 </button>
              </div>
           </div>
        ))}
      </div>

      {/* Priest Booking Modal */}
      {isBookingModalOpen && selectedPriest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                  <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <X size={24} />
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-2">Book {selectedPriest.name}</h3>
                  <p className="text-slate-400 mb-6 text-sm">Fill details to schedule your pooja/ceremony.</p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-slate-400 text-sm mb-1">Occasion Type</label>
                          <select 
                            value={bookingType}
                            onChange={(e) => setBookingType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                          >
                              <option>Marriage Ceremony</option>
                              <option>Griha Pravesh</option>
                              <option>Satyanarayan Pooja</option>
                              <option>Funeral Rites</option>
                              <option>Thread Ceremony</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-slate-400 text-sm mb-1">Date</label>
                          <input 
                            type="date" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                          <p className="text-sm text-slate-300"><span className="font-bold text-white">Location:</span> {selectedPriest.address}</p>
                          <p className="text-sm text-slate-300 mt-1"><span className="font-bold text-white">Mobile:</span> {selectedPriest.mobile}</p>
                      </div>
                  </div>

                  <button 
                    onClick={confirmBooking}
                    className="w-full mt-6 py-4 bg-brand-spiritual hover:bg-orange-700 text-white font-bold rounded-xl transition-all"
                  >
                      Confirm Booking
                  </button>
              </div>
          </div>
      )}

      {/* Live Tracking Modal */}
      {isTrackingModalOpen && trackingProvider && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Map Simulation Header */}
                  <div className="h-48 bg-slate-800 relative w-full flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/0,0,2,0,0/400x400')] bg-cover"></div>
                      <button onClick={() => setIsTrackingModalOpen(false)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 z-10">
                         <X size={20} />
                      </button>
                      
                      {/* Animation */}
                      <div className="relative w-full px-12 flex items-center justify-between">
                          <div className="flex flex-col items-center z-10">
                              <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center shadow-lg">
                                  <UserIcon size={20} className="text-white" />
                              </div>
                              <span className="text-xs font-bold mt-2 text-slate-300">YOU</span>
                          </div>

                          {/* Path Line */}
                          <div className="flex-1 h-1 bg-slate-700 mx-4 relative">
                              <div className="absolute top-0 left-0 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-300 ease-linear" style={{ width: `${trackingProgress}%` }}></div>
                              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-300 ease-linear" style={{ left: `${trackingProgress}%` }}></div>
                          </div>

                          <div className="flex flex-col items-center z-10">
                              <div className="w-12 h-12 rounded-full bg-brand-secondary border-2 border-blue-400 flex items-center justify-center shadow-lg animate-bounce">
                                  <MapIcon size={20} className="text-white" />
                              </div>
                              <span className="text-xs font-bold mt-2 text-brand-secondary">DESTINATION</span>
                          </div>
                      </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-6 bg-slate-900">
                      <h3 className="text-xl font-bold text-white mb-1">Navigating to {trackingProvider.name}</h3>
                      <p className="text-green-400 text-sm font-medium flex items-center gap-2 mb-6">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Live GPS Active • 12 mins away
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-800 p-4 rounded-xl text-center">
                              <span className="block text-2xl font-bold text-white">2.4</span>
                              <span className="text-xs text-slate-400 uppercase tracking-wider">Kilometers</span>
                          </div>
                          <div className="bg-slate-800 p-4 rounded-xl text-center">
                              <span className="block text-2xl font-bold text-white">12:45</span>
                              <span className="text-xs text-slate-400 uppercase tracking-wider">ETA</span>
                          </div>
                      </div>

                      <div className="flex flex-col gap-3">
                          <button 
                              onClick={openGoogleMaps}
                              className="w-full py-4 bg-brand-secondary hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                          >
                              <Navigation size={20} /> Open Google Maps
                          </button>
                          <a 
                              href={`tel:${trackingProvider.mobile}`}
                              onClick={() => handleCall(trackingProvider.name)}
                              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
                          >
                              <Phone size={20} /> Call Provider
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  const renderTravelerGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {CATEGORIES.map((cat) => {
        const isExpanded = expandedCategory === cat.id;
        // Show all items if expanded, otherwise show top 4
        const itemsToShow = isExpanded ? cat.items : cat.items.slice(0, 4);

        return (
          <div key={cat.id} className={`bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-500 transition-all group flex flex-col ${isExpanded ? 'row-span-2' : ''}`}>
            <div className="p-6 flex-1 flex flex-col">
              {/* ANIMATED LOGO CONTAINER */}
              <div className={`w-20 h-20 rounded-2xl ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg transform transition-all hover:scale-105 border-4 border-slate-800/50`}>
                 <div className={cat.animation}>
                   {cat.icon}
                 </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
              
              <div className="space-y-2 mt-4 flex-1">
                {itemsToShow.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleServiceClick(item)}
                    className="w-full text-left flex items-center justify-between text-sm text-slate-400 hover:text-white transition-all cursor-pointer py-1.5 hover:bg-slate-800/50 rounded px-2 -ml-2 group/item"
                  >
                    <div className="flex items-center">
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${cat.color}`}></div>
                      {item}
                    </div>
                    <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300" />
                  </button>
                ))}
              </div>
              
              {/* Expand / Collapse Button */}
              {cat.items.length > 4 && (
                <button 
                  className={`text-xs font-bold mt-4 ${cat.textColor} cursor-pointer hover:underline flex items-center gap-1 transition-colors pt-2 border-t border-slate-700/50 w-full`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {isExpanded ? (
                    <>Show Less <ChevronUp size={14} /></>
                  ) : (
                    <>View all {cat.items.length} services <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Smart Donation Feature Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[250px]">
         <div className="absolute inset-0 bg-brand-health/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <div className="w-20 h-20 rounded-full bg-brand-health/20 flex items-center justify-center mb-6 animate-pulse">
            <Activity size={40} className="text-brand-health" />
         </div>
         <h3 className="text-lg font-bold text-white">Blood & Organ Match</h3>
         <p className="text-sm text-slate-400 mt-2 mb-4">Urgent Requirement? Find donors instantly.</p>
         <button 
            onClick={openDonationModal}
            className="px-6 py-3 bg-brand-health text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 w-full"
         >
             Request Now
         </button>
      </div>

      {/* Donation Modal */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
             <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                <button onClick={() => setIsDonationModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                
                {donationStep === 'FORM' && (
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="text-brand-health" size={28} />
                            <h2 className="text-2xl font-bold text-white">Life Saver Connect</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Type</label>
                                <div className="flex bg-slate-800 rounded-lg p-1">
                                    <button onClick={() => setDonationType('Blood')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${donationType === 'Blood' ? 'bg-brand-health text-white' : 'text-slate-400'}`}>Blood</button>
                                    <button onClick={() => setDonationType('Organ')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${donationType === 'Organ' ? 'bg-brand-health text-white' : 'text-slate-400'}`}>Organ</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Blood Group / Organ Type</label>
                                <select 
                                    value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <button onClick={handleDonationSearch} className="w-full py-4 mt-4 bg-brand-health hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2">
                                <Search size={20} /> Find Donors Nearby
                            </button>
                        </div>
                    </div>
                )}

                {donationStep === 'SEARCHING' && (
                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 mb-8">
                             <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-brand-health rounded-full border-t-transparent animate-spin"></div>
                             <HeartPulse className="absolute inset-0 m-auto text-brand-health animate-pulse" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Scanning Network...</h3>
                        <p className="text-slate-400">Searching hospitals & donors in 5km radius</p>
                    </div>
                )}

                {donationStep === 'RESULT' && (
                    <div className="p-8">
                         <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-6 text-green-500">
                             <CheckCircle size={32} />
                         </div>
                         <h2 className="text-2xl font-bold text-white text-center mb-6">Match Found!</h2>
                         
                         <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <h4 className="font-bold text-white">City Blood Bank</h4>
                                     <p className="text-xs text-slate-400">2.1 km away • Open 24/7</p>
                                 </div>
                                 <span className="bg-brand-health text-white text-xs font-bold px-2 py-1 rounded">Verified</span>
                             </div>
                             <div className="flex items-center gap-2 mt-2">
                                 <span className="text-2xl font-bold text-white">{bloodGroup}</span>
                                 <span className="text-sm text-green-400">3 Units Available</span>
                             </div>
                         </div>

                         <div className="flex gap-3">
                             <a href="tel:102" className="flex-1 py-3 bg-brand-secondary text-white font-bold rounded-lg flex items-center justify-center">Call Now</a>
                             <button className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-lg" onClick={() => setIsDonationModalOpen(false)}>Close</button>
                         </div>
                    </div>
                )}
             </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto w-full p-4 pb-20">
      <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 w-full shadow-2xl">
        <div className="flex flex-col items-center">
          
          <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-slate-700 overflow-hidden ${user?.role === 'provider' ? 'bg-gradient-to-br from-brand-secondary to-brand-worker' : 'bg-gradient-to-br from-brand-secondary to-brand-primary'}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-5xl text-white">{user?.fullName.charAt(0)}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfileImageChange} />
          </div>

          <h2 className="text-3xl font-bold text-white">{user?.fullName}</h2>
          <p className="text-brand-primary font-mono mt-1 text-lg">{user?.mobile}</p>
          
          <div className="flex gap-3 mt-4">
             <div className="px-4 py-2 bg-slate-900 rounded-full text-xs text-slate-400 border border-slate-700 uppercase tracking-wide">
                {user?.role === 'provider' ? 'Service Partner' : 'Traveler'}
             </div>
             {user?.profession && (
                <div className="px-4 py-2 bg-brand-secondary/20 rounded-full text-xs text-brand-secondary border border-brand-secondary/30 uppercase tracking-wide font-bold">
                   {user.profession}
                </div>
             )}
          </div>

          <div className="mt-10 w-full max-w-lg bg-slate-900/50 rounded-xl p-6 border border-slate-800">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Account Status</h3>
                <span className="text-green-500 text-sm font-bold flex items-center gap-1"><CheckCircle size={14}/> Active</span>
             </div>
             <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-sm font-medium">Member Since</h3>
                <span className="text-white text-sm font-mono">Oct 2023</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="w-full max-w-4xl mx-auto p-4 pb-20">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Clock size={32} className="text-brand-secondary" /> Service History
        </h2>

        {serviceHistory.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700/50">
                <Clock size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
                <p className="text-slate-400">Your completed services and bookings will appear here.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {serviceHistory.map((item) => (
                    <div key={item.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                     item.status === 'Booked' ? 'bg-orange-500/20 text-orange-400' :
                                     item.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                                     item.status === 'Job Accepted' ? 'bg-purple-500/20 text-purple-400' :
                                     'bg-blue-500/20 text-blue-400'
                                 }`}>
                                     {item.status}
                                 </span>
                            </div>
                            <p className="text-sm text-slate-400">{item.category} • {item.date}</p>
                            {item.userRating && (
                                <div className="flex items-center gap-1 mt-2 text-yellow-500 text-sm">
                                    {[...Array(item.userRating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                    <span className="text-slate-500 ml-2">"{item.userReview}"</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {item.status === 'Completed' && !item.userRating && (
                                <button 
                                    onClick={() => handleOpenReview(item)}
                                    className="px-4 py-2 bg-brand-primary text-black font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors flex-1 md:flex-none"
                                >
                                    Rate Service
                                </button>
                            )}
                            <button 
                                onClick={() => deleteHistoryItem(item.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && reviewTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Rate {reviewTarget.name}</h3>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setTempRating(star)} className={`transition-transform hover:scale-110 ${tempRating >= star ? 'text-yellow-500' : 'text-slate-600'}`}>
                                <Star size={32} fill={tempRating >= star ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                    <textarea 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm mb-4 focus:ring-2 focus:ring-brand-primary/50 outline-none"
                        placeholder="Write a short review..."
                        rows={3}
                        value={tempReview}
                        onChange={(e) => setTempReview(e.target.value)}
                    ></textarea>
                    <div className="flex gap-3">
                        <button onClick={handleSubmitReview} className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200">Submit</button>
                        <button onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">Cancel</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderDashboardLayout = () => {
    return (
      <div className="flex h-screen overflow-hidden bg-brand-black/95">
        
        {/* Mobile Sidebar Toggle */}
        <button 
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed md:relative z-40 h-full w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-8">
             <div className="flex items-center gap-2 mb-8">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-secondary to-brand-primary flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                   <Zap size={24} fill="white" />
               </div>
               <div className="flex flex-col">
                  <span className="font-tech text-lg font-bold text-white tracking-wider leading-none">QUICK</span>
                  <span className="font-tech text-sm font-medium text-brand-primary tracking-widest leading-none">ASSIST</span>
               </div>
             </div>

             <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-800">
                <div className={`w-20 h-20 rounded-full mb-3 flex items-center justify-center overflow-hidden border-2 border-slate-700 ${user?.role === 'provider' ? 'bg-gradient-to-br from-brand-secondary to-brand-worker' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-3xl text-white">{user?.fullName.charAt(0)}</span>
                    )}
                </div>
                <h3 className="text-white font-semibold text-lg truncate w-full text-center">{user?.fullName}</h3>
                <p className="text-slate-500 text-sm">{user?.mobile}</p>
             </div>

             <nav className="space-y-2">
               <button 
                onClick={() => { setDashboardView('HOME'); setActiveService(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'HOME' && !activeService ? 'bg-brand-secondary text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
               >
                 <LayoutDashboard size={20} />
                 <span className="font-medium">Dashboard</span>
               </button>

               <button 
                onClick={() => { setDashboardView('HISTORY'); setActiveService(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'HISTORY' ? 'bg-brand-secondary text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
               >
                 <Clock size={20} />
                 <span className="font-medium">History & Reviews</span>
               </button>

               <button 
                onClick={() => { setDashboardView('PROFILE'); setActiveService(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${dashboardView === 'PROFILE' ? 'bg-brand-secondary text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
               >
                 <UserIcon size={20} />
                 <span className="font-medium">My Profile</span>
               </button>
             </nav>
          </div>

          <div className="mt-auto p-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative h-full">
           {/* Background Overlay to darken bg when mobile menu open */}
           {isSidebarOpen && (
             <div className="fixed inset-0 bg-black/80 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
           )}

           {/* Incoming Job Notification Overlay (For Providers) */}
           {incomingJob && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-grid-flow duration-500">
                   <div className="bg-slate-900 border border-brand-primary rounded-2xl shadow-2xl p-4 flex items-center gap-4 relative overflow-hidden">
                       <div className="absolute top-0 left-0 h-1 bg-brand-primary w-full animate-[width_10s_linear_forwards]"></div>
                       <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 animate-bounce">
                           <Bell size={24} fill="currentColor" />
                       </div>
                       <div className="flex-1">
                           <h4 className="font-bold text-white">New Job Request!</h4>
                           <p className="text-sm text-slate-300">{incomingJob.service} needed by {incomingJob.customer}</p>
                           <p className="text-xs text-brand-primary font-bold mt-1">{incomingJob.distance} away</p>
                       </div>
                       <div className="flex flex-col gap-2">
                           <button onClick={acceptJob} className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">ACCEPT</button>
                           <button onClick={() => setIncomingJob(null)} className="bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">DECLINE</button>
                       </div>
                   </div>
               </div>
           )}

           <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
              {dashboardView === 'HOME' && !activeService && (
                <>
                  <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 mt-10 md:mt-0 gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Hello, {user?.fullName.split(' ')[0]} 👋
                      </h1>
                      <p className="text-slate-400 mt-1">
                        {user?.role === 'provider' ? 'Ready to help others today?' : 'Find the help you need, instantly.'}
                      </p>
                    </div>
                    {user?.role === 'traveler' && (
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={detectLocation}
                             className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${userLocation ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-brand-primary hover:bg-slate-700'}`}
                          >
                             {userLocation && userLocation.lat !== DEFAULT_LAT ? (
                               <>
                                 <MapPin size={16} className="text-green-500" />
                                 {locationStatus === 'Live Tracking On' ? 'GPS Active' : 'Location Set'}
                               </>
                             ) : (
                               <>
                                 <Crosshair size={16} />
                                 {locationStatus === 'Locating...' ? 'Detecting...' : 'Detect My Location'}
                               </>
                             )}
                          </button>
                       </div>
                    )}
                  </header>

                  {user?.role === 'traveler' ? renderTravelerGrid() : (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/5 to-transparent animate-grid-flow" style={{ animationDuration: '3s' }}></div>
                        
                        <div className="w-24 h-24 bg-brand-worker/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-worker border border-brand-worker/20">
                          <Hammer size={32} />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Partner Dashboard</h3>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                          You are currently <b>Online</b> as a {user.profession}. 
                          <br />Waiting for job requests in your area...
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-full text-sm font-mono text-slate-300 border border-slate-700 shadow-inner">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Status: Active & Listening
                        </div>
                    </div>
                  )}
                </>
              )}

              {dashboardView === 'SEARCH_RESULTS' && renderSearchResults()}

              {dashboardView === 'PROFILE' && renderProfile()}

              {dashboardView === 'HISTORY' && renderHistory()}
           </div>
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-primary selection:text-black font-sans">
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {currentView === AppView.LANDING && (
          <HeroSection onGetStarted={() => setCurrentView(AppView.AUTH)} />
        )}

        {currentView === AppView.AUTH && (
          <AuthPage onLogin={handleLogin} />
        )}

        {currentView === AppView.DASHBOARD && renderDashboardLayout()}
      </div>
    </div>
  );
};

export default App;