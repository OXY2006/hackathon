import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Activity, BarChart4 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 text-left relative z-10">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-2xl bg-energy-50 border border-energy-100 text-energy-600 mb-10 backdrop-blur-sm shadow-sm animate-reveal">
            <span className="flex h-3 w-3 rounded-full bg-energy-500 animate-pulse"></span>
            <span className="text-xs font-black tracking-[0.2em] uppercase">Energy Conservation Protocol</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-reveal">
            <span className="block text-slate-900">Empowering</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-energy-600 to-green-600">
              Future Grids.
            </span>
          </h1>
          
          <p className="mt-8 max-w-xl text-xl text-slate-500 leading-relaxed font-medium animate-reveal" style={{ animationDelay: '200ms' }}>
            We leverage <span className="text-slate-900 font-black italic">Advanced AI</span> to protect cosmic energy resources. Our system turns smart telemetry into actionable conservation insights.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-12 animate-reveal" style={{ animationDelay: '400ms' }}>
            <Link to="/upload" className="btn-primary group flex items-center justify-center space-x-3">
              <span>Start Analysis</span>
              <Zap className="h-5 w-5 transition-transform group-hover:scale-125 group-hover:rotate-12" />
            </Link>
            <Link to="/dashboard" className="btn-outline flex items-center justify-center space-x-3 group">
              <span>View Stats</span>
              <BarChart4 className="h-5 w-5 transition-colors group-hover:text-energy-600" />
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 relative animate-float-slow">
          <div className="absolute inset-0 bg-energy-400/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
          <div className="relative group">
            <img 
              src="/hero_eco.png" 
              alt="Sustainable City" 
              className="rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-8 border-white transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1" 
            />
            <div className="absolute -bottom-10 -left-10 glass-card p-8 animate-float shadow-2xl border-white/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-energy-500 rounded-2xl shadow-lg shadow-energy-500/30">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">92k Watts</p>
                  <p className="text-[10px] font-black text-energy-600 uppercase tracking-widest">Efficiency Saved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Mission */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="animate-reveal">
              <h2 className="text-5xl font-black text-white mb-10 tracking-tight leading-tight">
                Global Conservation <br />
                <span className="text-energy-400">Mission 2026</span>
              </h2>
              <div className="space-y-8">
                <p className="text-slate-400 text-xl font-medium leading-relaxed">
                  Electricity theft is more than a financial loss—it's an environmental crisis. Unmonitored consumption accelerates grid decay and carbon footprints.
                </p>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                  <p className="text-white text-lg font-bold italic">
                    "Our mission is to neutralize energy theft using explainable AI, ensuring every kilowatt contributes to a sustainable world."
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { val: "$96B+", label: "Target Recovery", icon: Activity, color: "text-red-400" },
                { val: "2.4M", label: "Trees Saved", icon: Zap, color: "text-energy-400" }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl text-center group hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                  <div className={`p-5 bg-white/5 rounded-2xl mb-8 inline-block ${item.color} group-hover:scale-110 transition-transform`}>
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Conservation Engine</h2>
          <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-xl font-medium">
            Our triple-layer intelligence protocol identifies leaks with 99.4% accuracy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Smart Ingestion",
              desc: "Deep analysis of sub-cycle harmonics and voltage deviations.",
              icon: Zap,
              color: "text-blue-600",
              bgColor: "bg-blue-50"
            },
            {
              title: "Neural Mapping",
              desc: "Dynamic feature synthesis through 57 exclusive telemetry vectors.",
              icon: BarChart4,
              color: "text-indigo-600",
              bgColor: "bg-indigo-50"
            },
            {
              title: "Eco-Response",
              desc: "Automated grid stabilization and predictive demand shedding.",
              icon: ShieldCheck,
              color: "text-energy-600",
              bgColor: "bg-green-50"
            }
          ].map((item, i) => (
            <div key={i} className="glass-card group p-12">
              <div className={`mb-10 inline-flex p-5 rounded-[1.5rem] ${item.bgColor} group-hover:rotate-12 transition-transform duration-500`}>
                <item.icon className={`h-10 w-10 ${item.color}`} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
