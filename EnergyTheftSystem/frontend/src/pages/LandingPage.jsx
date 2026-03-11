import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Activity, BarChart4 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-energy-500/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 -m-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-energy-500/10 border border-energy-500/20 text-energy-400 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-energy-500 animate-pulse"></span>
          <span className="text-sm font-medium">Hackathon Project</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="block text-white">AI-Driven Energy</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-energy-400 to-blue-400">
            Theft & Anomaly Detection
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl text-dark-300 mx-auto mb-10">
          Securing the power grid with advanced machine learning. Our system analyzes smart meter data in real-time to identify suspicious consumption patterns and prevent financial losses.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/upload" className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-3">
            <Zap className="h-5 w-5" />
            <span>Detect Anomalies</span>
          </Link>
          <Link to="/dashboard" className="btn-outline flex items-center justify-center space-x-2 text-lg px-8 py-3">
            <BarChart4 className="h-5 w-5" />
            <span>View Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-dark-900 border-y border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The Grid Stability Crisis</h2>
              <p className="text-dark-300 text-lg mb-4">
                Electricity theft causes massive financial losses worldwide—estimated at over $96 billion annually. It not only leads to increased tariffs for honest consumers but also causes severe grid instability, equipment damage, and localized blackouts.
              </p>
              <p className="text-dark-300 text-lg">
                Traditional detection methods are slow and labor-intensive. By the time theft is discovered, the damage is already done.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="p-3 bg-red-500/10 rounded-full mb-4">
                  <Activity className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">$96B+</h3>
                <p className="text-sm text-dark-400">Annual global loss to energy theft</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="p-3 bg-orange-500/10 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">40%</h3>
                <p className="text-sm text-dark-400">Losses in developing grids</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">How Our AI Works</h2>
          <p className="mt-4 text-dark-300 max-w-2xl mx-auto">
            Our ensemble machine learning pipeline processes thousands of smart meter readings to identify the subtle statistical signatures of electricity theft.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "1. Data Collection",
              desc: "Smart meter telemetry including voltage, current, power factor, and harmonic distortion is collected over time.",
              icon: Zap,
              color: "text-blue-400"
            },
            {
              title: "2. Feature Engineering",
              desc: "We extract 57 complex statistical features including volatility, trend ratios, skewness, and zero-consumption streaks.",
              icon: BarChart4,
              color: "text-indigo-400"
            },
            {
              title: "3. ML Inference",
              desc: "Our trained ensemble model evaluates the features to assign a risk score and high-confidence classification.",
              icon: ShieldCheck,
              color: "text-energy-400"
            }
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
              <div className="mb-6 inline-flex p-3 rounded-lg bg-dark-800">
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-dark-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
