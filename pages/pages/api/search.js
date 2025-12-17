export default function handler(req, res) {
  // Empêcher l'exécution pendant la génération statique
  if (!res || typeof res.status !== 'function') {
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, propertyType, priceMax, bedrooms } = req.body;

  // Données de démonstration
  const demoResults = [
    {
      id: 1,
      title: 'Căn hộ cao cấp Quận 1',
      price: 5000000000,
      pricePerSqm: 62500000,
      city: city || 'Hồ Chí Minh',
      district: 'Quận 1',
      address: '123 Nguyễn Huệ',
      floorArea: 80,
      bedrooms: 2,
      imageUrl: 'https://via.placeholder.com/300x200?text=Property+1',
      url: '#',
      score: 95,
      hasUrgentKeyword: true,
      isNew: true
    },
    {
      id: 2,
      title: 'Nhà phố Quận 2',
      price: 8000000000,
      pricePerSqm: 53333333,
      city: city || 'Hồ Chí Minh',
      district: 'Quận 2',
      address: '456 Thảo Điền',
      floorArea: 150,
      bedrooms: 3,
      imageUrl: 'https://via.placeholder.com/300x200?text=Property+2',
      url: '#',
      score: 88,
      hasUrgentKeyword: false,
      isNew: false
    },
    {
      id: 3,
      title: 'Biệt thự Quận 7',
      price: 15000000000,
      pricePerSqm: 50000000,
      city: city || 'Hồ Chí Minh',
      district: 'Quận 7',
      address: '789 Phú Mỹ Hưng',
      floorArea: 300,
      bedrooms: 5,
      imageUrl: 'https://via.placeholder.com/300x200?text=Property+3',
      url: '#',
      score: 75,
      hasUrgentKeyword: true,
      isNew: false
    },
    {
      id: 4,
      title: 'Căn hộ Bình Thạnh',
      price: 3500000000,
      pricePerSqm: 58333333,
      city: city || 'Hồ Chí Minh',
      district: 'Bình Thạnh',
      address: '321 Điện Biên Phủ',
      floorArea: 60,
      bedrooms: 2,
      imageUrl: 'https://via.placeholder.com/300x200?text=Property+4',
      url: '#',
      score: 82,
      hasUrgentKeyword: false,
      isNew: true
    },
    {
      id: 5,
      title: 'Penthouse Quận 3',
      price: 12000000000,
      pricePerSqm: 80000000,
      city: city || 'Hồ Chí Minh',
      district: 'Quận 3',
      address: '555 Võ Văn Tần',
      floorArea: 150,
      bedrooms: 4,
      imageUrl: 'https://via.placeholder.com/300x200?text=Property+5',
      url: '#',
      score: 70,
      hasUrgentKeyword: false,
      isNew: false
    }
  ];

  return res.status(200).json({
    success: true,
    results: demoResults,
    stats: {
      lowestPrice: 3500000000,
      highestPrice: 15000000000,
      totalResults: 5
    }
  });
}
