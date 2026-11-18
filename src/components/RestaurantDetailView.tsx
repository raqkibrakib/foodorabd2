import React, { useMemo, useState } from 'react';
import { ArrowLeft, Clock, Heart, MapPin, Plus, Search, Star, X } from 'lucide-react';
import { formatBdt, calculateCartItemUnitPrice, type CartAddon, type CartItemInput } from '../lib/marketplace-logic';
import { DhakaMapPicker } from './DhakaMapPicker';
import type { FoodItem, Lang, Restaurant, ReviewItem } from '../types/marketplace';

interface RestaurantDetailViewProps {
  restaurant: Restaurant;
  items: FoodItem[];
  reviews: ReviewItem[];
  lang: Lang;
  mapsApiKey: string;
  isFavorited: boolean;
  onToggleFavorite: (restaurantId: number) => void;
  onAddToCart: (item: CartItemInput) => void;
  onBack: () => void;
}

export function RestaurantDetailView({
  restaurant,
  items,
  reviews,
  lang,
  mapsApiKey,
  isFavorited,
  onToggleFavorite,
  onAddToCart,
  onBack,
}: RestaurantDetailViewProps) {
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeFood, setActiveFood] = useState<FoodItem | null>(null);

  // Customization modal state
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<CartAddon[]>([]);
  const [qty, setQty] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ['All', ...cats];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.nameBn.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, selectedCategory, menuSearch]);

  const openFoodModal = (food: FoodItem) => {
    setActiveFood(food);
    setSelectedVariation(food.variationsJson?.[0]?.name || '');
    setSelectedAddons([]);
    setQty(1);
    setSpecialNote('');
  };

  const activeVariationDelta = useMemo(() => {
    if (!activeFood || !selectedVariation) return 0;
    return activeFood.variationsJson.find((v) => v.name === selectedVariation)?.priceDelta ?? 0;
  }, [activeFood, selectedVariation]);

  const modalUnitPrice = activeFood
    ? calculateCartItemUnitPrice({
        basePrice: activeFood.price,
        discountPrice: activeFood.discountPrice,
        variationDelta: activeVariationDelta,
        addons: selectedAddons,
      })
    : 0;

  const handleConfirmAdd = () => {
    if (!activeFood) return;
    onAddToCart({
      foodItemId: activeFood.id,
      restaurantId: restaurant.id,
      name: activeFood.name,
      nameBn: activeFood.nameBn,
      imageUrl: activeFood.imageUrl,
      basePrice: activeFood.price,
      discountPrice: activeFood.discountPrice,
      variationName: selectedVariation || undefined,
      variationDelta: activeVariationDelta,
      addons: selectedAddons,
      quantity: qty,
      specialInstructions: specialNote.trim() || undefined,
    });
    setActiveFood(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#E21B70] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'bn' ? 'সব রেস্টুরেন্টে ফিরে যান' : 'Back to all restaurants'}</span>
      </button>

      {/* Restaurant Hero Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 relative h-56 lg:h-auto min-h-[220px] bg-neutral-100">
            <img
              src={restaurant.coverUrl}
              alt={restaurant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-7 p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-4">
<<<<<<< HEAD
                <div className="flex items-start gap-3.5 min-w-0">
                  {restaurant.logoUrl && (
                    <img
                      src={restaurant.logoUrl}
                      alt={`${restaurant.name} logo`}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 bg-white shadow-xs shrink-0 mt-0.5"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-500 mb-1">
                      {restaurant.cuisine} · {restaurant.priceTier} · {restaurant.area}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3138] tracking-tight">
                      {lang === 'bn' ? restaurant.nameBn : restaurant.name}
                    </h1>
                    <p className="text-sm text-neutral-600 mt-1">{restaurant.description}</p>
                  </div>
=======
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-1">
                    {restaurant.cuisine} · {restaurant.priceTier} · {restaurant.area}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3138] tracking-tight">
                    {lang === 'bn' ? restaurant.nameBn : restaurant.name}
                  </h1>
                  <p className="text-sm text-neutral-600 mt-1">{restaurant.description}</p>
>>>>>>> 0260dd8282de4b6d1ec01e0cf7d9065c3700fb04
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(restaurant.id)}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Save restaurant'}
                  className={`p-2.5 rounded-full border transition-colors shrink-0 ${
                    isFavorited
                      ? 'bg-[#FFF0F6] border-[#E21B70] text-[#E21B70]'
                      : 'border-neutral-200 text-neutral-500 hover:border-[#E21B70]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[#E21B70]' : ''}`} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-neutral-700 tabular-nums">
                <span className="inline-flex items-center gap-1 font-semibold text-[#2E3138]">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {restaurant.rating} ({restaurant.reviewCount.toLocaleString()}+)
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  {restaurant.deliveryTimeMin} {lang === 'bn' ? 'মিনিট' : 'mins'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {lang === 'bn' ? 'ডেলিভারি ফি' : 'Delivery'}:{' '}
                  <strong className="text-[#E21B70]">{formatBdt(restaurant.deliveryFee, lang)}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {lang === 'bn' ? 'ন্যূনতম অর্ডার' : 'Min order'}: {formatBdt(restaurant.minOrder, lang)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E21B70]" />
                {restaurant.address}
              </span>
              <span>
                {lang === 'bn' ? 'খোলা থাকে:' : 'Hours:'} {restaurant.openingHours}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Controls & Grid + Map/Reviews Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#E21B70] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder={lang === 'bn' ? 'মেনুতে খুঁজুন...' : 'Search in menu...'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E21B70]"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center border border-neutral-200 rounded-xl text-neutral-500 text-sm">
              {lang === 'bn' ? 'এই ক্যাটাগরিতে কোনো খাবার পাওয়া যায়নি' : 'No dishes match your menu filter.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((food) => {
                const effectivePrice = food.discountPrice || food.price;
                const disabled = !food.inStock || !food.isAvailable;
                return (
                  <div
                    key={food.id}
                    className={`flex justify-between gap-3 p-4 rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 ${
                      disabled ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <p className="text-[11px] font-medium text-neutral-500 mb-0.5">
                          {food.category}
                          {food.isPopular ? ` · ${lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}` : ''}
                        </p>
                        <h3 className="font-semibold text-[#2E3138] text-base leading-snug truncate">
                          {lang === 'bn' ? food.nameBn : food.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {food.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-2 tabular-nums">
                          <span className="font-bold text-[#2E3138]">
                            {formatBdt(effectivePrice, lang)}
                          </span>
                          {food.discountPrice && food.discountPrice < food.price && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatBdt(food.price, lang)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => openFoodModal(food)}
                          aria-label={`Add ${food.name}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF0F6] text-[#E21B70] hover:bg-[#E21B70] hover:text-white disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            {disabled
                              ? lang === 'bn'
                                ? 'স্টক নেই'
                                : 'Sold out'
                              : lang === 'bn'
                              ? 'যোগ করুন'
                              : 'Add'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Google Maps Location + Verified Reviews */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-[#2E3138] mb-3">
              {lang === 'bn' ? 'রেস্টুরেন্টের অবস্থান' : 'Restaurant Location'}
            </h2>
            <DhakaMapPicker
              mapsApiKey={mapsApiKey}
              lang={lang}
              center={{ lat: restaurant.lat, lng: restaurant.lng }}
              markerLabel={restaurant.name}
              heightClass="h-[220px]"
            />
            <p className="text-xs text-neutral-500 mt-2.5">{restaurant.address}</p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-[#2E3138] mb-3">
              {lang === 'bn' ? 'ক্রেতাদের রিভিউ' : 'Verified Reviews'} ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-500">
                {lang === 'bn' ? 'এখনও কোনো রিভিউ নেই।' : 'No reviews yet for this restaurant.'}
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 5).map((rev) => (
                  <div key={rev.id} className="pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#2E3138]">{rev.customerName}</span>
                      <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600 tabular-nums">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {rev.rating}.0
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Food Customization Modal */}
      {activeFood && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="relative h-48 bg-neutral-100 shrink-0">
              <img
                src={activeFood.imageUrl}
                alt={activeFood.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                aria-label="Close food details"
                onClick={() => setActiveFood(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/95 text-[#2E3138] shadow hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <h2 className="text-xl font-bold text-[#2E3138]">
                  {lang === 'bn' ? activeFood.nameBn : activeFood.name}
                </h2>
                <p className="text-sm text-neutral-600 mt-1">{activeFood.description}</p>
              </div>

              {activeFood.variationsJson && activeFood.variationsJson.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#2E3138] mb-2">
                    {lang === 'bn' ? 'সাইজ / ভ্যারিয়েশন নির্বাচন করুন' : 'Select Size / Variation'}
                  </h3>
                  <div className="space-y-2">
                    {activeFood.variationsJson.map((v) => (
                      <label
                        key={v.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-sm ${
                          selectedVariation === v.name
                            ? 'border-[#E21B70] bg-[#FFF0F6]/60'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="food-variation"
                            checked={selectedVariation === v.name}
                            onChange={() => setSelectedVariation(v.name)}
                            className="accent-[#E21B70]"
                          />
                          <span className="font-medium text-[#2E3138]">{v.name}</span>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-neutral-600">
                          {v.priceDelta === 0
                            ? lang === 'bn'
                              ? 'বেস মূল্য'
                              : 'Base'
                            : `${v.priceDelta > 0 ? '+' : ''}${formatBdt(v.priceDelta, lang)}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeFood.addonsJson && activeFood.addonsJson.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#2E3138] mb-2">
                    {lang === 'bn' ? 'অতিরিক্ত অ্যাড-অন (ঐচ্ছিক)' : 'Add-ons & Extras (Optional)'}
                  </h3>
                  <div className="space-y-2">
                    {activeFood.addonsJson.map((addon) => {
                      const checked = selectedAddons.some((a) => a.name === addon.name);
                      return (
                        <label
                          key={addon.name}
                          className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 cursor-pointer text-sm hover:border-neutral-300"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAddons((prev) => [...prev, addon]);
                                } else {
                                  setSelectedAddons((prev) =>
                                    prev.filter((a) => a.name !== addon.name)
                                  );
                                }
                              }}
                              className="accent-[#E21B70]"
                            />
                            <span className="text-[#2E3138]">{addon.name}</span>
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-neutral-600">
                            +{formatBdt(addon.price, lang)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#2E3138] mb-1.5">
                  {lang === 'bn' ? 'বিশেষ নির্দেশনা' : 'Special Instructions'}
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: ঝাল কম দেবেন...' : 'e.g. Less spicy, extra chutney...'}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E21B70]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center border border-neutral-200 rounded-lg">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  −
                </button>
                <span className="px-3 py-2 text-sm font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#E21B70] hover:bg-[#C4135E] text-white font-semibold text-sm transition-colors tabular-nums"
              >
                {lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'} · {formatBdt(modalUnitPrice * qty, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
