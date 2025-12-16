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

  const [searchParams, setSearchParams] = useState({
    city: '',
    district: '',
    propertyType: '',
    priceMax: '',
    livingAreaMin: '',
    livingAreaMax: '',
    bedrooms: '',
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
      priceMax: 'Giá tối đa',
      livingArea: 'Diện tích (m²)',
      bedrooms: 'Phòng ngủ',
      keywords: 'Từ khóa QUAN TRỌNG',
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
      required: '3 tham số bắt buộc: Thành phố - Loại BDS - Giá tối đa'
    },
    en: {
      menu: 'Menu',
      searchParams: 'Search Parameters',
      login: 'Login',
      signup: 'Sign Up',
      city: 'City',
      district: 'District',
      propertyType: 'Property Type',
      priceMax: 'Max Price',
      livingArea: 'Living Area (m²)',
      bedrooms: 'Bedrooms',
      keywords: 'IMPORTANT Keywords',
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
      required: '3 required: City - Property Type - Max Price'
    },
    fr: {
      menu: 'Menu',
      searchParams: 'Paramètres',
      login: 'Connexion',
      signup: 'Inscription',
      city: 'Ville',
      district: 'District',
      propertyType: 'Type de Bien',
      priceMax: 'Prix Max',
      livingArea: 'Surface (m²)',
      bedrooms: 'Chambres',
      keywords: 'Mots-clés',
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
      required: '3 requis: Ville - Type - Prix Max'
    }
  }[language];

  const urgentKeywords = [
    { vn: 'Bán gấp', en: 'Urgent Sale', fr: 'Urgent' },
    { vn: 'Kẹt tiền', en: 'Need Money', fr: 'Besoin Argent' },
    { vn: 'Cần tiền', en: 'Need Cash', fr: 'Liquidités' },
    { vn: 'Bán nhanh', en: 'Quick Sale', fr: 'Vente Rapide' },
    { vn: 'Thanh lý', en: 'Liquidation', fr: 'Liquidation' }
  ];

  const propertyTypes = [
    { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement' },
    { vn: 'Nhà ở', en: 'House', fr: 'Maison' },
    { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa' },
    { vn: 'Studio', en: 'Studio', fr: 'Studio' },
    { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse' },
    { vn: 'Đất', en: 'Land', fr: 'Terrain' }
  ];

  const vietnamCities = [
    { vn: 'Hồ Chí Minh', en: 'Ho Chi Minh', fr: 'Hô-Chi-Minh-Ville' },
    { vn: 'Hà Nội', en: 'Hanoi', fr: 'Hanoï' },
    { vn: 'Đà Nẵng', en: 'Da Nang', fr: 'Da Nang' }
  ];

  const handleSearch = async () => {
    if (!searchParams.city || !searchParams.propertyType || !searchParams.priceMax) {
      setError(t.required);
      return;
    }

    setLoading(true);
    setError(null);
    setShowSearch(false);

    try {
      const response = await fetch('/api/search', {
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
      return `${(price / 1000000000).toFixed(1)} Tỷ`;
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
            <div className="flex gap-4">
              <button
                onClick={() => setMode('buy')}
                className={`px-6 py-3 rounded-lg font-medium ${
                  mode === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                🏠 Achat
              </button>
              <button
                onClick={() => setMode('sell')}
                className={`px-6 py-3 rounded-lg font-medium ${
                  mode === 'sell' ? 'bg-green-600 text-white' : 'bg-gray-100'
                }`}
              >
                💰 Vente
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t.city} <span className="text-red-500">*</span>
                </label>
                <select
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Chọn thành phố</option>
                  {vietnamCities.map((c, i) => (
                    <option key={i} value={c.vn}>{c[language]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t.propertyType} <span className="text-red-500">*</span>
                </label>
                <select
                  value={searchParams.propertyType}
                  onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Chọn loại</option>
                  {propertyTypes.map((pt, i) => (
                    <option key={i} value={pt.vn}>{pt[language]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t.priceMax} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={searchParams.priceMax}
                  onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="5000000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">{t.district}</label>
                <input
                  type="text"
                  value={searchParams.district}
                  onChange={(e) => setSearchParams({...searchParams, district: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Quận 1"
                />
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
            </div>

            <div>
              <label className="block text-sm font-bold text-red-600 mb-2">
                🔥 {t.keywords}
              </label>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {urgentKeywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => toggleKeyword(kw)}
                      class
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        searchParams.keywords.includes(kw[language])
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-red-600 border border-red-300'
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

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">{t.required}</p>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2"
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
            <div className="flex flex-col items-center justify-ce
        nter py-20">
              <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-xl text-gray-600">{t.loading}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {stats && mode === 'buy' && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{results.length} {t.results}</h2>
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
                {results.map((prop) => (
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
              <p className="text-xl text-gray-600">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
