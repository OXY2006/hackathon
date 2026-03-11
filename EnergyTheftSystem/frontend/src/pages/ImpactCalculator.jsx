import { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, Trees, Flame, Zap, TrendingDown, Leaf, ArrowRight } from 'lucide-react';

function AnimatedCounter({ target, duration = 1500, prefix = '', suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

export default function ImpactCalculator() {
  const [rate, setRate] = useState(7); // ₹ per kWh default
  const [avgDailyKwh, setAvgDailyKwh] = useState(25);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [calculated, setCalculated] = useState(false);

  // Load data from last analysis
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('latestResults');
      if (stored) {
        const { results } = JSON.parse(stored);
        if (results?.predictions) {
          setSuspiciousCount(results.predictions.filter(p => p.is_suspicious).length);
          setTotalNodes(results.predictions.length);
        }
      }
    } catch {}
  }, []);

  const metrics = useMemo(() => {
    const dailyLossKwh = suspiciousCount * avgDailyKwh;
    const monthlyLossKwh = dailyLossKwh * 30;
    const yearlyLossKwh = dailyLossKwh * 365;
    const monthlyRevenueLoss = monthlyLossKwh * rate;
    const yearlyRevenueLoss = yearlyLossKwh * rate;
    const co2PerKwh = 0.82; // kg CO₂ per kWh (India grid average)
    const yearlyCO2 = (yearlyLossKwh * co2PerKwh) / 1000; // tonnes
    const treesNeeded = Math.ceil(yearlyCO2 / 0.022); // ~22 kg CO₂ absorbed per tree/year
    const households = Math.round(yearlyLossKwh / 3600); // avg household uses ~3600 kWh/year in India
    return { dailyLossKwh, monthlyLossKwh, yearlyLossKwh, monthlyRevenueLoss, yearlyRevenueLoss, yearlyCO2, treesNeeded, households };
  }, [suspiciousCount, avgDailyKwh, rate]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-page-reveal">
      {/* Header */}
      <div className="mb-12 animate-reveal">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest mb-6">
          <Calculator className="h-3.5 w-3.5 mr-2" />
          Financial & Environmental Analysis
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20">
            <TrendingDown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Impact Calculator</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Revenue Loss & Carbon Footprint</p>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-3 max-w-2xl">
          Estimate the financial damage and environmental impact of detected energy theft based on your latest analysis.
        </p>
      </div>

      {/* Input panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm mb-10 animate-reveal" style={{ animationDelay: '150ms' }}>
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-amber-500" />
          Configuration Parameters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Electricity Rate (₹/kWh)</label>
            <input
              type="number"
              value={rate}
              onChange={e => { setRate(Number(e.target.value)); setCalculated(false); }}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
              min="0" step="0.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Est. Stolen kWh/Day/Node</label>
            <input
              type="number"
              value={avgDailyKwh}
              onChange={e => { setAvgDailyKwh(Number(e.target.value)); setCalculated(false); }}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
              min="0" step="1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Suspicious Nodes Detected</label>
            <input
              type="number"
              value={suspiciousCount}
              onChange={e => { setSuspiciousCount(Number(e.target.value)); setCalculated(false); }}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
              min="0"
            />
            {totalNodes > 0 && (
              <p className="text-[10px] text-slate-400 font-medium ml-1">
                out of {totalNodes} total nodes analyzed
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setCalculated(true)}
          className="mt-6 btn-primary flex items-center gap-2 hover:-translate-y-0.5 transition-all"
        >
          <Calculator className="h-4 w-4" />
          Calculate Impact
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Results */}
      {calculated && (
        <div className="space-y-8 animate-reveal">
          {/* Financial Impact */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-1.5" />
              Revenue Loss Projection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Daily Loss', value: metrics.dailyLossKwh * rate, unit: '₹', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
                { label: 'Monthly Loss', value: metrics.monthlyRevenueLoss, unit: '₹', color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
                { label: 'Yearly Loss', value: metrics.yearlyRevenueLoss, unit: '₹', color: 'from-red-600 to-red-800', bgColor: 'bg-red-50 dark:bg-red-900/20' },
              ].map((item, i) => (
                <div key={i} className={`${item.bgColor} border border-slate-200 dark:border-slate-700 rounded-3xl p-6 card-hover`}>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{item.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    <AnimatedCounter target={item.value} prefix={item.unit} decimals={0} />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    <AnimatedCounter target={i === 0 ? metrics.dailyLossKwh : i === 1 ? metrics.monthlyLossKwh : metrics.yearlyLossKwh} suffix=" kWh" decimals={0} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Impact */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center">
              <Leaf className="h-4 w-4 mr-1.5" />
              Environmental Impact (Yearly)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'CO₂ Emissions', value: metrics.yearlyCO2, suffix: ' tonnes', icon: Flame, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
                { label: 'Trees Required to Offset', value: metrics.treesNeeded, suffix: ' trees', icon: Trees, color: 'text-energy-500', bgColor: 'bg-energy-50 dark:bg-energy-900/20' },
                { label: 'Households Equivalent', value: metrics.households, suffix: ' homes', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
              ].map((item, i) => (
                <div key={i} className={`${item.bgColor} border border-slate-200 dark:border-slate-700 rounded-3xl p-6 card-hover`}>
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.label}</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    <AnimatedCounter target={item.value} suffix={item.suffix} decimals={item.value < 10 ? 2 : 0} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary callout */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 rounded-3xl p-8 text-white animate-reveal" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-2xl shrink-0">
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Conservation Impact Summary</h3>
                <p className="text-slate-300 leading-relaxed font-medium">
                  If left unchecked, the <strong className="text-white">{suspiciousCount} suspicious nodes</strong> detected
                  could cause an estimated annual revenue loss of <strong className="text-red-400">₹{metrics.yearlyRevenueLoss.toLocaleString()}</strong>,
                  generate <strong className="text-amber-400">{metrics.yearlyCO2.toFixed(1)} tonnes of CO₂</strong>,
                  and consume enough energy to power <strong className="text-blue-400">{metrics.households} households</strong> for a year.
                  Immediate intervention is recommended to protect both revenue and the environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
