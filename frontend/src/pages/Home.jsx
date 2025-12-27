import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/images";

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Premium Quality",
      description: "Made with high-grade materials for durability and comfort",
      icon: "⭐",
    },
    {
      title: "Easy to Clean",
      description:
        "Waterproof and stain-resistant surfaces for hassle-free maintenance",
      icon: "🧽",
    },
    {
      title: "Non-Slip Design",
      description: "Secure grip to keep your pets safe and comfortable",
      icon: "🛡️",
    },
    {
      title: "Veterinary Approved",
      description: "Recommended by veterinarians for pet health and hygiene",
      icon: "✅",
    },
    {
      title: "Multiple Sizes",
      description: "Available in various sizes to fit all breeds and spaces",
      icon: "📏",
    },
    {
      title: "Made in Pakistan",
      description: "Supporting local manufacturing with quality assurance",
      icon: "🇵🇰",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % (features.length - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 via-accent-500 to-accent-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <img
              src={getImageUrl("logo.jpeg")}
              alt="PAW PK"
              className="h-24 w-auto mx-auto mb-6"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Premium Pet Mats
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
            Quality orthopedic mats for your furry friends in Pakistan
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 hover:bg-primary-50 font-bold text-lg px-10 py-4 rounded-lg transition-all transform hover:scale-105 shadow-xl"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features Sliding Section - 3 at a time */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose Our Mats?
          </h2>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {features
                .slice(currentFeature, currentFeature + 3)
                .map((feature, index) => (
                  <div
                    key={currentFeature + index}
                    className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-primary-700 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {features.slice(0, features.length - 2).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentFeature
                      ? "bg-accent-500 w-8"
                      : "bg-gray-300 w-2"
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Link
              to="/products?category=dogs"
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 h-80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🐕</div>
                  <h3 className="text-4xl font-bold mb-3">Dog Mats</h3>
                  <p className="text-lg text-white/90">Browse our collection</p>
                  <div className="mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now →
                  </div>
                </div>
              </div>
            </Link>
            <Link
              to="/products?category=cats"
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 h-80 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🐱</div>
                  <h3 className="text-4xl font-bold mb-3">Cat Mats</h3>
                  <p className="text-lg text-white/90">Browse our collection</p>
                  <div className="mt-4 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
            Browse our complete collection of premium orthopedic pet mats
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 hover:bg-primary-50 font-bold text-lg px-10 py-4 rounded-lg transition-all transform hover:scale-105 shadow-xl"
          >
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
