import { useState } from 'react';
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
  const [searchParams, setSearchParams] = useState({
    city: '',
    district: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    livingAreaMin: '',
    livingAreaMax: '',
    bedrooms: '',
    daysListed: '',
    keywords: [],
    numSites: 5
  });

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
      sortBy: 'Sắp xếp theo',
      sortScore: 'Điểm phù hợp',
      sortPriceAsc: 'Giá tăng dần',
      sortPriceDesc: 'Giá giảm dần',
      sortDateDesc: 'Mới nhất',
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
      sell: 'Bán'
      sortBy: 'Sắp xếp theo',
      sortScore: 'Điểm phù hợp',
      sortPriceAsc: 'Giá tăng dần',
      sortPriceDesc: 'Giá giảm dần',
      sortDateDesc: 'Mới nhất',
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
      sortBy: 'Sort by',
      sortScore: 'Match Score',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortDateDesc: 'Newest First',
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
      sell: 'Sell'
      sortBy: 'Sort by',
      sortScore: 'Match Score',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortDateDesc: 'Newest First',
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
      sortBy: 'Trier par',
      sortScore: 'Score',
      sortPriceAsc: 'Prix croissant',
      sortPriceDesc: 'Prix décroissant',
      sortDateDesc: 'Plus récent',
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
      sell: 'Vente'
      sortBy: 'Trier par',
      sortScore: 'Score',
      sortPriceAsc: 'Prix croissant',
      sortPriceDesc: 'Prix décroissant',
      sortDateDesc: 'Plus récent',
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

      {showSearch && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Mode Achat/Vente */}
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

            {/* Section: Vị trí & Loại BDS */}
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

            {/* Section: Prix */}
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
              </div>
            </div>

            {/* Section: Mots-clés urgents */}
            <div>
              <label className="block text-sm font-bold text-red-600 mb-1">
                🔥 {t.keywords}
              </label>
              <p className="text-xs text-gray-500 mb-3">{t.keywordsDesc}</p>
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

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Footer avec bouton recherche */}
            <div className="flex justify-between items-center pt-4 border-t bg-red-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div>
                <p className="text-sm font-semibold text-red-600">⚠️ {language === 'vn' ? 'Trường bắt buộc:' : language === 'fr' ? 'Champs requis:' : 'Required fields:'}</p>
                <p className="text-sm text-red-600">• {t.city} • {t.propertyType} • {t.priceMax}</p>
              </div>
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

                      <div 
                        className="flex items-start gap-2 text-sm text-gray-700 mb-3 cursor-pointer hover:text-blue-600"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.address)}`, '_blank')}
                      >
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span className="line-clamp-2">{prop.address}, {prop.city}</span>
                      </div>

                      <button 
                        onClick={() => window.open(prop.url, '_blank')}
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
    </div>
  );
}
