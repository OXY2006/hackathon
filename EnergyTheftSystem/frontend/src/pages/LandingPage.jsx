import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Activity, BarChart4, ArrowRight, Sparkles, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
        {/* Subtle background orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-energy-200/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-10 right-20 w-56 h-56 bg-blue-200/15 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="lg:w-1/2 text-left relative z-10">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-2xl bg-energy-50 border border-energy-100 text-energy-600 mb-10 backdrop-blur-sm shadow-sm animate-reveal">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-energy-500"></span>
            </span>
            <span className="text-xs font-black tracking-[0.2em] uppercase">Energy Conservation Protocol</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-reveal">
            <span className="block text-slate-900">Empowering</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-energy-600 via-emerald-500 to-green-600 animate-gradient">
              Future Grids.
            </span>
          </h1>
          
          <p className="mt-8 max-w-xl text-xl text-slate-500 leading-relaxed font-medium animate-reveal" style={{ animationDelay: '200ms' }}>
            We leverage <span className="text-slate-900 font-black italic">Advanced AI</span> to protect cosmic energy resources. Our system turns smart telemetry into actionable conservation insights.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-12 animate-reveal" style={{ animationDelay: '400ms' }}>
            <Link to="/upload" className="btn-primary group flex items-center justify-center space-x-3 hover:-translate-y-1 hover:shadow-2xl hover:shadow-energy-500/30 transition-all duration-300">
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Analysis</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link to="/dashboard" className="btn-outline flex items-center justify-center space-x-3 group hover:-translate-y-1 transition-all duration-300">
              <span>View Stats</span>
              <BarChart4 className="h-5 w-5 transition-all group-hover:text-energy-600 group-hover:scale-110" />
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 relative animate-float-slow">
          <div className="absolute inset-0 bg-energy-400/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
          <div className="relative group">
            <img 
              src="/hero_eco.png" 
              alt="Sustainable City" 
              className="rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-8 border-white transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1 group-hover:shadow-[0_60px_120px_rgba(16,185,129,0.15)]" 
            />
            <div className="absolute -bottom-10 -left-10 glass-card p-8 animate-float shadow-2xl border-white/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-energy-500 to-emerald-600 rounded-2xl shadow-lg shadow-energy-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 animate-count-up">92k Watts</p>
                  <p className="text-[10px] font-black text-energy-600 uppercase tracking-widest">Efficiency Saved</p>
                </div>
              </div>
            </div>
            {/* Extra floating badge */}
            <div className="absolute -top-6 -right-6 glass-card p-4 animate-float shadow-xl border-white/50" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">90.66%</p>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Mission */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-energy-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="animate-reveal">
              <h2 className="text-5xl font-black text-white mb-10 tracking-tight leading-tight">
                Global Conservation <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-energy-400 to-emerald-300">Mission 2026</span>
              </h2>
              <div className="space-y-8">
                <p className="text-slate-400 text-xl font-medium leading-relaxed">
                  Electricity theft is more than a financial loss—it's an environmental crisis. Unmonitored consumption accelerates grid decay and carbon footprints.
                </p>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 hover:border-energy-500/30">
                  <p className="text-white text-lg font-bold italic leading-relaxed">
                    "Our mission is to neutralize energy theft using explainable AI, ensuring every kilowatt contributes to a sustainable world."
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 stagger-children">
              {[
                { val: "$96B+", label: "Target Recovery", icon: Activity, color: "text-red-400", glowColor: "shadow-red-500/20" },
                { val: "2.4M", label: "Trees Saved", icon: Zap, color: "text-energy-400", glowColor: "shadow-energy-500/20" }
              ].map((item, i) => (
                <div key={i} className={`bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl text-center group hover:bg-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${item.glowColor} card-hover`}>
                  <div className={`p-5 bg-white/5 rounded-2xl mb-8 inline-block ${item.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <item.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-2">{item.val}</h3>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced AI Pipeline */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-energy-100/20 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="text-center mb-24 relative">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6 animate-reveal">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            How it works
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter animate-reveal" style={{ animationDelay: '100ms' }}>Conservation Engine</h2>
          <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-xl font-medium animate-reveal" style={{ animationDelay: '200ms' }}>
            Our triple-layer intelligence protocol identifies leaks with 90.66% accuracy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 stagger-children">
          {[
            {
              title: "Smart Ingestion",
              desc: "Deep analysis of sub-cycle harmonics and voltage deviations across thousands of telemetry points.",
              icon: Zap,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              borderHover: "hover:border-blue-200",
              step: "01"
            },
            {
              title: "Neural Mapping",
              desc: "Dynamic feature synthesis through 57 exclusive telemetry vectors using ensemble ML models.",
              icon: BarChart4,
              color: "text-indigo-600",
              bgColor: "bg-indigo-50",
              borderHover: "hover:border-indigo-200",
              step: "02"
            },
            {
              title: "Eco-Response",
              desc: "Automated grid stabilization, predictive demand shedding, and real-time anomaly alerting.",
              icon: ShieldCheck,
              color: "text-energy-600",
              bgColor: "bg-green-50",
              borderHover: "hover:border-energy-200",
              step: "03"
            }
          ].map((item, i) => (
            <div key={i} className={`glass-card group p-12 relative overflow-hidden scan-line ${item.borderHover}`}>
              {/* Step number watermark */}
              <span className="absolute top-6 right-8 text-7xl font-black text-slate-100/60 select-none pointer-events-none group-hover:text-slate-100 transition-colors duration-500">{item.step}</span>
              
              <div className={`mb-10 inline-flex p-5 rounded-[1.5rem] ${item.bgColor} group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-sm`}>
                <item.icon className={`h-10 w-10 ${item.color}`} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-6 relative">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-lg relative">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
