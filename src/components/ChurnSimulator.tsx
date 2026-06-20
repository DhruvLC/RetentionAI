import React, { useState, useEffect } from 'react';
import { Customer, RetentionAction } from '../types';
import {
  ShieldAlert, ShieldCheck, RefreshCw, BarChart2,
  Sliders, UserPlus, Info, Save, Banknote, Sparkles, Activity
} from 'lucide-react';

interface ChurnSimulatorProps {
  initialCustomer?: Customer | null;
  onSimulateSuccess: () => void;
}

export default function ChurnSimulator({
  initialCustomer,
  onSimulateSuccess
}: ChurnSimulatorProps) {
  const [name, setName] = useState('Sandbox Customer Corp');
  const [email, setEmail] = useState('sandbox@customer.com');
  const [region, setRegion] = useState('US-East');
  const [planType, setPlanType] = useState<'Basic' | 'Standard' | 'Premium' | 'Enterprise'>('Standard');
  const [tenureMonths, setTenureMonths] = useState(12);
  const [age, setAge] = useState(34);
  const [loginFrequency, setLoginFrequency] = useState(12);
  const [appUsageHours, setAppUsageHours] = useState(45);
  const [orderCount, setOrderCount] = useState(8);
  const [averageOrderValue, setAverageOrderValue] = useState(150);
  const [ticketsRaised, setTicketsRaised] = useState(1);
  const [complaintCount, setComplaintCount] = useState(0);
  const [recencyDays, setRecencyDays] = useState(15);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Customer | null>(null);
  const [actions, setActions] = useState<RetentionAction[]>([]);
  const [activeTab, setActiveTab] = useState<'shap' | 'retention'>('shap');

  // Sync state with selected client if any
  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name);
      setEmail(initialCustomer.email);
      setRegion(initialCustomer.region);
      setPlanType(initialCustomer.planType);
      setTenureMonths(initialCustomer.tenureMonths);
      setAge(initialCustomer.age);
      setLoginFrequency(initialCustomer.loginFrequency);
      setAppUsageHours(initialCustomer.appUsageHours);
      setOrderCount(initialCustomer.orderCount);
      setAverageOrderValue(initialCustomer.averageOrderValue);
      setTicketsRaised(initialCustomer.ticketsRaised);
      setComplaintCount(initialCustomer.complaintCount);
      setRecencyDays(initialCustomer.recencyDays);
    }
  }, [initialCustomer]);

  // Trigger what-if predictive simulation
  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/customers/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: initialCustomer?.id || null,
          name,
          email,
          region,
          planType,
          tenureMonths,
          age,
          loginFrequency,
          appUsageHours,
          orderCount,
          averageOrderValue,
          ticketsRaised,
          complaintCount,
          recencyDays
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.customer);
        onSimulateSuccess();
      }

      // Fetch dynamic active retention playbooks
      const actResponse = await fetch('/api/retention-strategies');
      const actData = await actResponse.json();
      if (actData.status === 'success') {
        // filter recommendation metrics based on computed risk level
        const risk = data.customer.churnCategory;
        const filteredActions = actData.strategies.filter((s: RetentionAction) => {
          if (risk === 'Critical Risk' || risk === 'High Risk') {
            return s.category.includes('Engagement') || s.category.includes('Support');
          }
          return s.category.includes('Contract') || s.category.includes('Nurture');
        });
        setActions(filteredActions.length ? filteredActions : actData.strategies.slice(0, 2));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount once default parameters are set
  useEffect(() => {
    handleSimulate();
  }, [initialCustomer]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: SLIDERS & CONFIGURATORS (LOGICAL CELL) */}
      <form onSubmit={handleSimulate} className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 lg:col-span-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="font-display font-medium text-slate-900 text-sm">
              Features What-If Configurator
            </h3>
            <span className="text-[11px] text-slate-400 block">
              Adjust behavioral, commercial, and support markers to watch the ML risk recalculation
            </span>
          </div>
        </div>

        {/* Identification */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Corporate Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-sans"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Account Primary Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-sans"
            />
          </div>
        </div>

        {/* Structural properties */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Region Node
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="US-East">US-East</option>
              <option value="US-West">US-West</option>
              <option value="EU-West">EU-West</option>
              <option value="APAC-South">APAC-South</option>
              <option value="LATAM-North">LATAM-North</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Service Plan
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value as any)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Basic">Basic Plan</option>
              <option value="Standard">Standard Plan</option>
              <option value="Premium">Premium Plan</option>
              <option value="Enterprise font-bold">Enterprise Plan</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Client Age (Years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Commercial Values info */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
          <span className="text-[11px] font-semibold text-slate-700 tracking-wider flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-emerald-600" /> Commercial & Invoicing Markers
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase text-slate-500">
                Tenure Months ({tenureMonths}m)
              </label>
              <input
                type="range"
                min="1"
                max="36"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="mt-2 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500">
                Order Count ({orderCount})
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={orderCount}
                onChange={(e) => setOrderCount(Number(e.target.value))}
                className="mt-2 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500">
                Average Value (${averageOrderValue})
              </label>
              <input
                type="range"
                min="30"
                max="3500"
                value={averageOrderValue}
                onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                className="mt-2 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-right">
            Annual Revenue projection: <strong>${(orderCount * averageOrderValue).toLocaleString()}</strong>
          </div>
        </div>

        {/* Product Engagements sliders */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
          <span className="text-[11px] font-semibold text-slate-700 tracking-wider flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-emerald-600" /> Engagement & Session Latencies
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase text-slate-500">
                Inactivity (Recency) ({recencyDays}d)
              </label>
              <input
                type="range"
                min="1"
                max="120"
                value={recencyDays}
                onChange={(e) => setRecencyDays(Number(e.target.value))}
                className="mt-2 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500">
                Monthly Logins ({loginFrequency})
              </label>
              <input
                type="range"
                min="1"
                max="60"
                value={loginFrequency}
                onChange={(e) => setLoginFrequency(Number(e.target.value))}
                className="mt-2 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500">
                Usage hours/m ({appUsageHours}h)
              </label>
              <input
                type="range"
                min="0"
                max="250"
                value={appUsageHours}
                onChange={(e) => setAppUsageHours(Number(e.target.value))}
                className="mt-2 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* SINK: SUPPORT FRICITONS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50/30 p-3.5 rounded-xl border border-red-100">
            <label className="block text-[10px] uppercase font-mono font-semibold text-red-700">
              Support Incident Tickets
            </label>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-500">Open Tickets</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTicketsRaised(Math.max(0, ticketsRaised - 1))}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold font-mono">{ticketsRaised}</span>
                <button
                  type="button"
                  onClick={() => setTicketsRaised(ticketsRaised + 1)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="bg-rose-50/40 p-3.5 rounded-xl border border-rose-100">
            <label className="block text-[10px] uppercase font-mono font-semibold text-rose-700">
              Contract Quality Complaints
            </label>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-500 font-sans">Formal complaints</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComplaintCount(Math.max(0, complaintCount - 1))}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-bold"
                >
                  -
                </button>
                <span className="text-sm font-bold font-mono text-rose-600">{complaintCount}</span>
                <button
                  type="button"
                  onClick={() => setComplaintCount(complaintCount + 1)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 border border-slate-800 text-white font-medium py-2.5 rounded-xl text-xs hover:bg-emerald-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Features & Compute Forecasts
            </>
          )}
        </button>
      </form>

      {/* RIGHT: REAL-TIME PREDICTOR DISPLAY (LOGICAL CELL) */}
      <div className="lg:col-span-6 space-y-6">
        {result && (
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">
            {/* Churn Probability Dial Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-slate-400">
                  Computed Risk Matrix (What-if)
                </span>
                <h4 className="text-xl font-bold font-display text-slate-800 mt-1">
                  {result.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{result.email}</p>
              </div>

              {/* Prob visual indicator */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Risk Score</span>
                  <span className="text-2xl font-black text-rose-600 font-mono">
                    {result.churnScore}%
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    result.churnScore! > 75
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : result.churnScore! > 45
                      ? 'bg-orange-50 text-orange-600 border-orange-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}
                >
                  {result.churnScore! > 45 ? (
                    <ShieldAlert className="h-7 w-7" />
                  ) : (
                    <ShieldCheck className="h-7 w-7" />
                  )}
                </div>
              </div>
            </div>

            {/* Model Categories Projections Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">CHURN BAND</span>
                <span className="text-xs font-bold text-slate-800 block mt-1">
                  {result.churnCategory}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">STABLE CLV Forecast</span>
                <span className="text-xs font-bold text-indigo-600 block mt-1">
                  ${result.predictedCLV?.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono">30D Orders expected</span>
                <span className="text-xs font-bold text-emerald-600 block mt-1">
                  {result.expectedPurchases30d} Trans/m
                </span>
              </div>
            </div>

            {/* SEGMENT TABS */}
            <div>
              <div className="flex border-b border-slate-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('shap')}
                  className={`pb-2.5 px-4 -mb-px flex items-center gap-1.5 transition-colors ${
                    activeTab === 'shap'
                      ? 'border-b-2 border-emerald-600 text-slate-900 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <BarChart2 className="h-4 w-4" /> Explainable AI (SHAP Drivers)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('retention')}
                  className={`pb-2.5 px-4 -mb-px flex items-center gap-1.5 transition-colors ${
                    activeTab === 'retention'
                      ? 'border-b-2 border-emerald-600 text-slate-900 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Banknote className="h-4 w-4" /> Targeted retention strategies
                </button>
              </div>

              {/* TAB 1: SHAP WATERFALL */}
              {activeTab === 'shap' && (
                <div className="mt-4 space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      SHAP (Shapley Additive exPlanations) visualizes feature impact relative to baseline (base customer model expected value = 20% risk density). Red segments raise risk, green lowers it.
                    </span>
                  </div>

                  {/* Waterfall container chart layout */}
                  <div className="space-y-3 pt-2 font-mono text-[11px]">
                    <div className="flex justify-between font-semibold border-b border-dashed border-slate-200 pb-1.5 text-slate-600">
                      <span>Feature Vector Input</span>
                      <span>Impact offset</span>
                    </div>

                    {/* Standard base expected value representation */}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>System base value Expected E[y]</span>
                      <span className="font-semibold">20%</span>
                    </div>

                    {/* Loop computed drivers from server */}
                    {result.churnDrivers?.map((drv, idx) => {
                      const isPositive = drv.impact >= 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-medium text-slate-700">
                              {drv.feature} 
                              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                                ({drv.description})
                              </span>
                            </span>
                            <span className={`font-semibold ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
                              {isPositive ? '+' : ''}{Math.round(drv.impact * 10)}% risk
                            </span>
                          </div>
                          {/* Visual progress flow */}
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                              className={`h-full rounded-full ${isPositive ? 'bg-rose-400' : 'bg-emerald-400'}`}
                              style={{
                                width: `${Math.min(100, Math.abs(drv.impact * 12))}%`,
                                marginLeft: isPositive ? '30%' : 'auto',
                                marginRight: isPositive ? 'auto' : '70%'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Calculated final probability outcome */}
                    <div className="flex items-center justify-between text-slate-800 font-bold border-t border-slate-100 pt-2.5 text-xs">
                      <span>Computed Model Output f(x)</span>
                      <span className="text-sm font-black font-mono text-slate-900 border-b-2 border-slate-900 px-1">
                        {result.churnScore}% Probability
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PERSONAL RETENTIONS ACTIONS */}
              {activeTab === 'retention' && (
                <div className="mt-4 space-y-3.5">
                  <div className="flex items-center gap-1.5 bg-violet-50 p-2.5 rounded-lg text-[10px] text-violet-700 font-semibold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> Recommendation Recovery Playbook
                  </div>

                  {actions.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 text-xs">
                      No active plays configured for this segment parameters.
                    </p>
                  ) : (
                    actions.map((act, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 hover:border-violet-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-800 font-bold text-xs font-display">
                            {act.name}
                          </span>
                          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-md">
                            {act.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {act.description}
                        </p>
                        <div className="grid grid-cols-3 pt-2 text-[10px] border-t border-slate-200/50 font-mono text-slate-500">
                          <div>
                            <span>Lauch Cost</span>
                            <span className="block font-bold text-slate-700 mt-0.5">
                              ${act.cost}/Mo
                            </span>
                          </div>
                          <div>
                            <span>Risk Mitigation Lift</span>
                            <span className="block font-bold text-emerald-600 mt-0.5">
                              +{Math.round(act.retentionLift * 100)}% Lift
                            </span>
                          </div>
                          <div>
                            <span>Expected Saved Rev</span>
                            <span className="block font-bold text-indigo-600 mt-0.5 font-sans">
                              ${Math.round((result.predictedCLV! * act.retentionLift)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
