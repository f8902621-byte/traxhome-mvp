import { useState } from 'react';
import { useRouter } from 'next/router';
import { Search, TrendingUp, Clock, Shield, ChevronRight, Globe, CheckCircle, Zap, Users, BarChart3 } from 'lucide-react';

export default function Landing() {
  const [language, setLanguage] = useState('vn');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const t = {
    vn: {
      // Header
      tagline: 'Nền tảng Tìm kiếm BĐS Thông minh',
      login: 'Đăng nhập',
      
      // Hero
      heroTitle: 'Tìm kiếm BĐS trên',
      heroHighlight: '85% thị trường',
      heroSubtitle: 'Việt Nam',
      heroDesc: 'Traxhome tổng hợp dữ liệu từ nhiều nguồn uy tín, giúp môi giới tiết kiệm thời gian và không bỏ lỡ cơ hội.',
      tryBeta: 'Dùng thử miễn phí',
      learnMore: 'Tìm hiểu thêm',
      
      // Stats
      statSources: 'Nguồn dữ liệu',
      statListings: 'Tin đăng mỗi ngày',
      statCoverage: 'Độ phủ thị trường',
      statCities: 'Tỉnh thành',
      
      // Sources
      sourcesTitle: 'Dữ liệu từ các nguồn hàng đầu',
      sourcesDesc: 'Tự động tổng hợp và cập nhật liên tục',
      sourceActive: 'Đang hoạt động',
      sourceComingSoon: 'Sắp ra mắt',
      
      // Benefits
      benefitsTitle: 'Tại sao Môi giới chọn Traxhome?',
      benefitsDesc: 'Công cụ được thiết kế dành riêng cho chuyên gia BĐS',
      
      benefit1Title: 'Tiết kiệm 80% thời gian',
      benefit1Desc: 'Không cần mở từng trang web. Tất cả tin đăng ở một nơi, lọc theo tiêu chí của bạn.',
      
      benefit2Title: 'Phát hiện cơ hội',
      benefit2Desc: 'AI phát hiện từ khóa "bán gấp", "kẹt tiền" - những cơ hội đàm phán tốt nhất.',
      
      benefit3Title: 'Dữ liệu tin cậy',
      benefit3Desc: 'Tự động loại bỏ tin trùng, xác minh thông tin, hiển thị trạng thái pháp lý.',
      
      benefit4Title: 'Cập nhật realtime',
      benefit4Desc: 'Nhận thông báo khi có tin mới phù hợp. Luôn đi trước đối thủ.',
      
      // How it works
      howTitle: 'Cách hoạt động',
      howDesc: 'Đơn giản như 1-2-3',
      
      step1Title: 'Chọn tiêu chí',
      step1Desc: 'Thành phố, loại BĐS, ngân sách, diện tích...',
      
      step2Title: 'Traxhome tìm kiếm',
      step2Desc: 'Quét tất cả nguồn dữ liệu trong vài giây',
      
      step3Title: 'Xem kết quả',
      step3Desc: 'Danh sách được sắp xếp, lọc sẵn, sẵn sàng liên hệ',
      
      // CTA
      ctaTitle: 'Sẵn sàng thử nghiệm?',
      ctaDesc: 'Tham gia chương trình Beta miễn phí cho Môi giới BĐS',
      ctaPlaceholder: 'Email của bạn',
      ctaButton: 'Đăng ký Beta',
      ctaSuccess: 'Cảm ơn! Chúng tôi sẽ liên hệ sớm.',
      ctaDirect: 'Hoặc dùng thử ngay',
      
      // Footer
      footerDesc: 'Nền tảng tìm kiếm BĐS thông minh cho thị trường Việt Nam',
      footerContact: 'Liên hệ',
      footerPrivacy: 'Bảo mật',
      footerTerms: 'Điều khoản',
      copyright: '© 2024 Traxhome. Đang phát triển.',
    },
    en: {
      // Header
      tagline: 'Smart Real Estate Search Platform',
      login: 'Login',
      
      // Hero
      heroTitle: 'Search properties across',
      heroHighlight: '85% of the market',
      heroSubtitle: 'in Vietnam',
      heroDesc: 'Traxhome aggregates data from multiple trusted sources, helping agents save time and never miss an opportunity.',
      tryBeta: 'Try for free',
      learnMore: 'Learn more',
      
      // Stats
      statSources: 'Data sources',
      statListings: 'Listings per day',
      statCoverage: 'Market coverage',
      statCities: 'Provinces',
      
      // Sources
      sourcesTitle: 'Data from leading sources',
      sourcesDesc: 'Automatically aggregated and continuously updated',
      sourceActive: 'Active',
      sourceComingSoon: 'Coming soon',
      
      // Benefits
      benefitsTitle: 'Why Agents choose Traxhome?',
      benefitsDesc: 'Tools designed specifically for real estate professionals',
      
      benefit1Title: 'Save 80% of your time',
      benefit1Desc: 'No need to browse multiple websites. All listings in one place, filtered by your criteria.',
      
      benefit2Title: 'Spot opportunities',
      benefit2Desc: 'AI detects "urgent sale", "need cash" keywords - the best negotiation opportunities.',
      
      benefit3Title: 'Reliable data',
      benefit3Desc: 'Automatic duplicate removal, verified information, legal status displayed.',
      
      benefit4Title: 'Real-time updates',
      benefit4Desc: 'Get notified when new matching listings appear. Always stay ahead.',
      
      // How it works
      howTitle: 'How it works',
      howDesc: 'Simple as 1-2-3',
      
      step1Title: 'Set criteria',
      step1Desc: 'City, property type, budget, area...',
      
      step2Title: 'Traxhome searches',
      step2Desc: 'Scans all data sources in seconds',
      
      step3Title: 'View results',
      step3Desc: 'Sorted, filtered list ready to contact',
      
      // CTA
      ctaTitle: 'Ready to try?',
      ctaDesc: 'Join the free Beta program for Real Estate Agents',
      ctaPlaceholder: 'Your email',
      ctaButton: 'Join Beta',
      ctaSuccess: 'Thank you! We\'ll contact you soon.',
      ctaDirect: 'Or try it now',
      
      // Footer
      footerDesc: 'Smart real estate search platform for the Vietnam market',
      footerContact: 'Contact',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms',
      copyright: '© 2024 Traxhome. In development.',
    },
    fr: {
      // Header
      tagline: 'Plateforme de Recherche Immobilière Intelligente',
      login: 'Connexion',
      
      // Hero
      heroTitle: 'Recherchez sur',
      heroHighlight: '85% du marché',
      heroSubtitle: 'immobilier au Vietnam',
      heroDesc: 'Traxhome agrège les données de multiples sources fiables, aidant les agents à gagner du temps et ne jamais manquer une opportunité.',
      tryBeta: 'Essai gratuit',
      learnMore: 'En savoir plus',
      
      // Stats
      statSources: 'Sources de données',
      statListings: 'Annonces par jour',
      statCoverage: 'Couverture marché',
      statCities: 'Provinces',
      
      // Sources
      sourcesTitle: 'Données des sources leaders',
      sourcesDesc: 'Agrégation automatique et mise à jour continue',
      sourceActive: 'Actif',
      sourceComingSoon: 'Bientôt',
      
      // Benefits
      benefitsTitle: 'Pourquoi les Agents choisissent Traxhome?',
      benefitsDesc: 'Outils conçus spécifiquement pour les professionnels immobiliers',
      
      benefit1Title: 'Économisez 80% de temps',
      benefit1Desc: 'Plus besoin de parcourir plusieurs sites. Toutes les annonces au même endroit, filtrées selon vos critères.',
      
      benefit2Title: 'Détectez les opportunités',
      benefit2Desc: 'L\'IA détecte "vente urgente", "besoin d\'argent" - les meilleures opportunités de négociation.',
      
      benefit3Title: 'Données fiables',
      benefit3Desc: 'Suppression automatique des doublons, infos vérifiées, statut légal affiché.',
      
      benefit4Title: 'Mises à jour temps réel',
      benefit4Desc: 'Soyez notifié des nouvelles annonces correspondantes. Gardez l\'avance.',
      
      // How it works
      howTitle: 'Comment ça marche',
      howDesc: 'Simple comme 1-2-3',
      
      step1Title: 'Définir les critères',
      step1Desc: 'Ville, type de bien, budget, surface...',
      
      step2Title: 'Traxhome recherche',
      step2Desc: 'Analyse toutes les sources en quelques secondes',
      
      step3Title: 'Voir les résultats',
      step3Desc: 'Liste triée, filtrée, prête à contacter',
      
      // CTA
      ctaTitle: 'Prêt à essayer?',
      ctaDesc: 'Rejoignez le programme Beta gratuit pour Agents Immobiliers',
      ctaPlaceholder: 'Votre email',
      ctaButton: 'Rejoindre Beta',
      ctaSuccess: 'Merci! Nous vous contacterons bientôt.',
      ctaDirect: 'Ou essayez maintenant',
      
      // Footer
      footerDesc: 'Plateforme de recherche immobilière intelligente pour le marché vietnamien',
      footerContact: 'Contact',
      footerPrivacy: 'Confidentialité',
      footerTerms: 'Conditions',
      copyright: '© 2024 Traxhome. En développement.',
    }
  }[language];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleBetaSignup = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/.netlify/functions/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          language,
          source: 'landing' 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Beta signup error:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sources = [
    { name: 'Batdongsan.com.vn', logo: '🏠', active: true, listings: '500K+' },
    { name: 'Chotot.com', logo: '🛒', active: true, listings: '300K+' },
    { name: 'Nhadat247.com.vn', logo: '🏘️', active: true, listings: '100K+' },
    { name: 'Homedy.com', logo: '🏡', active: false, listings: '50K+' },
    { name: 'Alonhadat.com.vn', logo: '📍', active: false, listings: '80K+' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
              T
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Traxhome</span>
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">BETA</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition cursor-pointer"
            >
              <option value="vn">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
            <button
              onClick={() => router.push('/search')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t.tryBeta}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t.tagline}
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {t.heroTitle}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  {t.heroHighlight}
                </span>{' '}
                {t.heroSubtitle}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.heroDesc}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/search')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-xl shadow-blue-600/30 flex items-center gap-2 text-lg"
                >
                  {t.tryBeta}
                  <ChevronRight className="w-5 h-5" />
                </button>
                <a
                  href="#benefits"
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition border border-gray-200 flex items-center gap-2"
                >
                  {t.learnMore}
                </a>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">3+</p>
                <p className="text-gray-500">{t.statSources}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">10K+</p>
                <p className="text-gray-500">{t.statListings}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">85%</p>
                <p className="text-gray-500">{t.statCoverage}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">12+</p>
                <p className="text-gray-500">{t.statCities}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources Section */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.sourcesTitle}</h2>
            <p className="text-gray-500">{t.sourcesDesc}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {sources.map((source, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition ${
                  source.active
                    ? 'bg-white border-gray-200 shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <span className="text-2xl">{source.logo}</span>
                <div>
                  <p className="font-semibold text-gray-900">{source.name}</p>
                  <p className="text-xs text-gray-500">
                    {source.active ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {t.sourceActive}
                      </span>
                    ) : (
                      <span className="text-gray-400">{t.sourceComingSoon}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.benefitsTitle}</h2>
            <p className="text-gray-500 text-lg">{t.benefitsDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.benefit1Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.benefit1Desc}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.benefit2Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.benefit2Desc}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.benefit3Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.benefit3Desc}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.benefit4Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.benefit4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.howTitle}</h2>
            <p className="text-gray-500 text-lg">{t.howDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-xl shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.step1Title}</h3>
              <p className="text-gray-500">{t.step1Desc}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-xl shadow-blue-600/30">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.step2Title}</h3>
              <p className="text-gray-500">{t.step2Desc}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-xl shadow-blue-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.step3Title}</h3>
              <p className="text-gray-500">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Beta Program
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
          <p className="text-blue-100 text-lg mb-8">{t.ctaDesc}</p>
          
          {submitted ? (
            <div className="bg-white/20 backdrop-blur rounded-xl p-6">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-white font-medium">{t.ctaSuccess}</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleBetaSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.ctaPlaceholder}
                  className="flex-1 px-5 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '...' : t.ctaButton}
                </button>
              </form>
              {submitError && (
                <p className="text-red-200 text-sm mb-4">{submitError}</p>
              )}
            </>
          )}
          
          <div className="flex items-center justify-center gap-2 text-blue-200">
            <span>{t.ctaDirect}</span>
            <button
              onClick={() => router.push('/search')}
              className="text-white font-semibold underline hover:no-underline"
            >
              {t.tryBeta} →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                T
              </div>
              <div>
                <span className="text-white font-bold">Traxhome</span>
                <p className="text-sm">{t.footerDesc}</p>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="mailto:contact@traxhome.vn" className="hover:text-white transition">{t.footerContact}</a>
              <a href="#" className="hover:text-white transition">{t.footerPrivacy}</a>
              <a href="#" className="hover:text-white transition">{t.footerTerms}</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            {t.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
