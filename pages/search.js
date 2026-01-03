</div>

            {/* Mode Buy/Sell */}
            <div className="flex gap-4">
              <button onClick={() => setMode('buy')} className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${mode === 'buy' ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-gray-700'}`}>
                🏠 {t.buy}
              </button>
              <button onClick={() => setMode('sell')} className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${mode === 'sell' ? 'bg-orange-400 text-white shadow-md' : 'bg-slate-100 text-gray-700'}`}>
                💰 {t.sell}
              </button>
            </div>

            {/* Location & Type */}
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">📍 {language === 'vn' ? 'Vị trí & Loại BDS' : language === 'fr' ? 'Localisation & Type' : 'Location & Type'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.city} <span className="text-orange-500">*</span></label>
                  <select value={searchParams.city} onChange={(e) => setSearchParams({...searchParams, city: e.target.value, district: ''})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400">
                    <option value="">{t.selectCity}</option>
                    {vietnamCities.map((c, i) => <option key={i} value={c.vn}>{c[language]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.district}</label>
                  <select value={searchParams.district} onChange={(e) => setSearchParams({...searchParams, district: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200" disabled={!searchParams.city}>
                    <option value="">{t.allDistricts}</option>
                    {currentDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.propertyType} <span className="text-orange-500">*</span></label>
                  <select value={searchParams.propertyType} onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200">
                    <option value="">{t.selectType}</option>
                    {propertyTypes.map((pt, i) => <option key={i} value={pt.vn}>{pt[language]}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Price & Features */}
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">💰 {language === 'vn' ? 'Giá & Tính năng' : language === 'fr' ? 'Prix & Caractéristiques' : 'Price & Features'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.priceMin}</label>
                  <div className="relative">
                    <input type="number" step="0.1" value={searchParams.priceMin} onChange={(e) => setSearchParams({...searchParams, priceMin: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg pr-12 focus:ring-2 focus:ring-sky-200" placeholder="0" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{getPriceUnit()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.priceMax} <span className="text-orange-500">*</span></label>
                  <div className="relative">
                    <input type="number" step="0.1" value={searchParams.priceMax} onChange={(e) => setSearchParams({...searchParams, priceMax: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg pr-12 focus:ring-2 focus:ring-sky-200" placeholder="10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{getPriceUnit()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.livingArea}</label>
                  <div className="flex gap-2">
                    <input type="number" value={searchParams.livingAreaMin} onChange={(e) => setSearchParams({...searchParams, livingAreaMin: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200" placeholder={t.min} />
                    <input type="number" value={searchParams.livingAreaMax} onChange={(e) => setSearchParams({...searchParams, livingAreaMax: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200" placeholder={t.max} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.bedrooms}</label>
                  <input type="number" value={searchParams.bedrooms} onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200" placeholder="2" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🚿 {t.bathrooms}</label>
                  <input type="number" value={searchParams.bathrooms} onChange={(e) => setSearchParams({...searchParams, bathrooms: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="1" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.daysListed}</label>
                  <input type="number" value={searchParams.daysListed} onChange={(e) => setSearchParams({...searchParams, daysListed: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.legalStatus}</label>
                  <select value={searchParams.legalStatus} onChange={(e) => setSearchParams({...searchParams, legalStatus: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg">
                    <option value="">{t.legalAll}</option>
                    <option value="sohong">{t.legalSoHong}</option>
                    <option value="sodo">{t.legalSoDo}</option>
                    <option value="none">{t.legalNone}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={searchParams.hasParking} onChange={(e) => setSearchParams({...searchParams, hasParking: e.target.checked})} className="w-5 h-5 text-sky-500 rounded border-slate-300" />
                    <span className="text-sm font-medium text-gray-700">🚗 {t.hasParking}</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={searchParams.hasPool} onChange={(e) => setSearchParams({...searchParams, hasPool: e.target.checked})} className="w-5 h-5 text-sky-500 rounded border-slate-300" />
                    <span className="text-sm font-medium text-gray-700">🏊 {t.hasPool}</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🛣️ {t.streetWidth}</label>
                  <input type="number" value={searchParams.streetWidthMin} onChange={(e) => setSearchParams({...searchParams, streetWidthMin: e.target.value})} placeholder="4" step="0.5" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-bold text-orange-600 mb-1">🔥 {t.keywords}</label>
              <p className="text-xs text-gray-500 mb-3">{t.keywordsDesc}</p>
              <div className="mb-3 flex gap-2">
                <input type="text" value={searchParams.customKeyword} onChange={(e) => setSearchParams({...searchParams, customKeyword: e.target.value})} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg" placeholder={t.customKeywordPlaceholder} />
                <button type="button" onClick={() => {
                  if (searchParams.customKeyword.trim()) {
                    setSearchParams(prev => ({ ...prev, keywords: [...prev.keywords, prev.customKeyword.trim()], customKeyword: '' }));
                  }
                }} className="px-4 py-2.5 bg-orange-400 text-white rounded-lg hover:bg-orange-500 font-bold">+</button>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {urgentKeywords.map((kw, i) => (
                    <button key={i} onClick={() => toggleKeyword(kw)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${searchParams.keywords.includes(kw[language]) ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-50'}`}>
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
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 bg-sky-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div>
                <p className="text-sm font-semibold text-sky-700">⚠️ {language === 'vn' ? 'Trường bắt buộc:' : language === 'fr' ? 'Champs requis:' : 'Required fields:'}</p>
                <p className="text-sm text-sky-600">• {t.city} • {t.propertyType} • {t.priceMax}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCurrentSearch} disabled={!searchParams.city || !searchParams.propertyType || !searchParams.priceMax} className="px-4 py-3 bg-slate-200 text-gray-700 rounded-lg font-medium hover:bg-slate-300 disabled:opacity-50">
                  ⭐ {t.saveSearch}
                </button>
                <button onClick={handleSearch} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-sky-500 disabled:opacity-50 flex items-center gap-2 shadow-lg">
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-16 h-16 text-sky-500 animate-spin mb-4" />
              <p className="text-xl text-gray-600">{t.loading}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {stats && mode === 'buy' && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-800">{results.length} {t.results}</h2>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white">
                        <option value="score">{t.sortScore}</option>
                        <option value="priceAsc">{t.sortPriceAsc}</option>
                        <option value="priceDesc">{t.sortPriceDesc}</option>
                        <option value="dateDesc">{t.sortDateDesc}</option>
                      </select>
                    </div>
                    <button onClick={exportToExcel} className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg flex items-center gap-2 hover:bg-teal-200 font-medium">
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
                  <div key={prop.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-100">
                    <div className="relative h-48 bg-slate-200 cursor-pointer" onMouseEnter={() => setExpandedPhoto(prop.id)} onMouseLeave={() => setExpandedPhoto(null)}>
                      <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                      {prop.isNew && <div className="absolute top-2 left-2 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold">{t.newListing}</div>}
                      {prop.hasUrgentKeyword && <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t.urgentSale}</div>}
                      {prop.legalStatus && <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">📋 {prop.legalStatus}</div>}
                      <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold ${prop.source === 'batdongsan.com.vn' ? 'bg-slate-700 text-white' : prop.source === 'chotot.com' ? 'bg-slate-600 text-white' : 'bg-slate-500 text-white'}`}>
                        {prop.source === 'batdongsan.com.vn' ? 'BĐS' : prop.source === 'chotot.com' ? 'Chợ Tốt' : prop.source}
                      </div>
                      {expandedPhoto === prop.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10 p-4">
                          <img src={prop.imageUrl} alt={prop.title} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 truncate text-gray-800">{prop.title}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(prop.price)}</p>
                        <p className="text-sm text-gray-500">{formatPrice(prop.pricePerSqm)}/m²</p>
                      </div>

                      {prop.urgentKeywords && prop.urgentKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {prop.urgentKeywords.map((keyword, idx) => (
                            <span key={idx} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">🔥 {keyword}</span>
                          ))}
                        </div>
                      )}

                      {prop.description && (
                        <div className="bg-slate-50 rounded p-2 mb-2 max-h-20 overflow-y-auto">
                          <p className="text-xs text-gray-600 line-clamp-3">{prop.description.substring(0, 200)}...</p>
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600">{t.score}</span>
                          <span className="text-sm font-bold text-gray-700">{prop.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${prop.score}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>📐 {prop.floorArea}m²</div>
                        <div>🛏️ {prop.bedrooms} ch.</div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {prop.hasParking && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">🚗 Parking</span>}
                        {prop.hasPool && <span className="bg-sky-100 text-sky-600 px-2 py-0.5 rounded text-xs">🏊 Piscine</span>}
                        {prop.bathrooms && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">🚿 {prop.bathrooms} WC</span>}
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-3 cursor-pointer hover:text-sky-600" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.address)}`, '_blank')}>
                        <MapPin className="w-4 h-4 mt-0.5 text-sky-500" />
                        <span className="line-clamp-2">{prop.address}, {prop.city}</span>
                      </div>

                      {prop.latitude && prop.longitude && (
                        <a href={`https://www.google.com/maps?q=${prop.latitude},${prop.longitude}`} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-center block mb-2 font-medium">
                          🗺️ Google Maps
                        </a>
                      )}
                      <button onClick={() => setSelectedProperty(prop)} className="w-full px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 font-medium">
                        {t.viewDetails}
                      </button>
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

      {/* Property Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{t.propertyDetails}</h2>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-slate-100 rounded-full text-gray-500">✕</button>
            </div>
            <div className="relative h-64 md:h-96 bg-slate-200">
              <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover" />
              {selectedProperty.hasUrgentKeyword && <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold animate-pulse">{t.urgentSale}</div>}
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">{selectedProperty.title}</h3>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-sky-600">{formatPrice(selectedProperty.price)}</span>
                  {selectedProperty.pricePerSqm > 0 && <span className="text-lg text-gray-500">{formatPrice(selectedProperty.pricePerSqm)}/m²</span>}
                </div>
              </div>
              <div className="bg-sky-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">{t.score}</span>
                  <span className="font-bold text-lg text-gray-800">{selectedProperty.score}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" style={{ width: `${selectedProperty.score}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-sky-600">{selectedProperty.floorArea}</p>
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
                  <p className="text-2xl font-bold text-sky-600">{selectedProperty.postedOn || '-'}</p>
                  <p className="text-sm text-gray-600">{t.postedOn}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address)}`, '_blank')}>
                <MapPin className="w-6 h-6 text-sky-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">{selectedProperty.address}</p>
                  <p className="text-sm text-sky-600">Voir sur Google Maps →</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button onClick={() => window.open(selectedProperty.url, '_blank')} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-lg font-bold hover:from-blue-600 hover:to-sky-500">{t.viewOriginal}</button>
                <button onClick={() => setSelectedProperty(null)} className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 text-gray-700">{t.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
