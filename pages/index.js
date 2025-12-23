import { useState, useEffect } from 'react';
import { Search, Menu, Download, MapPin, Maximize2, AlertCircle, Loader } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState('vn');
  const [currency, setCurrency] = useState('VND');
  const [mode, setMode] = useState('buy');
  const [showSearch, setShowSearch] = useState(true);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [mapPopup, setMapPopup] = useState(null);
  const [searchParams, setSearchParams] = useState({
    city: '',
    district: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    livingAreaMin: '',
    livingAreaMax: '',
    bedrooms: '',
    bathrooms: '',
    hasParking: false,
    hasPool: false,
    streetWidthMin: '',
    daysListed: '',
    legalStatus: '',
    customKeyword: '',
    sources: ['chotot'],
    keywords: [],
    numSites: 5
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('traxhome_searches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    }
  }, []);

  const t = {
    vn: {
      menu: 'Menu',
      searchParams: 'Tham số Tìm kiếm',
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      city: 'Thành phố',
      district: 'Quận/Huyện',
      propertyType: 'Loại BDS',
      priceMin: 'Giá tối thiểu',
      priceMax: 'Giá tối đa',
      livingArea: 'Diện tích (m²)',
      bedrooms: 'Phòng ngủ',
      daysListed: 'Đăng trong (ngày)',
      legalStatus: 'Pháp lý',
legalAll: 'Tất cả',
legalSoHong: 'Sổ Hồng',
legalSoDo: 'Sổ Đỏ',
legalNone: 'Chưa có sổ',
      customKeyword: 'Thêm từ khóa',
customKeywordPlaceholder: 'Nhập từ khóa khác...',
      sources: 'Nguồn dữ liệu',
sourcesDesc: 'Chọn các trang web để tìm kiếm',
premiumSource: 'Premium',
comingSoon: 'Sắp có',
      keywords: 'Từ khóa Khẩn cấp (QUAN TRỌNG)',
      keywordsDesc: 'Những từ này cho thấy người bán gấp = cơ hội đàm phán tốt nhất!',
      search: 'Tìm kiếm',
      results: 'Kết quả',
      score: 'Điểm phù hợp',
      pricePerSqm: 'Giá/m²',
      newListing: 'MỚI',
      urgentSale: 'BÁN GẤP',
      viewDetails: 'Xem chi tiết',
      export: 'Xuất Excel',
      lowestPrice: 'Giá thấp nhất',
      highestPrice: 'Giá cao nhất',
      loading: 'Đang tìm kiếm...',
      min: 'Tối thiểu',
      max: 'Tối đa',
      required: 'Trường bắt buộc: Thành phố - Loại BDS - Giá tối đa',
      selectCity: 'Chọn thành phố',
      selectDistrict: 'Chọn quận/huyện',
      selectType: 'Chọn loại BDS',
      allDistricts: 'Tất cả quận/huyện',
      buy: 'Mua',
      sell: 'Bán',
      sortBy: 'Sắp xếp theo',
      sortScore: 'Điểm phù hợp',
      sortPriceAsc: 'Giá tăng dần',
      sortPriceDesc: 'Giá giảm dần',
      sortDateDesc: 'Mới nhất',
      close: 'Đóng',
      contactAgent: 'Liên hệ môi giới',
      propertyDetails: 'Chi tiết BDS',
      postedOn: 'Ngày đăng',
      area: 'Diện tích',
      rooms: 'Phòng ngủ',
      bathrooms: 'Phòng tắm',
      viewOriginal: 'Xem bài gốc',
      saveSearch: 'Lưu tìm kiếm',
      savedSearches: 'Tìm kiếm đã lưu',
      noSavedSearches: 'Chưa có tìm kiếm nào được lưu',
      loadSearch: 'Tải',
      deleteSearch: 'Xóa',
      searchSaved: 'Đã lưu tìm kiếm!',
    },
    en: {
      menu: 'Menu',
      searchParams: 'Search Parameters',
      login: 'Login',
      signup: 'Sign Up',
      city: 'City',
      district: 'District',
      propertyType: 'Property Type',
      priceMin: 'Min Price',
      priceMax: 'Max Price',
      livingArea: 'Living Area (m²)',
      bedrooms: 'Bedrooms',
      daysListed: 'Listed within (days)',
      legalStatus: 'Legal Status',
legalAll: 'All',
legalSoHong: 'Pink Book',
legalSoDo: 'Red Book',
legalNone: 'No documents',
      customKeyword: 'Add keyword',
customKeywordPlaceholder: 'Enter custom keyword...',
      sources: 'Data Sources',
sourcesDesc: 'Select websites to search',
premiumSource: 'Premium',
comingSoon: 'Coming Soon',
      keywords: 'Urgent Keywords (IMPORTANT)',
      keywordsDesc: 'These words indicate desperate sellers = best negotiation opportunity!',
      search: 'Search',
      results: 'Results',
      score: 'Match Score',
      pricePerSqm: 'Price/m²',
      newListing: 'NEW',
      urgentSale: 'URGENT',
      viewDetails: 'View Details',
      export: 'Export Excel',
      lowestPrice: 'Lowest Price',
      highestPrice: 'Highest Price',
      loading: 'Searching...',
      min: 'Min',
      max: 'Max',
      required: 'Required: City - Property Type - Max Price',
      selectCity: 'Select city',
      selectDistrict: 'Select district',
      selectType: 'Select type',
      allDistricts: 'All districts',
      buy: 'Buy',
      sell: 'Sell',
      sortBy: 'Sort by',
      sortScore: 'Match Score',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortDateDesc: 'Newest First',
      close: 'Close',
      contactAgent: 'Contact Agent',
      propertyDetails: 'Property Details',
      postedOn: 'Posted on',
      area: 'Area',
      rooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      viewOriginal: 'View Original',
      saveSearch: 'Save Search',
      savedSearches: 'Saved Searches',
      noSavedSearches: 'No saved searches yet',
      loadSearch: 'Load',
      deleteSearch: 'Delete',
      searchSaved: 'Search saved!',
    },
    fr: {
      menu: 'Menu',
      searchParams: 'Paramètres',
      login: 'Connexion',
      signup: 'Inscription',
      city: 'Ville',
      district: 'District',
      propertyType: 'Type de Bien',
      priceMin: 'Prix Min',
      priceMax: 'Prix Max',
      livingArea: 'Surface (m²)',
      bedrooms: 'Chambres',
      daysListed: 'Publié depuis (jours)',
      legalStatus: 'Statut légal',
legalAll: 'Tous',
legalSoHong: 'Carnet Rose',
legalSoDo: 'Carnet Rouge',
legalNone: 'Sans document',
      customKeyword: 'Ajouter mot-clé',
customKeywordPlaceholder: 'Entrer un mot-clé...',
      sources: 'Sources de données',
sourcesDesc: 'Sélectionner les sites à rechercher',
premiumSource: 'Premium',
comingSoon: 'Bientôt',
      keywords: 'Mots-clés Urgents (IMPORTANT)',
      keywordsDesc: 'Ces mots indiquent un vendeur pressé = meilleure opportunité de négociation!',
      search: 'Rechercher',
      results: 'Résultats',
      score: 'Score',
      pricePerSqm: 'Prix/m²',
      newListing: 'NOUVEAU',
      urgentSale: 'URGENT',
      viewDetails: 'Détails',
      export: 'Exporter',
      lowestPrice: 'Prix Min',
      highestPrice: 'Prix Max',
      loading: 'Recherche...',
      min: 'Min',
      max: 'Max',
      required: 'Requis: Ville - Type - Prix Max',
      selectCity: 'Choisir ville',
      selectDistrict: 'Choisir district',
      selectType: 'Choisir type',
      allDistricts: 'Tous les districts',
      buy: 'Achat',
      sell: 'Vente',
      sortBy: 'Trier par',
      sortScore: 'Score',
      sortPriceAsc: 'Prix croissant',
      sortPriceDesc: 'Prix décroissant',
      sortDateDesc: 'Plus récent',
      close: 'Fermer',
      contactAgent: 'Contacter Agent',
      propertyDetails: 'Détails du bien',
      postedOn: 'Publié le',
      area: 'Surface',
      rooms: 'Chambres',
      bathrooms: 'Salle de bain',
      viewOriginal: 'Voir annonce originale',
      saveSearch: 'Sauvegarder',
      savedSearches: 'Recherches sauvegardées',
      noSavedSearches: 'Aucune recherche sauvegardée',
      loadSearch: 'Charger',
      deleteSearch: 'Supprimer',
      searchSaved: 'Recherche sauvegardée!',
    }
  }[language];

  const urgentKeywords = [
    { vn: 'Bán gấp', en: 'Urgent Sale', fr: 'Vente Urgente' },
    { vn: 'Bán nhanh', en: 'Quick Sale', fr: 'Vente Express' },
    { vn: 'Cần bán nhanh', en: 'Need Quick Sale', fr: 'Doit Vendre Vite' },
    { vn: 'Thanh lý rẻ', en: 'Cheap Liquidation', fr: 'Liquidation Pas Cher' },
    { vn: 'Bất ngờ', en: 'Unexpected', fr: 'Inattendu' },
    { vn: 'Kẹt tiền', en: 'Need Money', fr: 'Besoin Argent' },
    { vn: 'Ra đi', en: 'Must Go', fr: 'Doit Partir' },
    { vn: 'Cần tiền', en: 'Need Cash', fr: 'Besoin Cash' },
    { vn: 'Lỗ', en: 'Loss', fr: 'Perte' },
    { vn: 'Cần nhượng lại', en: 'Need to Transfer', fr: 'Besoin Céder' },
    { vn: 'Giá rẻ', en: 'Cheap Price', fr: 'Prix Bas' },
    { vn: 'Ngộp bank', en: 'Bank Pressure', fr: 'Pression Banque' }
  ];

  const propertyTypes = [
    { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement' },
    { vn: 'Căn hộ nghỉ dưỡng', en: 'Resort Apartment', fr: 'Appartement Vacances' },
    { vn: 'Nhà ở', en: 'House', fr: 'Maison' },
    { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa' },
    { vn: 'Nhà nghỉ dưỡng', en: 'Resort House', fr: 'Maison Vacances' },
    { vn: 'Các loại nhà bán', en: 'All Houses', fr: 'Toutes Maisons' },
    { vn: 'Tất cả nhà đất', en: 'All Properties', fr: 'Tous Biens' },
    { vn: 'Studio', en: 'Studio', fr: 'Studio' },
    { vn: 'Mặt bằng', en: 'Commercial Space', fr: 'Local Commercial' },
    { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse' },
    { vn: 'Văn phòng', en: 'Office', fr: 'Bureau' },
    { vn: 'Cửa hàng', en: 'Shop', fr: 'Boutique' },
    { vn: 'Kho, nhà xưởng', en: 'Warehouse', fr: 'Entrepôt' },
    { vn: 'Đất', en: 'Land', fr: 'Terrain' },
    { vn: 'Đất nghỉ dưỡng', en: 'Resort Land', fr: 'Terrain Vacances' },
    { vn: 'Bất động sản khác', en: 'Other', fr: 'Autre' }
  ];
  const availableSources = [
    { id: 'batdongsan', name: 'Batdongsan.com.vn', premium: true, active: true },
    { id: 'chotot', name: 'Chotot.com', premium: false, active: true },
    { id: 'homedy', name: 'Homedy.com', premium: false, active: false },
    { id: 'nhadat247', name: 'Nhadat247.com.vn', premium: false, active: true },
    { id: 'muaban', name: 'Muaban.net', premium: false, active: false },
    { id: 'alonhadat', name: 'Alonhadat.com.vn', premium: false, active: false },
  ];
  const vietnamCities = [
    { vn: 'Hồ Chí Minh', en: 'Ho Chi Minh City', fr: 'Hô-Chi-Minh-Ville' },
    { vn: 'Hà Nội', en: 'Hanoi', fr: 'Hanoï' },
    { vn: 'Đà Nẵng', en: 'Da Nang', fr: 'Da Nang' },
    { vn: 'Bình Dương', en: 'Binh Duong', fr: 'Binh Duong' },
    { vn: 'Đồng Nai', en: 'Dong Nai', fr: 'Dong Nai' },
    { vn: 'Khánh Hòa', en: 'Khanh Hoa', fr: 'Khanh Hoa' },
    { vn: 'Hải Phòng', en: 'Hai Phong', fr: 'Hai Phong' },
    { vn: 'Cần Thơ', en: 'Can Tho', fr: 'Can Tho' },
    { vn: 'Bà Rịa - Vũng Tàu', en: 'Ba Ria - Vung Tau', fr: 'Ba Ria - Vung Tau' },
    { vn: 'Quảng Ninh', en: 'Quang Ninh', fr: 'Quang Ninh' },
    { vn: 'Lâm Đồng', en: 'Lam Dong', fr: 'Lam Dong' },
    { vn: 'Thừa Thiên Huế', en: 'Thua Thien Hue', fr: 'Thua Thien Hue' }
  ];

  const districtsByCity = {
    'Hồ Chí Minh': [
      'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
      'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận',
      'Tân Bình', 'Tân Phú', 'Thủ Đức', 'Bình Tân', 'Nhà Bè', 'Hóc Môn', 'Củ Chi', 'Cần Giờ'
    ],
    'Hà Nội': [
      'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ', 'Cầu Giấy',
      'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông'
    ],
    'Đà Nẵng': [
      'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang'
    ],
    'Bình Dương': [
      'Thủ Dầu Một', 'Dĩ An', 'Thuận An', 'Tân Uyên', 'Bến Cát', 'Bàu Bàng'
    ]
  };

  const handleSearch = async () => {
    if (!searchParams.city || !searchParams.propertyType || !searchParams.priceMax) {
      setError(t.required);
      return;
    }

    setLoading(true);
    setError(null);
    setShowSearch(false);

    try {
      const response = await fetch('/.netlify/functions/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de recherche');
      }

      setResults(data.results);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (currency === 'VND') {
      const ty = (price / 1000000000).toFixed(1).replace('.', ',');
      return `${ty} Tỷ`;
    }
    return `$${(price / 23000).toFixed(0)}`;
  };

  const toggleKeyword = (keyword) => {
    const kw = keyword[language];
    setSearchParams(prev => ({
      ...prev,
      keywords: prev.keywords.includes(kw)
        ? prev.keywords.filter(k => k !== kw)
        : [...prev.keywords, kw]
    }));
  };

  const exportToExcel = () => {
    const headers = ['Titre', 'Prix', 'Prix/m²', 'Ville', 'District', 'Surface', 'Chambres', 'Score'];
    const rows = results.map(r => [
      r.title,
      r.price,
      r.pricePerSqm,
      r.city,
      r.district,
      r.floorArea,
      r.bedrooms,
      r.score
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traxhome_${new Date().toISOString()}.csv`;
    a.click();
  };

  const getPriceUnit = () => {
    if (currency === 'VND') return 'Tỷ';
    return 'USD';
  };

  const currentDistricts = districtsByCity[searchParams.city] || [];

  const sortResults = (results) => {
    const sorted = [...results];
    switch (sortBy) {
      case 'priceAsc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'dateDesc':
        return sorted.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.score - a.score;
        });
      case 'score':
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  };

  const saveCurrentSearch = () => {
    const searchName = `${searchParams.city} - ${searchParams.propertyType} - ${searchParams.priceMax} Tỷ`;
    const newSearch = {
      id: Date.now(),
      name: searchName,
      params: { ...searchParams },
      date: new Date().toLocaleDateString()
    };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('traxhome_searches', JSON.stringify(updated));
    }
    alert(t.searchSaved);
  };

  const loadSavedSearch = (search) => {
    setSearchParams(search.params);
    setShowSavedSearches(false);
  };

  const deleteSavedSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('traxhome_searches', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-gray-900">Traxhome</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">MVP</span>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t.searchParams}
            </button>
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium flex items-center gap-2"
            >
              ⭐ {t.savedSearches} ({savedSearches.length})
            </button>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </header>

      {showSavedSearches && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">⭐ {t.savedSearches}</h2>
            {savedSearches.length === 0 ? (
              <p className="text-gray-500">{t.noSavedSearches}</p>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{search.name}</p>
                      <p className="text-sm text-gray-500">{search.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSavedSearch(search)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t.loadSearch}
                      </button>
                      <button
                        onClick={() => deleteSavedSearch(search.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        {t.deleteSearch}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSearch && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Sources */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌐 {t.sources}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSources.map((source) => (
 <button
                  key={source.id}
                  type="button"
                  onClick={() => {
                    if (!source.active) return; // Bloquer le clic si inactif
                    const newSources = searchParams.sources.includes(source.id)
                      ? searchParams.sources.filter(s => s !== source.id)
                      : [...searchParams.sources, source.id];
                    setSearchParams({ ...searchParams, sources: newSources });
                  }}
                  className={`px-3 py-1 rounded-full text-sm relative ${
                    !source.active
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : searchParams.sources.includes(source.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={!source.active}
                >
                  {source.name}
                  {!source.active && (
                    <span className="ml-1 text-xs">(Sắp ra mắt)</span>
                  )}
                </button>
                  ))}
                </div>
              </div>
            <div className="flex gap-4">
              <button
                onClick={() => setMode('buy')}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  mode === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                🏠 {t.buy}
              </button>
              <button
                onClick={() => setMode('sell')}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  mode === 'sell' ? 'bg-green-600 text-white' : 'bg-gray-100'
                }`}
              >
                💰 {t.sell}
              </button>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">📍 {language === 'vn' ? 'Vị trí & Loại BDS' : language === 'fr' ? 'Localisation & Type' : 'Location & Type'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t.city} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={searchParams.city}
                    onChange={(e) => setSearchParams({...searchParams, city: e.target.value, district: ''})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">{t.selectCity}</option>
                    {vietnamCities.map((c, i) => (
                      <option key={i} value={c.vn}>{c[language]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t.district}
                  </label>
                  <select
                    value={searchParams.district}
                    onChange={(e) => setSearchParams({...searchParams, district: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={!searchParams.city}
                  >
                    <option value="">{t.allDistricts}</option>
                    {currentDistricts.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t.propertyType} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={searchParams.propertyType}
                    onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">{t.selectType}</option>
                    {propertyTypes.map((pt, i) => (
                      <option key={i} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">💰 {language === 'vn' ? 'Giá & Tính năng Cơ bản' : language === 'fr' ? 'Prix & Caractéristiques' : 'Price & Features'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t.priceMin}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={searchParams.priceMin}
                      onChange={(e) => setSearchParams({...searchParams, priceMin: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg pr-12"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {getPriceUnit()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t.priceMax} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={searchParams.priceMax}
                      onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg pr-12"
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {getPriceUnit()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.livingArea}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={searchParams.livingAreaMin}
                      onChange={(e) => setSearchParams({...searchParams, livingAreaMin: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder={t.min}
                    />
                    <input
                      type="number"
                      value={searchParams.livingAreaMax}
                      onChange={(e) => setSearchParams({...searchParams, livingAreaMax: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder={t.max}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.bedrooms}</label>
                    <input
                      type="number"
                      value={searchParams.bedrooms}
                      onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="2"
                    />
                  </div>
                        <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🚿 Phòng tắm</label>
                <input
                  type="number"
                  value={searchParams.bathrooms}
                  onChange={(e) => setSearchParams({...searchParams, bathrooms: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="1"
                />
              </div>
                  <div>
                    {/* Filtres avancés */}
            <div className="col-span-full">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showAdvancedFilters ? '▼ Ẩn bộ lọc nâng cao' : '▶ Bộ lọc nâng cao'}
              </button>
            </div>

           {showAdvancedFilters && (
                <div className="col-span-full bg-gray-50 rounded-lg p-4 mt-2">
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={searchParams.hasParking}
                        onChange={(e) => setSearchParams({...searchParams, hasParking: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">🚗 Chỗ đậu xe</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={searchParams.hasPool}
                        onChange={(e) => setSearchParams({...searchParams, hasPool: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">🏊 Hồ bơi</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">🛣️ Đường rộng min:</span>
                      <input
                        type="number"
                        value={searchParams.streetWidthMin}
                        onChange={(e) => setSearchParams({...searchParams, streetWidthMin: e.target.value})}
                        placeholder="4"
                        step="0.5"
                        className="w-20 px-2 py-1 border rounded-lg"
                      />
                      <span className="text-sm text-gray-500">m</span>
                    </div>
                  </div>
                </div>
              )}
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.daysListed}</label>
                    <input
                      type="number"
                      value={searchParams.daysListed}
                      onChange={(e) => setSearchParams({...searchParams, daysListed: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="30"
                    />
                  </div>
                </div>
                        <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.legalStatus}</label>
                  <select
                    value={searchParams.legalStatus}
                    onChange={(e) => setSearchParams({...searchParams, legalStatus: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">{t.legalAll}</option>
                    <option value="sohong">{t.legalSoHong}</option>
                    <option value="sodo">{t.legalSoDo}</option>
                    <option value="none">{t.legalNone}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-red-600 mb-1">
                🔥 {t.keywords}
              </label>
              <p className="text-xs text-gray-500 mb-3">{t.keywordsDesc}</p>
                <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchParams.customKeyword}
                    onChange={(e) => setSearchParams({...searchParams, customKeyword: e.target.value})}
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder={t.customKeywordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (searchParams.customKeyword.trim()) {
                        setSearchParams(prev => ({
                          ...prev,
                          keywords: [...prev.keywords, prev.customKeyword.trim()],
                          customKeyword: ''
                        }));
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {urgentKeywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => toggleKeyword(kw)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        searchParams.keywords.includes(kw[language])
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                      }`}
                    >
                      {kw[language]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t bg-red-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div>
                <p className="text-sm font-semibold text-red-600">⚠️ {language === 'vn' ? 'Trường bắt buộc:' : language === 'fr' ? 'Champs requis:' : 'Required fields:'}</p>
                <p className="text-sm text-red-600">• {t.city} • {t.propertyType} • {t.priceMax}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveCurrentSearch}
                  disabled={!searchParams.city || !searchParams.propertyType || !searchParams.priceMax}
                  className="px-4 py-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
                >
                  ⭐ {t.saveSearch}
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  {loading ? t.loading : t.search}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showSearch && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-xl text-gray-600">{t.loading}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {stats && mode === 'buy' && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold">{results.length} {t.results}</h2>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white"
                      >
                        <option value="score">{t.sortScore}</option>
                        <option value="priceAsc">{t.sortPriceAsc}</option>
                        <option value="priceDesc">{t.sortPriceDesc}</option>
                        <option value="dateDesc">{t.sortDateDesc}</option>
                      </select>
                    </div>
                    <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {t.export}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">{t.lowestPrice}</p>
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.lowestPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t.highestPrice}</p>
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.highestPrice)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortResults(results).map((prop) => (
                  <div key={prop.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div 
                      className="relative h-48 bg-gray-200 cursor-pointer group"
                      onMouseEnter={() => setExpandedPhoto(prop.id)}
                      onMouseLeave={() => setExpandedPhoto(null)}
                    >
                      <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                      {prop.isNew && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {t.newListing}
                        </div>
                      )}
                      {prop.hasUrgentKeyword && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          {t.urgentSale}
                        </div>
                      )}
{prop.legalStatus && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    📋 {prop.legalStatus}
                  </div>
                )}
{/* Badge Source */}
<div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold ${
  prop.source === 'batdongsan.com.vn' 
    ? 'bg-orange-500 text-white' 
    : prop.source === 'chotot.com'
      ? 'bg-green-600 text-white'
      : 'bg-gray-500 text-white'
}`}>
  {prop.source === 'batdongsan.com.vn' ? 'BĐS' : prop.source === 'chotot.com' ? 'Chợ Tốt' : prop.source}
</div>
                      {expandedPhoto === prop.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10 p-4">
                          <img src={prop.imageUrl} alt={prop.title} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 truncate">{prop.title}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(prop.price)}</p>
                        <p className="text-sm text-gray-500">{formatPrice(prop.pricePerSqm)}/m²</p>
                      </div>
                        {/* Mots-clés urgents */}
                {prop.urgentKeywords && prop.urgentKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {prop.urgentKeywords.map((keyword, idx) => (
                      <span key={idx} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                        🔥 {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {prop.description && (
                  <div className="bg-gray-50 rounded p-2 mb-2 max-h-24 overflow-y-auto">
                    <p className="text-xs text-gray-600 line-clamp-4">
                      {prop.description.substring(0, 300)}...
                    </p>
                  </div>
                )}

                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600">{t.score}</span>
                          <span className="text-sm font-bold">{prop.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${prop.score >= 80 ? 'bg-green-500' : prop.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${prop.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>📐 {prop.floorArea}m²</div>
                        <div>🛏️ {prop.bedrooms} ch.</div>
                      </div>
                            {/* Badges équipements */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {prop.hasParking && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">🚗 Parking</span>
                  )}
                  {prop.hasPool && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">🏊 Piscine</span>
                  )}
                  {prop.openFaces >= 2 && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">🏠 {prop.openFaces} mặt tiền</span>
                  )}
                  {prop.bathrooms && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">🚿 {prop.bathrooms} WC</span>
                  )}
                </div>

                      <div 
                        className="flex items-start gap-2 text-sm text-gray-700 mb-3 cursor-pointer hover:text-blue-600"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.address)}`, '_blank')}
                      >
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{prop.address}, {prop.city}</span>
                      </div>
{/* Bouton Google Maps */}
                {prop.latitude && prop.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${prop.latitude},${prop.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center block mb-2"
                  >
                    🗺️ Google Maps
                  </a>
                )}
                      <button 
                        onClick={() => setSelectedProperty(prop)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t.viewDetails}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">{language === 'vn' ? 'Không tìm thấy kết quả' : language === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}</p>
            </div>
          )}
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{t.propertyDetails}</h2>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            <div className="relative h-64 md:h-96 bg-gray-200">
              <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover" />
              {selectedProperty.hasUrgentKeyword && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse">{t.urgentSale}</div>
              )}
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedProperty.title}</h3>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-blue-600">{formatPrice(selectedProperty.price)}</span>
                  {selectedProperty.pricePerSqm > 0 && (
                    <span className="text-lg text-gray-500">{formatPrice(selectedProperty.pricePerSqm)}/m²</span>
                  )}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{t.score}</span>
                  <span className="font-bold text-lg">{selectedProperty.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${selectedProperty.score >= 80 ? 'bg-green-500' : selectedProperty.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedProperty.score}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedProperty.floorArea}</p>
                  <p className="text-sm text-gray-600">m²</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedProperty.bedrooms || '-'}</p>
                  <p className="text-sm text-gray-600">{t.rooms}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedProperty.bathrooms || '-'}</p>
                  <p className="text-sm text-gray-600">{t.bathrooms}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedProperty.postedOn || '-'}</p>
                  <p className="text-sm text-gray-600">{t.postedOn}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address)}`, '_blank')}>
                <MapPin className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{selectedProperty.address}</p>
                  <p className="text-sm text-blue-600">Voir sur Google Maps →</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button onClick={() => window.open(selectedProperty.url, '_blank')} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">{t.viewOriginal}</button>
                <button onClick={() => setSelectedProperty(null)} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">{t.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
