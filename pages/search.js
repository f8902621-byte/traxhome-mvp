import { useState, useEffect } from 'react';
import { Search, Menu, Download, MapPin, AlertCircle, Loader, Home } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SearchPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('vn');
  const [currency, setCurrency] = useState('VND');
  const [mode, setMode] = useState('buy');
  const [showSearch, setShowSearch] = useState(true);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbStats, setDbStats] = useState(null);
const [showDbStats, setShowDbStats] = useState(false);
  const [statsCategory, setStatsCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
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
    sources: ['chotot', 'alonhadat', 'batdongsan'],
    keywords: [],
    keywordsOnly: false,
    numSites: 5
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ktrix_searches');
      if (saved) setSavedSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (router.query.lang && ['vn', 'en', 'fr'].includes(router.query.lang)) {
      setLanguage(router.query.lang);
    }
  }, [router.query.lang]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedProperty(null);
        setExpandedPhoto(null);
      }
    };
       window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  // Rafraîchir les stats quand les résultats changent
useEffect(() => {
  if (results.length > 0 && !showSearch) {
    loadDbStats(searchParams.city, statsCategory);
    setShowDbStats(true);
  }
}, [results, statsCategory]);
const loadDbStats = async (city = '', category = '') => {
  try {
    let url = '/.netlify/functions/stats?';
    if (city) url += `city=${encodeURIComponent(city)}&`;
    if (category) url += `category=${encodeURIComponent(category)}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Stats reçues:', data);
if (data.success) {
  setDbStats(data);
  console.log('dbStats mis à jour:', data.global);
}
  } catch (err) {
    console.error('Error loading DB stats:', err);
  }
};
  const t = {
    vn: {
      menu: 'Menu', searchParams: 'Tham số Tìm kiếm', backToHome: 'Trang chủ',
      city: 'Thành phố', district: 'Quận/Huyện', propertyType: 'Loại BDS',
      priceMin: 'Giá tối thiểu', priceMax: 'Giá tối đa', livingArea: 'Diện tích (m²)',
      bedrooms: 'Phòng ngủ', daysListed: 'Đăng trong (ngày)', legalStatus: 'Pháp lý',
      legalAll: 'Tất cả', legalSoHong: 'Sổ đỏ/Sổ hồng', legalHopdong: 'Hợp đồng mua bán', legalDangcho: 'Đang chờ sổ',
      customKeyword: 'Thêm từ khóa', customKeywordPlaceholder: 'Nhập từ khóa khác...',
      sources: 'Nguồn dữ liệu', keywords: 'Từ khóa Khẩn cấp (QUAN TRỌNG)',
      keywordsDesc: 'Những từ này cho thấy người bán gấp = cơ hội đàm phán tốt nhất!',
      search: 'Tìm kiếm', results: 'Kết quả', score: 'Điểm phù hợp',
      newListing: 'MỚI', urgentSale: 'GẤP', viewDetails: 'Xem chi tiết',
      export: 'Xuất Excel', lowestPrice: 'Giá thấp nhất', highestPrice: 'Giá cao nhất',
      loading: 'Đang tìm kiếm...', min: 'Tối thiểu', max: 'Tối đa',
      required: 'Trường bắt buộc: Thành phố - Loại BDS - Giá tối đa',
      selectCity: 'Chọn thành phố', selectDistrict: 'Chọn quận/huyện',
      selectType: 'Chọn loại BDS', allDistricts: 'Tất cả quận/huyện',
      buy: 'Mua', sell: 'Bán', sortScore: 'Điểm phù hợp',
      sortPriceAsc: 'Giá tăng dần', sortPriceDesc: 'Giá giảm dần', sortDateDesc: 'Mới nhất',
      close: 'Đóng', propertyDetails: 'Chi tiết BDS', postedOn: 'Ngày đăng',
      rooms: 'Phòng ngủ', bathrooms: 'Phòng tắm', viewOriginal: 'Xem bài gốc',
      saveSearch: 'Lưu tìm kiếm', savedSearches: 'Tìm kiếm đã lưu',
      noSavedSearches: 'Chưa có tìm kiếm nào được lưu',
      loadSearch: 'Tải', deleteSearch: 'Xóa', searchSaved: 'Đã lưu tìm kiếm!',
      hasParking: 'Parking', hasPool: 'Hồ bơi', streetWidth: 'Đường rộng (m)',
      noResults: 'Không tìm thấy kết quả',
      comingSoon: 'Sắp ra mắt',
      negotiationScore: 'Điểm thương lượng',
      negotiationExcellent: 'Cơ hội tuyệt vời',
      negotiationGood: 'Cơ hội tốt',
      negotiationModerate: 'Cơ hội trung bình',
      negotiationLow: 'Ít cơ hội',
      priceAnalysis: 'Phân tích giá',
      vsAverage: 'so với TB khu vực',
      belowAverage: 'dưới TB',
      aboveAverage: 'trên TB',
      daysOnline: 'ngày đăng',
      urgentKeywordsFound: 'Từ khóa gấp',
      whyThisScore: 'Tại sao điểm này?',
      priceLower: 'Giá thấp hơn TB',
      listingOld: 'Đăng lâu',
      fewPhotos: 'Ít hình ảnh',
      roundPrice: 'Giá tròn',
      viewOnMap: 'Xem trên bản đồ',
      cbreAnalysis: 'Phân tích CBRE',
      cbreSource: 'Nguồn: CBRE',
      cbreReference: 'Giá tham khảo',
      belowMarket: 'dưới thị trường',
      aboveMarket: 'trên thị trường',
      cbreDisclaimer: '© CBRE Vietnam. Dữ liệu chỉ mang tính tham khảo.',
            statsCatAll: '📊 Tất cả',
      statsCatApartment: '🏢 Căn hộ',
      statsCatHouse: '🏠 Nhà/Biệt thự',
      statsCatCommercial: '🏪 Thương mại',
      statsCatLand: '🌳 Đất',
      // Categories for property types
      catApartment: '🏢 Căn hộ',
      catHouse: '🏠 Nhà ở',
      catCommercial: '🏪 Thương mại',
      catLand: '🌳 Đất',
      catOther: '📦 Khác',
      // NLP Analysis
    nlpAnalysisTitle: '🔍 Phân tích tự động',
    nlpOpportunities: '✅ Cơ hội phát hiện',
    nlpRisks: '⚠️ Rủi ro phát hiện',
    nlpMetro: 'Gần Metro',
    nlpNewRoad: 'Sắp mở đường',
    nlpInvestment: 'Tiềm năng đầu tư',
    nlpNoTitle: 'Chưa có sổ',
    nlpPlanningRisk: 'Rủi ro quy hoạch',
    nlpRentalIncome: '💰 Thu nhập cho thuê',
    nlpGrossYield: 'Lợi suất',
    nlpExtractedInfo: 'Thông tin trích xuất',
      // Database Stats Dashboard
      dbStatsTitle: '📊 Thống kê thị trường (từ dữ liệu K Trix)',
      dbStatsTotal: 'Tổng tin đăng',
      dbStatsDistricts: 'Quận/Huyện',
      dbStatsAvgPrice: 'Giá TB/m²',
      dbStatsTrend: 'Xu hướng',
      dbStatsTrendUp: '📈 Tăng',
      dbStatsTrendDown: '📉 Giảm',
      dbStatsTrendStable: '➡️ Ổn định',
      dbStatsNew: 'mới tuần này',
      dbStatsShowMore: 'Xem chi tiết',
      dbStatsHide: 'Ẩn thống kê',
    },
    en: {
      menu: 'Menu', searchParams: 'Search Parameters', backToHome: 'Home',
      city: 'City', district: 'District', propertyType: 'Property Type',
      priceMin: 'Min Price', priceMax: 'Max Price', livingArea: 'Living Area (m²)',
      bedrooms: 'Bedrooms', daysListed: 'Listed within (days)', legalStatus: 'Legal Status',
      legalAll: 'All', legalSoHong: 'Red/Pink Book', legalHopdong: 'Sales Contract', legalDangcho: 'Pending',
      customKeyword: 'Add keyword', customKeywordPlaceholder: 'Enter custom keyword...',
      sources: 'Data Sources', keywords: 'Urgent Keywords (IMPORTANT)',
      keywordsDesc: 'These words indicate desperate sellers = best negotiation opportunity!',
      search: 'Search', results: 'Results', score: 'Match Score',
      newListing: 'NEW', urgentSale: 'URGENT', viewDetails: 'View Details',
      export: 'Export Excel', lowestPrice: 'Lowest Price', highestPrice: 'Highest Price',
      loading: 'Searching...', min: 'Min', max: 'Max',
      required: 'Required: City - Property Type - Max Price',
      selectCity: 'Select city', selectDistrict: 'Select district',
      selectType: 'Select type', allDistricts: 'All districts',
      buy: 'Buy', sell: 'Sell', sortScore: 'Match Score',
      sortPriceAsc: 'Price: Low to High', sortPriceDesc: 'Price: High to Low', sortDateDesc: 'Newest First',
      close: 'Close', propertyDetails: 'Property Details', postedOn: 'Posted on',
      rooms: 'Bedrooms', bathrooms: 'Bathrooms', viewOriginal: 'View Original',
      saveSearch: 'Save Search', savedSearches: 'Saved Searches',
      noSavedSearches: 'No saved searches yet',
      loadSearch: 'Load', deleteSearch: 'Delete', searchSaved: 'Search saved!',
      hasParking: 'Parking', hasPool: 'Pool', streetWidth: 'Street min (m)',
      noResults: 'No results found',
      comingSoon: 'Coming soon',
      negotiationScore: 'Negotiation Score',
      negotiationExcellent: 'Excellent opportunity',
      negotiationGood: 'Good opportunity',
      negotiationModerate: 'Moderate opportunity',
      negotiationLow: 'Low opportunity',
      priceAnalysis: 'Price Analysis',
      vsAverage: 'vs area average',
      belowAverage: 'below avg',
      aboveAverage: 'above avg',
      daysOnline: 'days listed',
      urgentKeywordsFound: 'Urgent keywords',
      whyThisScore: 'Why this score?',
      priceLower: 'Price below average',
      listingOld: 'Listed for long',
      fewPhotos: 'Few photos',
      roundPrice: 'Round price',
      viewOnMap: 'View on map',
      cbreAnalysis: 'CBRE Analysis',
      cbreSource: 'Source: CBRE',
      cbreReference: 'Reference price',
      belowMarket: 'below market',
      aboveMarket: 'above market',
      cbreDisclaimer: '© CBRE Vietnam. Data for reference only.',
            statsCatAll: '📊 All types',
      statsCatApartment: '🏢 Apartments',
      statsCatHouse: '🏠 Houses/Villas',
      statsCatCommercial: '🏪 Commercial',
      statsCatLand: '🌳 Land',
      // Categories for property types
      catApartment: '🏢 Apartments',
      catHouse: '🏠 Houses',
      catCommercial: '🏪 Commercial',
      catLand: '🌳 Land',
      catOther: '📦 Other',
      // NLP Analysis
    nlpAnalysisTitle: '🔍 Automatic text analysis',
    nlpOpportunities: '✅ Opportunities detected',
    nlpRisks: '⚠️ Risks detected',
    nlpMetro: 'Near Metro',
    nlpNewRoad: 'New road planned',
    nlpInvestment: 'Investment potential',
    nlpNoTitle: 'No land title',
    nlpPlanningRisk: 'Planning risk',
    nlpRentalIncome: '💰 Rental income mentioned',
    nlpGrossYield: 'Gross yield',
    nlpExtractedInfo: 'Extracted info',
      dbStatsTitle: '📊 Market Stats (from K Trix data)',
dbStatsTotal: 'Total listings',
dbStatsDistricts: 'Districts',
dbStatsAvgPrice: 'Avg price/m²',
dbStatsTrend: 'Trend',
dbStatsTrendUp: '📈 Up',
dbStatsTrendDown: '📉 Down',
dbStatsTrendStable: '➡️ Stable',
dbStatsNew: 'new this week',
dbStatsShowMore: 'Show details',
dbStatsHide: 'Hide stats',
    },
    fr: {
      menu: 'Menu', searchParams: 'Paramètres', backToHome: 'Accueil',
      city: 'Ville', district: 'District', propertyType: 'Type de Bien',
      priceMin: 'Prix Min', priceMax: 'Prix Max', livingArea: 'Surface (m²)',
      bedrooms: 'Chambres', daysListed: 'Publié depuis (jours)', legalStatus: 'Statut légal',
     legalAll: 'Tous', legalSoHong: 'Sổ đỏ/Sổ hồng', legalHopdong: 'Contrat de vente', legalDangcho: 'En attente',
      customKeyword: 'Ajouter mot-clé', customKeywordPlaceholder: 'Entrer un mot-clé...',
      sources: 'Sources de données', keywords: 'Mots-clés Urgents (IMPORTANT)',
      keywordsDesc: 'Ces mots indiquent un vendeur pressé = meilleure opportunité de négociation!',
      search: 'Rechercher', results: 'Résultats', score: 'Score',
      newListing: 'NOUVEAU', urgentSale: 'URGENT', viewDetails: 'Détails',
      export: 'Exporter', lowestPrice: 'Prix Min', highestPrice: 'Prix Max',
      loading: 'Recherche...', min: 'Min', max: 'Max',
      required: 'Requis: Ville - Type - Prix Max',
      selectCity: 'Choisir ville', selectDistrict: 'Choisir district',
      selectType: 'Choisir type', allDistricts: 'Tous les districts',
      buy: 'Achat', sell: 'Vente', sortScore: 'Score',
      sortPriceAsc: 'Prix croissant', sortPriceDesc: 'Prix décroissant', sortDateDesc: 'Plus récent',
      close: 'Fermer', propertyDetails: 'Détails du bien', postedOn: 'Publié le',
      rooms: 'Chambres', bathrooms: 'Salle de bain', viewOriginal: 'Voir annonce originale',
      saveSearch: 'Sauvegarder', savedSearches: 'Recherches sauvegardées',
      noSavedSearches: 'Aucune recherche sauvegardée',
      loadSearch: 'Charger', deleteSearch: 'Supprimer', searchSaved: 'Recherche sauvegardée!',
      hasParking: 'Parking', hasPool: 'Piscine', streetWidth: 'Rue min (m)',
      noResults: 'Aucun résultat trouvé',
      comingSoon: 'Bientôt',
      negotiationScore: 'Score de négociation',
      negotiationExcellent: 'Excellente opportunité',
      negotiationGood: 'Bonne opportunité',
      negotiationModerate: 'Opportunité moyenne',
      negotiationLow: 'Peu d\'opportunité',
      priceAnalysis: 'Analyse du prix',
      vsAverage: 'vs moyenne zone',
      belowAverage: 'sous moy.',
      aboveAverage: 'au-dessus moy.',
      daysOnline: 'jours en ligne',
      urgentKeywordsFound: 'Mots-clés urgents',
      whyThisScore: 'Pourquoi ce score?',
      priceLower: 'Prix sous la moyenne',
      listingOld: 'En ligne depuis longtemps',
      fewPhotos: 'Peu de photos',
      roundPrice: 'Prix rond',
      viewOnMap: 'Voir sur carte',
      cbreAnalysis: 'Analyse CBRE',
      cbreSource: 'Source: CBRE',
      cbreReference: 'Prix de référence',
      belowMarket: 'sous le marché',
      aboveMarket: 'au-dessus du marché',
      cbreDisclaimer: '© CBRE Vietnam. Données à titre indicatif.',
            statsCatAll: '📊 Tous types',
      statsCatApartment: '🏢 Appartements',
      statsCatHouse: '🏠 Maisons/Villas',
      statsCatCommercial: '🏪 Commercial',
      statsCatLand: '🌳 Terrains',
      // Categories for property types
      catApartment: '🏢 Appartements',
      catHouse: '🏠 Maisons',
      catCommercial: '🏪 Commercial',
      catLand: '🌳 Terrain',
      catOther: '📦 Autre',
      // NLP Analysis
    nlpAnalysisTitle: '🔍 Analyse automatique du texte',
    nlpOpportunities: '✅ Opportunités détectées',
    nlpRisks: '⚠️ Risques détectés',
    nlpMetro: 'Proche Métro',
    nlpNewRoad: 'Nouvelle route prévue',
    nlpInvestment: 'Potentiel investissement',
    nlpNoTitle: 'Pas de titre foncier',
    nlpPlanningRisk: 'Risque urbanisme',
    nlpRentalIncome: '💰 Revenu locatif mentionné',
    nlpGrossYield: 'Rendement brut',
    nlpExtractedInfo: 'Infos extraites',
      dbStatsTitle: '📊 Stats marché (données K Trix)',
dbStatsTotal: 'Annonces totales',
dbStatsDistricts: 'Districts',
dbStatsAvgPrice: 'Prix moy/m²',
dbStatsTrend: 'Tendance',
dbStatsTrendUp: '📈 Hausse',
dbStatsTrendDown: '📉 Baisse',
dbStatsTrendStable: '➡️ Stable',
dbStatsNew: 'nouveau cette sem.',
dbStatsShowMore: 'Voir détails',
dbStatsHide: 'Masquer stats',
    }
  }[language];

  const urgentKeywords = [
    { vn: 'Bán gấp', en: 'Urgent Sale', fr: 'Vente Urgente' },
    { vn: 'Bán nhanh', en: 'Quick Sale', fr: 'Vente Express' },
    { vn: 'Cần bán nhanh', en: 'Need Quick Sale', fr: 'Doit Vendre Vite' },
    { vn: 'Kẹt tiền', en: 'Need Money', fr: 'Besoin Argent' },
    { vn: 'Cần tiền', en: 'Need Cash', fr: 'Besoin Cash' },
    { vn: 'Giá rẻ', en: 'Cheap Price', fr: 'Prix Bas' },
    { vn: 'Ngộp bank', en: 'Bank Pressure', fr: 'Pression Banque' },
    { vn: 'Chính chủ', en: 'Direct Owner', fr: 'Propriétaire Direct' },
    { vn: 'Miễn trung gian', en: 'No Agent', fr: 'Sans Intermédiaire' },
    { vn: 'Giá thương lượng', en: 'Negotiable Price', fr: 'Prix Négociable' },
    { vn: 'Bán lỗ', en: 'Selling at Loss', fr: 'Vente à Perte' }
  ];

  // ============================================
  // 15 TYPES DE BIENS COMPLETS
  // ============================================
  const propertyTypes = [
    // Tous biens
    { vn: 'Tất cả nhà đất', en: 'All Properties', fr: 'Tous Biens', category: 'all' },
    // Appartements
    { vn: 'Căn hộ chung cư', en: 'Apartment', fr: 'Appartement', category: 'apartment' },
    { vn: 'Căn hộ nghỉ dưỡng', en: 'Resort Condo', fr: 'Appart. Vacances', category: 'apartment' },
    { vn: 'Studio', en: 'Studio', fr: 'Studio', category: 'apartment' },
    // Maisons
    { vn: 'Nhà ở', en: 'House', fr: 'Maison', category: 'house' },
    { vn: 'Nhà biệt thự', en: 'Villa', fr: 'Villa', category: 'house' },
    { vn: 'Nhà nghỉ dưỡng', en: 'Resort House', fr: 'Maison Vacances', category: 'house' },
    // Commercial
    { vn: 'Shophouse', en: 'Shophouse', fr: 'Shophouse', category: 'commercial' },
    { vn: 'Văn phòng', en: 'Office', fr: 'Bureau', category: 'commercial' },
    { vn: 'Cửa hàng', en: 'Shop', fr: 'Boutique', category: 'commercial' },
    { vn: 'Mặt bằng', en: 'Premises', fr: 'Local commercial', category: 'commercial' },
    { vn: 'Kho, nhà xưởng', en: 'Warehouse', fr: 'Entrepôt', category: 'commercial' },
    // Terrain
    { vn: 'Đất', en: 'Land', fr: 'Terrain', category: 'land' },
    { vn: 'Đất nghỉ dưỡng', en: 'Resort Land', fr: 'Terrain Vacances', category: 'land' },
    // Autre
    { vn: 'Bất động sản khác', en: 'Other Property', fr: 'Autre Bien', category: 'other' },
  ];

const availableSources = [
  { id: 'chotot', name: 'Chotot.com', active: true },
  { id: 'alonhadat', name: 'Alonhadat.com.vn', active: true },
  { id: 'batdongsan', name: 'Batdongsan.com.vn', active: true },
];
  const vietnamCities = [
    { vn: 'Hồ Chí Minh', en: 'Ho Chi Minh City', fr: 'Hô-Chi-Minh-Ville' },
    { vn: 'Hà Nội', en: 'Hanoi', fr: 'Hanoï' },
    { vn: 'Đà Nẵng', en: 'Da Nang', fr: 'Da Nang' },
    { vn: 'Bình Dương', en: 'Binh Duong', fr: 'Binh Duong' },
    { vn: 'Khánh Hòa', en: 'Khanh Hoa (Nha Trang)', fr: 'Khanh Hoa (Nha Trang)' },
    { vn: 'Cần Thơ', en: 'Can Tho', fr: 'Can Tho' },
    { vn: 'Hải Phòng', en: 'Hai Phong', fr: 'Hai Phong' },
    { vn: 'Bà Rịa - Vũng Tàu', en: 'Ba Ria - Vung Tau', fr: 'Ba Ria - Vung Tau' },
    { vn: 'Bình Định', en: 'Binh Dinh (Quy Nhon)', fr: 'Binh Dinh (Quy Nhon)' },
    { vn: 'Lâm Đồng', en: 'Lam Dong (Da Lat)', fr: 'Lam Dong (Da Lat)' },
  ];

  const districtsByCity = {
    'Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Thủ Đức'],
    'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ', 'Cầu Giấy'],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu'],
    'Bình Dương': ['Thủ Dầu Một', 'Dĩ An', 'Thuận An'],
    'Khánh Hòa': ['Nha Trang', 'Cam Ranh', 'Diên Khánh'],
    'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng'],
    'Hải Phòng': ['Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Đồ Sơn'],
    'Bà Rịa - Vũng Tàu': ['Vũng Tàu', 'Bà Rịa', 'Long Điền', 'Phú Mỹ'],
    'Bình Định': ['Quy Nhơn', 'An Nhơn', 'Hoài Nhơn', 'Tuy Phước', 'Phù Cát'],
  };

  const currentDistricts = districtsByCity[searchParams.city] || [];

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
      if (!response.ok) throw new Error(data.error || 'Search error');
      setResults(data.results || []);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    if (currency === 'VND') {
      return `${(price / 1000000000).toFixed(1).replace('.', ',')} Tỷ`;
    }
    return `$${(price / 25000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const toggleKeyword = (keyword) => {
    const kw = keyword[language];
    setSearchParams(prev => ({
      ...prev,
      keywords: prev.keywords.includes(kw) ? prev.keywords.filter(k => k !== kw) : [...prev.keywords, kw]
    }));
  };

  const exportToExcel = () => {
    const headers = ['Titre', 'Prix', 'Ville', 'Surface', 'Chambres', 'Score'];
    const rows = results.map(r => [r.title, r.price, r.city, r.floorArea, r.bedrooms, r.score]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ktrix_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const saveCurrentSearch = () => {
    const searchName = `${searchParams.city} - ${searchParams.propertyType}`;
    const newSearch = { id: Date.now(), name: searchName, params: { ...searchParams }, date: new Date().toLocaleDateString() };
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    if (typeof window !== 'undefined') localStorage.setItem('ktrix_searches', JSON.stringify(updated));
    alert(t.searchSaved);
  };

  const sortResults = (res) => {
    const sorted = [...res];
    switch (sortBy) {
      case 'priceAsc': return sorted.sort((a, b) => a.price - b.price);
      case 'priceDesc': return sorted.sort((a, b) => b.price - a.price);
      default: return sorted.sort((a, b) => b.score - a.score);
    }
  };

  // Group property types by category for better UX
  const getPropertyTypesByCategory = () => {
    const categories = {
      all: propertyTypes.filter(pt => pt.category === 'all'),
      apartment: propertyTypes.filter(pt => pt.category === 'apartment'),
      house: propertyTypes.filter(pt => pt.category === 'house'),
      commercial: propertyTypes.filter(pt => pt.category === 'commercial'),
      land: propertyTypes.filter(pt => pt.category === 'land'),
      other: propertyTypes.filter(pt => pt.category === 'other'),
    };
    return categories;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-sky-50 rounded-lg text-sky-600">
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="https://raw.githubusercontent.com/f8902621-byte/traxhome-mvp/main/Ktrixlogo.png" alt="K Trix" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-900">K Trix</span>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">MVP</span>
            </div>
            <button onClick={() => setShowSearch(!showSearch)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-medium flex items-center gap-2 shadow-md">
              <Search className="w-4 h-4" />
              {t.searchParams}
            </button>
            <button onClick={() => setShowSavedSearches(!showSavedSearches)} className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-medium">
              ⭐ {t.savedSearches} ({savedSearches.length})
            </button>
          </div>
          <div className="flex items-center gap-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
              <option value="vn">🇻🇳 VN</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </header>

      {/* Saved Searches */}
      {showSavedSearches && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">⭐ {t.savedSearches}</h2>
            {savedSearches.length === 0 ? (
              <p className="text-gray-500">{t.noSavedSearches}</p>
            ) : (
              <div className="space-y-3">
                {savedSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{search.name}</p>
                      <p className="text-sm text-gray-500">{search.date}</p>
                    </div>
                    <button onClick={() => { setSearchParams(search.params); setShowSavedSearches(false); }} className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg">
                      {t.loadSearch}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Form */}
      {showSearch && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🌐 {t.sources}</label>
              <div className="flex flex-wrap gap-2">
                {availableSources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      if (!source.active) return;
                      const newSources = searchParams.sources.includes(source.id)
                        ? searchParams.sources.filter(s => s !== source.id)
                        : [...searchParams.sources, source.id];
                      setSearchParams({ ...searchParams, sources: newSources });
                    }}
                    disabled={!source.active}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      !source.active ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : searchParams.sources.includes(source.id) ? 'bg-sky-500 text-white' : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                    }`}
                  >
                    {source.name} {!source.active && `(${t.comingSoon})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy/Sell */}
            <div className="flex gap-4">
              <button onClick={() => setMode('buy')} className={`px-6 py-3 rounded-lg font-medium ${mode === 'buy' ? 'bg-sky-500 text-white' : 'bg-slate-100'}`}>
                🏠 {t.buy}
              </button>
              <button onClick={() => setMode('sell')} className={`px-6 py-3 rounded-lg font-medium ${mode === 'sell' ? 'bg-orange-400 text-white' : 'bg-slate-100'}`}>
                💰 {t.sell}
              </button>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.city} <span className="text-orange-500">*</span></label>
                <select value={searchParams.city} onChange={(e) => setSearchParams({...searchParams, city: e.target.value, district: ''})} className="w-full px-4 py-2.5 border rounded-lg">
                  <option value="">{t.selectCity}</option>
                  {vietnamCities.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.district}</label>
                <select value={searchParams.district} onChange={(e) => setSearchParams({...searchParams, district: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" disabled={!searchParams.city}>
                  <option value="">{t.allDistricts}</option>
                  {currentDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.propertyType} <span className="text-orange-500">*</span></label>
                <select value={searchParams.propertyType} onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg">
                  <option value="">{t.selectType}</option>
                  {/* All Properties */}
                  {getPropertyTypesByCategory().all.map((pt, i) => (
                    <option key={`all-${i}`} value={pt.vn}>📋 {pt[language]}</option>
                  ))}
                  {/* Apartments */}
                  <optgroup label={t.catApartment}>
                    {getPropertyTypesByCategory().apartment.map((pt, i) => (
                      <option key={`apt-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  {/* Houses */}
                  <optgroup label={t.catHouse}>
                    {getPropertyTypesByCategory().house.map((pt, i) => (
                      <option key={`house-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  {/* Commercial */}
                  <optgroup label={t.catCommercial}>
                    {getPropertyTypesByCategory().commercial.map((pt, i) => (
                      <option key={`comm-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  {/* Land */}
                  <optgroup label={t.catLand}>
                    {getPropertyTypesByCategory().land.map((pt, i) => (
                      <option key={`land-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                  {/* Other */}
                  <optgroup label={t.catOther}>
                    {getPropertyTypesByCategory().other.map((pt, i) => (
                      <option key={`other-${i}`} value={pt.vn}>{pt[language]}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.priceMin}</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" min="0" max="500" value={searchParams.priceMin} onChange={(e) => setSearchParams({...searchParams, priceMin: e.target.value})} className="w-24 px-3 py-2.5 border rounded-lg text-right" placeholder="0" />
                  <span className="text-gray-500 font-medium">Tỷ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.priceMax} <span className="text-orange-500">*</span></label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.1" min="0" max="500" value={searchParams.priceMax} onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})} className="w-24 px-3 py-2.5 border rounded-lg text-right" placeholder="10" />
                  <span className="text-gray-500 font-medium">Tỷ</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.livingArea}</label>
                <div className="flex gap-2">
                  <input type="number" value={searchParams.livingAreaMin} onChange={(e) => setSearchParams({...searchParams, livingAreaMin: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder={t.min} />
                  <input type="number" value={searchParams.livingAreaMax} onChange={(e) => setSearchParams({...searchParams, livingAreaMax: e.target.value})} className="w-full px-3 py-2.5 border rounded-lg" placeholder={t.max} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.bedrooms}</label>
                <input type="number" value={searchParams.bedrooms} onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="2" />
              </div>
            </div>

            {/* Extra filters */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🚿 {t.bathrooms}</label>
                <input type="number" value={searchParams.bathrooms} onChange={(e) => setSearchParams({...searchParams, bathrooms: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.daysListed}</label>
                <input type="number" value={searchParams.daysListed} onChange={(e) => setSearchParams({...searchParams, daysListed: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg" placeholder="30" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.legalStatus}</label>
                <select value={searchParams.legalStatus} onChange={(e) => setSearchParams({...searchParams, legalStatus: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg">
  <option value="">{t.legalAll}</option>
  <option value="sohong">{t.legalSoHong}</option>
  <option value="hopdong">{t.legalHopdong}</option>
  <option value="dangcho">{t.legalDangcho}</option>
</select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={searchParams.hasParking} onChange={(e) => setSearchParams({...searchParams, hasParking: e.target.checked})} className="w-5 h-5 text-sky-500 rounded" />
                  <span className="text-sm font-medium">🚗 {t.hasParking}</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={searchParams.hasPool} onChange={(e) => setSearchParams({...searchParams, hasPool: e.target.checked})} className="w-5 h-5 text-sky-500 rounded" />
                  <span className="text-sm font-medium">🏊 {t.hasPool}</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🛣️ {t.streetWidth}</label>
                <input type="number" value={searchParams.streetWidthMin} onChange={(e) => setSearchParams({...searchParams, streetWidthMin: e.target.value})} placeholder="4" className="w-full px-3 py-2.5 border rounded-lg" />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-bold text-orange-600 mb-1">🔥 {t.keywords}</label>
              <p className="text-xs text-gray-500 mb-3">{t.keywordsDesc}</p>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-orange-200">
                  <button
                    type="button"
                    onClick={() => {
                      const allKeywords = urgentKeywords.map(kw => kw[language]);
                      const allSelected = allKeywords.every(kw => searchParams.keywords.includes(kw));
                      setSearchParams({
                        ...searchParams,
                        keywords: allSelected ? [] : allKeywords
                      });
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold text-sm shadow"
                  >
                    {urgentKeywords.map(kw => kw[language]).every(kw => searchParams.keywords.includes(kw)) 
                      ? (language === 'vn' ? '❌ Bỏ chọn tất cả' : language === 'fr' ? '❌ Tout désélectionner' : '❌ Deselect All')
                      : (language === 'vn' ? '✅ Chọn tất cả' : language === 'fr' ? '✅ Tout sélectionner' : '✅ Select All')}
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-orange-300">
                    <input 
                      type="checkbox" 
                      checked={searchParams.keywordsOnly || false} 
                      onChange={(e) => setSearchParams({...searchParams, keywordsOnly: e.target.checked})} 
                      className="w-4 h-4 text-orange-500 rounded" 
                    />
                    <span className="text-sm font-medium text-orange-700">
                      {language === 'vn' ? '🎯 Chỉ kết quả có từ khóa' : language === 'fr' ? '🎯 Uniquement avec mots-clés' : '🎯 Only with keywords'}
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {urgentKeywords.map((kw, i) => (
                    <button key={i} onClick={() => toggleKeyword(kw)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${searchParams.keywords.includes(kw[language]) ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border border-orange-300'}`}>
                      {kw[language]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t bg-sky-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div>
                <p className="text-sm font-semibold text-sky-700">⚠️ {t.required}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCurrentSearch} disabled={!searchParams.city || !searchParams.propertyType || !searchParams.priceMax} className="px-4 py-3 bg-slate-200 text-gray-700 rounded-lg font-medium disabled:opacity-50">
                  ⭐ {t.saveSearch}
                </button>
                <button onClick={handleSearch} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg disabled:opacity-50">
                  {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                  {loading ? t.loading : t.search}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!showSearch && (
        <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Database Stats Dashboard */}
           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-4 mb-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                {t.dbStatsTitle} {dbStats?.global?.city && `- ${dbStats.global.city}`}
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={statsCategory}
                  onChange={(e) => {
                    setStatsCategory(e.target.value);
                    loadDbStats(searchParams.city, e.target.value);
                  }}
                  className="px-2 py-1 text-sm border border-indigo-200 rounded-lg bg-white"
                >
                  <option value="">{t.statsCatAll}</option>
<option value="apartment">{t.statsCatApartment}</option>
<option value="house">{t.statsCatHouse}</option>
<option value="commercial">{t.statsCatCommercial}</option>
<option value="land">{t.statsCatLand}</option>
                </select>
                <button 
                  onClick={() => { 
                    loadDbStats(searchParams.city, statsCategory);
                    setShowDbStats(!showDbStats);
                  }}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200"
                >
                  {showDbStats ? t.dbStatsHide : t.dbStatsShowMore}
                </button>
              </div>
            </div>
                 
                        
              {dbStats && showDbStats && (
                <>
                  {/* Global Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-indigo-600">{dbStats.global?.totalListings || 0}</p>
                      <p className="text-xs text-gray-500">{t.dbStatsTotal}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-purple-600">{dbStats.global?.totalDistricts || 0}</p>
                      <p className="text-xs text-gray-500">{t.dbStatsDistricts}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-sky-600">{dbStats.global?.avgPricePerM2 ? `${Math.round(dbStats.global.avgPricePerM2 / 1000000)} tr` : '-'}</p>
                      <p className="text-xs text-gray-500">{t.dbStatsAvgPrice}</p>
                    </div>
                {/* Total en base */}
              <div className="text-center text-sm text-gray-500 mt-2">
                📦 Total en base: <span className="font-bold text-indigo-600">{dbStats.global?.totalInDatabase || 0}</span> annonces
              </div>
                  </div>
                  
                  {/* District Stats Table */}
                  {dbStats.districts && dbStats.districts.length > 0 && (
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <table className="w-full text-sm">
                        <thead className="bg-indigo-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-indigo-800">District</th>
                            <th className="px-3 py-2 text-right font-medium text-indigo-800">#</th>
                            <th className="px-3 py-2 text-right font-medium text-indigo-800">{t.dbStatsAvgPrice}</th>
                            <th className="px-3 py-2 text-right font-medium text-indigo-800">{t.dbStatsTrend}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbStats.districts.slice(0, 10).map((d, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="px-3 py-2 font-medium">{d.district}</td>
                              <td className="px-3 py-2 text-right">
                                {d.count}
                                {d.newThisWeek > 0 && (
                                  <span className="ml-1 text-xs text-green-600">(+{d.newThisWeek})</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-sky-600">{d.avgPricePerM2Display}</td>
                              <td className="px-3 py-2 text-right">
                                {d.priceTrend === 'up' && <span className="text-red-500">{t.dbStatsTrendUp} {d.priceTrendPercent}%</span>}
                                {d.priceTrend === 'down' && <span className="text-green-500">{t.dbStatsTrendDown} {Math.abs(d.priceTrendPercent)}%</span>}
                                {d.priceTrend === 'stable' && <span className="text-gray-500">{t.dbStatsTrendStable}</span>}
                                {!d.priceTrend && <span className="text-gray-300">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-16 h-16 text-sky-500 animate-spin mb-4" />
              <p className="text-xl text-gray-600">{t.loading}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {stats && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold">{results.length} {t.results}</h2>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
                        <option value="score">{t.sortScore}</option>
                        <option value="priceAsc">{t.sortPriceAsc}</option>
                        <option value="priceDesc">{t.sortPriceDesc}</option>
                      </select>
                    </div>
                    <button onClick={exportToExcel} className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {t.export}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-sky-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">{t.lowestPrice}</p>
                      <p className="text-2xl font-bold text-sky-600">{formatPrice(stats.lowestPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t.highestPrice}</p>
                      <p className="text-2xl font-bold text-sky-600">{formatPrice(stats.highestPrice)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortResults(results).map((prop) => (
                  <div key={prop.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="relative h-48 bg-slate-200">
                   {prop.imageUrl ? (
  <img 
    src={prop.imageUrl} 
    alt={prop.title} 
    className="w-full h-full object-cover"
    onError={(e) => { 
      e.target.onerror = null; 
      e.target.src = 'https://via.placeholder.com/400x300/0066cc/ffffff?text=BDS'; 
    }}
  />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
    <div className="text-center text-white">
      <div className="text-4xl mb-2">🏠</div>
      <div className="text-sm font-medium">{prop.source}</div>
    </div>
  </div>
)}

                      {prop.isNew && <div className="absolute top-2 left-2 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t.newListing}</div>}
                      {prop.urgentKeywords && prop.urgentKeywords.length > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          🔥 {prop.urgentKeywords[0]}
                        </div>
                      )}
                      {prop.legalStatus && <div className="absolute bottom-2 left-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">📋 {prop.legalStatus}</div>}
                      <div className="absolute bottom-2 right-2 bg-sky-500 text-white px-2 py-1 rounded text-xs font-bold shadow">
                        {prop.source}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{prop.title}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(prop.price)}</p>
                        {prop.pricePerSqm > 0 && <p className="text-sm text-gray-500">{formatPrice(prop.pricePerSqm)}/m²</p>}
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600">{t.score}</span>
                          <span className="text-sm font-bold">{prop.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${prop.score}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>📐 {prop.floorArea || '?'}m²</div>
                        <div>🛏️ {prop.bedrooms || '?'} ch.</div>
                      </div>
                      <div 
                        className="flex items-start gap-2 text-sm text-gray-700 mb-3 cursor-pointer hover:text-sky-600 bg-slate-50 p-2 rounded-lg" 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.address || prop.district + ' ' + prop.city)}`, '_blank')}
                      >
                        <MapPin className="w-4 h-4 mt-0.5 text-sky-500 flex-shrink-0" />
                        <span className="line-clamp-2">{prop.address || `${prop.district}${prop.district ? ', ' : ''}${prop.city}`}</span>
                      </div>
                      {prop.postedOn && (
                        <div className="text-xs text-gray-500 mb-2">📅 {prop.postedOn}</div>
                      )}
                      <a 
                        href={prop.url} 
                        onClick={(e) => { e.preventDefault(); setSelectedProperty(prop); }}
                        onAuxClick={(e) => { if (e.button === 1) window.open(prop.url, '_blank'); }}
                        className="block w-full px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 font-medium text-center cursor-pointer"
                      >
                        {t.viewDetails}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">{t.noResults}</p>
            </div>
          )}
        </div>
      )}

      {/* Property Analysis Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">📊 {t.propertyDetails}</h2>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-slate-100 rounded-full text-xl">✕</button>
            </div>
            
            {/* Image */}
            <div className="relative h-48 md:h-64 bg-slate-200">
              <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover" />
              {selectedProperty.urgentKeywords && selectedProperty.urgentKeywords.length > 0 && (
                <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🔥 {selectedProperty.urgentKeywords[0]}
                </div>
              )}
             <div className={`absolute bottom-3 left-3 px-3 py-1 rounded text-sm font-medium ${
                selectedProperty.source === 'chotot.com' ? 'bg-green-500 text-white' :
                selectedProperty.source === 'batdongsan.com.vn' ? 'bg-blue-500 text-white' :
                selectedProperty.source === 'nhadat247.com.vn' ? 'bg-purple-500 text-white' :
                'bg-black bg-opacity-70 text-white'
              }`}>
                {selectedProperty.source}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Title & Price */}
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedProperty.title}</h3>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-sky-600">{formatPrice(selectedProperty.price)}</p>
                  {selectedProperty.pricePerSqm > 0 && (
                    <p className="text-lg text-gray-500">{formatPrice(selectedProperty.pricePerSqm)}/m²</p>
                  )}
                </div>
              </div>
              
              {/* NEGOTIATION SCORE */}
              <div className={`p-5 rounded-xl border-2 ${
                selectedProperty.negotiationLevel === 'excellent' ? 'bg-green-50 border-green-300' :
                selectedProperty.negotiationLevel === 'good' ? 'bg-sky-50 border-sky-300' :
                selectedProperty.negotiationLevel === 'moderate' ? 'bg-yellow-50 border-yellow-300' :
                'bg-slate-50 border-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl font-bold ${
                      selectedProperty.negotiationLevel === 'excellent' ? 'text-green-600' :
                      selectedProperty.negotiationLevel === 'good' ? 'text-sky-600' :
                      selectedProperty.negotiationLevel === 'moderate' ? 'text-yellow-600' :
                      'text-slate-600'
                    }`}>
                      {selectedProperty.score}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{t.negotiationScore}</p>
                      <p className={`text-sm font-medium ${
                        selectedProperty.negotiationLevel === 'excellent' ? 'text-green-600' :
                        selectedProperty.negotiationLevel === 'good' ? 'text-sky-600' :
                        selectedProperty.negotiationLevel === 'moderate' ? 'text-yellow-600' :
                        'text-slate-600'
                      }`}>
                        {selectedProperty.negotiationLevel === 'excellent' ? t.negotiationExcellent :
                         selectedProperty.negotiationLevel === 'good' ? t.negotiationGood :
                         selectedProperty.negotiationLevel === 'moderate' ? t.negotiationModerate :
                         t.negotiationLow}
                      </p>
                    </div>
                  </div>
                  <div className="text-5xl">
                    {selectedProperty.negotiationLevel === 'excellent' ? '🎯' :
                     selectedProperty.negotiationLevel === 'good' ? '👍' :
                     selectedProperty.negotiationLevel === 'moderate' ? '🤔' : '😐'}
                  </div>
                </div>
                
                {/* Score bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      selectedProperty.negotiationLevel === 'excellent' ? 'bg-green-500' :
                      selectedProperty.negotiationLevel === 'good' ? 'bg-sky-500' :
                      selectedProperty.negotiationLevel === 'moderate' ? 'bg-yellow-500' :
                      'bg-slate-400'
                    }`} 
                    style={{ width: `${selectedProperty.score}%` }} 
                  />
                </div>
                
                {/* Détails du score */}
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-700 mb-2">{t.whyThisScore}</p>
                  
                  {selectedProperty.urgentKeywords && selectedProperty.urgentKeywords.length > 0 && (
                    <div className="flex items-center gap-2 text-orange-700 bg-orange-100 px-3 py-2 rounded-lg">
                      <span>🔥</span>
                      <span className="font-medium">{t.urgentKeywordsFound}:</span>
                      <span>{selectedProperty.urgentKeywords.join(', ')}</span>
                      <span className="ml-auto font-bold">+25</span>
                    </div>
                  )}
                 {selectedProperty.legalStatus ? (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    selectedProperty.legalStatus === 'Sổ đỏ/Sổ hồng' ? 'bg-green-100 text-green-700' :
                    selectedProperty.legalStatus === 'Hợp đồng mua bán' ? 'bg-blue-100 text-blue-700' :
                    selectedProperty.legalStatus === 'Đang chờ sổ' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    <span>📋</span>
                    <span className="font-medium">{selectedProperty.legalStatus}</span>
                    <span className="ml-auto font-bold">
                      {selectedProperty.legalStatus === 'Sổ đỏ/Sổ hồng' ? '+15' :
                       selectedProperty.legalStatus === 'Hợp đồng mua bán' ? '+8' :
                       selectedProperty.legalStatus === 'Đang chờ sổ' ? '+3' : ''}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600">
                    <span>⚠️</span>
                    <span className="font-medium">Statut légal non précisé</span>
                    <span className="ml-auto font-bold">+0</span>
                  </div>
                )}
                            {selectedProperty.negotiationDetails?.priceAnalysis && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      selectedProperty.negotiationDetails.priceAnalysis.diffPercent > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      <span>💰</span>
                      <span>{t.priceAnalysis}:</span>
                      <span className="font-medium">
                        {selectedProperty.negotiationDetails.priceAnalysis.diffPercent > 0 ? (
                          <>{selectedProperty.negotiationDetails.priceAnalysis.diffPercent}% {t.belowAverage}</>
                        ) : (
                          <>{Math.abs(selectedProperty.negotiationDetails.priceAnalysis.diffPercent)}% {t.aboveAverage}</>
                        )}
                      </span>
                      {selectedProperty.negotiationDetails.priceAnalysis.diffPercent > 0 && (
                        <span className="ml-auto font-bold">+{selectedProperty.negotiationDetails.priceAnalysis.diffPercent >= 20 ? 25 : selectedProperty.negotiationDetails.priceAnalysis.diffPercent >= 10 ? 20 : 10}</span>
                      )}
                    </div>
                  )}
                  
                  {selectedProperty.daysOnline > 14 && (
                    <div className="flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-2 rounded-lg">
                      <span>📅</span>
                      <span>{t.listingOld}:</span>
                      <span className="font-medium">{selectedProperty.daysOnline} {t.daysOnline}</span>
                      <span className="ml-auto font-bold">+{selectedProperty.daysOnline > 60 ? 20 : selectedProperty.daysOnline > 30 ? 15 : 5}</span>
                    </div>
                  )}
                  
                  {selectedProperty.negotiationDetails?.photoAnalysis?.verdict !== 'good' && (
                    <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg">
                      <span>📷</span>
                      <span>{t.fewPhotos}</span>
                      <span className="ml-auto font-bold">+{selectedProperty.negotiationDetails?.photoAnalysis?.verdict === 'none' ? 10 : 5}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Property Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-sky-600">{Math.round(selectedProperty.floorArea) || '?'}</p>
                  <p className="text-sm text-gray-600">m²</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-sky-600">{selectedProperty.bedrooms || '-'}</p>
                  <p className="text-sm text-gray-600">{t.rooms}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-sky-600">{selectedProperty.bathrooms || '-'}</p>
                  <p className="text-sm text-gray-600">{t.bathrooms}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-sky-600">{selectedProperty.daysOnline || '?'}</p>
                  <p className="text-sm text-gray-600">{t.daysOnline}</p>
                </div>
              </div>
              
              {/* Infos supplémentaires */}
              {(selectedProperty.direction || selectedProperty.floors || selectedProperty.streetWidth || selectedProperty.facadeWidth || selectedProperty.furnishing) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  {selectedProperty.direction && (
                    <div className="bg-amber-50 p-3 rounded-lg text-center">
                      <p className="text-lg font-bold text-amber-600">🧭 {selectedProperty.direction}</p>
                      <p className="text-xs text-gray-600">Hướng</p>
                    </div>
                  )}
                  {selectedProperty.floors && (
                    <div className="bg-indigo-50 p-3 rounded-lg text-center">
                      <p className="text-lg font-bold text-indigo-600">🏢 {selectedProperty.floors}</p>
                      <p className="text-xs text-gray-600">Tầng</p>
                    </div>
                  )}
                  {selectedProperty.streetWidth && (
                    <div className={`p-3 rounded-lg text-center ${selectedProperty.streetWidth < 3 ? 'bg-red-50' : 'bg-green-50'}`}>
                      <p className={`text-lg font-bold ${selectedProperty.streetWidth < 3 ? 'text-red-600' : 'text-green-600'}`}>🛣️ {selectedProperty.streetWidth}m</p>
                      <p className="text-xs text-gray-600">Đường rộng</p>
                    </div>
                  )}
                  {selectedProperty.facadeWidth && (
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-lg font-bold text-blue-600">📐 {selectedProperty.facadeWidth}m</p>
                      <p className="text-xs text-gray-600">Mặt tiền</p>
                    </div>
                  )}
                  {selectedProperty.furnishing && (
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-lg font-bold text-purple-600">🛋️</p>
                      <p className="text-xs text-gray-600">{selectedProperty.furnishing}</p>
                    </div>
                  )}
                </div>
              )}
              {/* Détections NLP - Opportunités & Risques */}
{/* Détections NLP - Opportunités & Risques */}
{(selectedProperty.detectedKeywords?.length > 0 || selectedProperty.hasMetroNearby || selectedProperty.hasNewRoad || selectedProperty.hasInvestmentPotential || selectedProperty.hasLegalIssue || selectedProperty.hasPlanningRisk) && (
  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border">
    <p className="text-sm font-bold text-gray-700 mb-3">🔍 {t.nlpAnalysisTitle || 'Analyse automatique du texte'}</p>
    
    {/* Opportunités */}
    {(selectedProperty.hasMetroNearby || selectedProperty.hasNewRoad || selectedProperty.hasInvestmentPotential) && (
      <div className="mb-3">
        <p className="text-xs text-green-600 font-medium mb-2">✅ {t.nlpOpportunities || 'Opportunités détectées'}</p>
        <div className="flex flex-wrap gap-2">
          {selectedProperty.hasMetroNearby && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">🚇 {t.nlpMetro || 'Gần Metro'}</span>
          )}
          {selectedProperty.hasNewRoad && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">🛣️ {t.nlpNewRoad || 'Sắp mở đường'}</span>
          )}
          {selectedProperty.hasInvestmentPotential && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">📈 {t.nlpInvestment || 'Tiềm năng đầu tư'}</span>
          )}
        </div>
      </div>
    )}
    
    {/* Risques */}
    {(selectedProperty.hasLegalIssue || selectedProperty.hasPlanningRisk) && (
      <div className="mb-3">
        <p className="text-xs text-red-600 font-medium mb-2">⚠️ {t.nlpRisks || 'Risques détectés'}</p>
        <div className="flex flex-wrap gap-2">
          {selectedProperty.hasLegalIssue && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">⚠️ {t.nlpNoTitle || 'Chưa có sổ'}</span>
          )}
          {selectedProperty.hasPlanningRisk && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">🚨 {t.nlpPlanningRisk || 'Rủi ro quy hoạch'}</span>
          )}
        </div>
      </div>
    )}

    {/* Revenu locatif */}
    {selectedProperty.extractedRentalIncome && (
      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-600 font-medium">💰 {t.nlpRentalIncome || 'Revenu locatif mentionné'}</p>
        <p className="text-lg font-bold text-blue-700">{(selectedProperty.extractedRentalIncome / 1000000).toFixed(0)} triệu/tháng</p>
        {selectedProperty.price > 0 && (
          <p className="text-xs text-blue-500">
            {t.nlpGrossYield || 'Rendement brut'}: {((selectedProperty.extractedRentalIncome * 12 / selectedProperty.price) * 100).toFixed(1)}%/an
          </p>
        )}
      </div>
    )}

    {/* Mots-clés physiques uniquement (sans doublons opportunités/risques) */}
    {selectedProperty.detectedKeywords?.filter(kw => 
      !kw.includes('Metro') && !kw.includes('đường') && !kw.includes('đầu tư') && 
      !kw.includes('sổ') && !kw.includes('quy hoạch')
    ).length > 0 && (
      <div>
        <p className="text-xs text-gray-500 mb-2">{t.nlpExtractedInfo || 'Infos extraites'}:</p>
        <div className="flex flex-wrap gap-1">
          {selectedProperty.detectedKeywords
            .filter(kw => !kw.includes('Metro') && !kw.includes('đường') && !kw.includes('đầu tư') && !kw.includes('sổ') && !kw.includes('quy hoạch'))
            .map((kw, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">{kw}</span>
            ))}
        </div>
      </div>
    )}
  </div>
)}
              {/* Address */}
              {(selectedProperty.address || selectedProperty.district) && (
                <div 
                  className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address || selectedProperty.district + ' ' + selectedProperty.city)}`, '_blank')}
                >
                  <MapPin className="w-5 h-5 text-sky-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedProperty.address || `${selectedProperty.district}, ${selectedProperty.city}`}</p>
                    <p className="text-sm text-sky-600">{t.viewOnMap} →</p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button 
                  onClick={() => window.open(selectedProperty.url, '_blank')} 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-bold hover:from-blue-600 hover:to-sky-500 transition"
                >
                  {t.viewOriginal} →
                </button>
                <button 
                  onClick={() => setSelectedProperty(null)} 
                  className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
