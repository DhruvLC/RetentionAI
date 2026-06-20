import React, { useState } from 'react';
import { Customer } from '../types';
import {
  TrendingUp, Users, ShieldAlert, Award, Search, Filter,
  DollarSign, Activity, ChevronRight, UserMinus, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Cell, Pie
} from 'recharts';

interface DashboardProps {
  customers: Customer[];
  activeModelName: string;
  onSelectCustomer: (c: Customer) => void;
  onOpenSimulatorWithCustomer: (c: Customer) => void;
}

export default function InteractiveDashboard({
  customers,
  activeModelName,
  onSelectCustomer,
  onOpenSimulatorWithCustomer
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  // Multi-dimensional analytical aggregations
  const totalCustomers = customers.length;
  const criticalRiskCount = customers.filter(c => c.churnCategory === 'Critical Risk').length;
  const highRiskCount = customers.filter(c => c.churnCategory === 'High Risk').length;
  const mediumRiskCount = customers.filter(c => c.churnCategory === 'Medium Risk').length;
  const lowRiskCount = customers.filter(c => c.churnCategory === 'Low Risk').length;

  const totalContractRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
  const averageCLVVal = Math.round(
    customers.reduce((sum, c) => sum + (c.predictedCLV || 0), 0) / (totalCustomers || 1)
  );

  const aggregateChurnRate = totalCustomers
    ? parseFloat(
        (
          ((criticalRiskCount + highRiskCount) / totalCustomers) *
          100
        ).toFixed(1)
      )
    : 0;

  // Filter pipeline
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    const matchesPlan = selectedPlan === 'All' || c.planType === selectedPlan;
    const matchesRisk = selectedRisk === 'All' || c.churnCategory === selectedRisk;

    return matchesSearch && matchesRegion && matchesPlan && matchesRisk;
  });

  // Recharts: Churn Cohort Pie Chart
  const pieData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: highRiskCount, color: '#f97316' },
    { name: 'Critical Risk', value: criticalRiskCount, color: '#ef4444' }
  ];

  // Distribution by Region
  const regionsList = ['US-East', 'US-West', 'EU-West', 'APAC-South', 'LATAM-North'];
  const barData = regionsList.map(r => {
    const regionalCusts = customers.filter(c => c.region === r);
    const avgRisk = regionalCusts.length
      ? Math.round(
          (regionalCusts.reduce((sum, c) => sum + c.churnProbability!, 0) /
            regionalCusts.length) *
            100
        )
      : 0;
    const revenueSum = regionalCusts.reduce((sum, c) => sum + c.revenue, 0);

    return {
      region: r,
      'Avg Risk %': avgRisk,
      'Revenue ($)': revenueSum,
      'Customers': regionalCusts.length
    };
  });

  // Tenure Risk Curve Scatter simulation mapping to Recharts
  const tenureRiskData = Array.from({ length: 24 }, (_, i) => {
    const month = i + 1;
    const matched = customers.filter(c => c.tenureMonths === month);
    const avgProb = matched.length
      ? Math.round(
          (matched.reduce((sum, c) => sum + c.churnProbability!, 0) /
            matched.length) *
            100
        )
      : null;
    return { month, 'Risk %': avgProb };
  }).filter(d => d['Risk %'] !== null);

  return (
    <div className="space-y-6">
      {/* Active Model Selection Readout banner */}
      <div className="bg-slate-900 text-slate-100 px-6 py-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between shadow-xs border border-slate-800">
        <div>
          <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
            Active Model Classifier
          </span>
          <h2 className="text-xl font-display font-medium text-white mt-0.5">
            {activeModelName}
          </h2>
        </div>
        <div className="mt-3 md:mt-0 flex gap-4 text-xs font-mono">
          <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400">Recall:</span>{' '}
            <span className="text-emerald-400 font-semibold">0.895</span>
          </div>
          <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400">R2 Score:</span>{' '}
            <span className="text-emerald-400 font-semibold">0.941</span>
          </div>
          <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400">ROC-AUC:</span>{' '}
            <span className="text-emerald-400 font-semibold">0.958</span>
          </div>
        </div>
      </div>

      {/* TOP RANGED STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Total base
            </span>
            <p className="text-2xl font-bold font-display mt-0.5 text-slate-900">
              {totalCustomers}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" /> +12.4% MoM Growth
            </span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Annual Spend base
            </span>
            <p className="text-2xl font-bold font-display mt-0.5 text-slate-900">
              ${totalContractRevenue.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5 mt-1">
              Avg ACV: ${(totalCustomers ? Math.round(totalContractRevenue/totalCustomers) : 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Churn Vulnerability
            </span>
            <p className="text-2xl font-bold font-display mt-0.5 text-rose-600">
              {aggregateChurnRate}%
            </p>
            <span className="text-[10px] text-rose-500 font-mono mt-1 block">
              {criticalRiskCount + highRiskCount} profiles at high risk
            </span>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Average Est. CLV
            </span>
            <p className="text-2xl font-bold font-display mt-0.5 text-slate-900">
              ${averageCLVVal.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              Expected Lifetime: ~18 months
            </span>
          </div>
          <div className="bg-violet-50 p-3 rounded-lg text-violet-600">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Health Metric
            </span>
            <p className="text-2xl font-bold font-display mt-0.5 text-emerald-600">
              {100 - Math.round(aggregateChurnRate)}%
            </p>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Active Contract Stability
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* COMPACT INTERACTIVE CHARTS WRAPPER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Risk Segmentation Pie */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-sm">
              Portfolio Churn Segmentation
            </h3>
            <span className="text-xs text-slate-400 block mt-0.5">
              Stratified customer counts grouped by churn vulnerability
            </span>
          </div>
          <div className="h-48 my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Customers`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full inline-block"
                  style={{ backgroundColor: p.color }}
                ></span>
                <span className="text-slate-600">
                  {p.name}: <strong>{p.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Regional Risk vs Regional Value */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100 lg:col-span-2">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-sm">
              Regional Health & Financial Contribution
            </h3>
            <span className="text-xs text-slate-400 block mt-0.5">
              Comparative analysis of regional average risk score % alongside spend base
            </span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="region" tickLine={false} stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" orientation="left" tickLine={false} stroke="#c084fc" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} stroke="#34d399" fontSize={11} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="Avg Risk %" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar yAxisId="right" dataKey="Revenue ($)" fill="#34d399" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER & DRILL DOWN CUSTOMER INTERFACE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-sm">
                Prediction Registry Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Investigate detailed model parameters, risk flags, and drivers for the active customer database
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ID, Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-48 font-mono"
                />
              </div>

              {/* Filters dropdowns */}
              <span className="text-slate-300">|</span>
              
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px]">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="focus:outline-hidden bg-transparent font-medium"
                >
                  <option value="All">All Regions</option>
                  {regionsList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px]">
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="focus:outline-hidden bg-transparent font-medium"
                >
                  <option value="All">All Plans</option>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px]">
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="focus:outline-hidden bg-transparent font-medium"
                >
                  <option value="All">All Risks</option>
                  <option value="Low Risk">Low Risk</option>
                  <option value="Medium Risk">Medium Risk</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Critical Risk">Critical Risk</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER MATRIX GRID */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono tracking-wider font-semibold">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Client Enterprise</th>
                <th className="py-3.5 px-5">Region</th>
                <th className="py-3.5 px-5">Contract Plan</th>
                <th className="py-3.5 px-5">Spend (ACV)</th>
                <th className="py-3.5 px-5">Churn Prob %</th>
                <th className="py-3.5 px-5">Model Risk Status</th>
                <th className="py-3.5 px-5">Predicted CLV</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No records found matching the configured filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  if (c.churnCategory === 'Critical Risk') badgeColor = 'bg-rose-50 text-rose-700 border-rose-100';
                  else if (c.churnCategory === 'High Risk') badgeColor = 'bg-orange-50 text-orange-700 border-orange-100';
                  else if (c.churnCategory === 'Medium Risk') badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';

                  let planBadge = 'bg-slate-100 text-slate-600';
                  if (c.planType === 'Enterprise') planBadge = 'bg-indigo-50 text-indigo-700 border shadow-2xs border-indigo-100';
                  else if (c.planType === 'Premium') planBadge = 'bg-purple-50 text-purple-700 border border-purple-100';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectCustomer(c)}
                    >
                      <td className="py-3 px-5 font-mono text-slate-400 group-hover:text-slate-900 transition-colors">
                        {c.id}
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.email}</div>
                      </td>
                      <td className="py-3 px-5 text-slate-600 font-medium">
                        {c.region}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${planBadge}`}>
                          {c.planType}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono font-medium text-slate-800">
                        ${c.revenue?.toLocaleString()}
                      </td>
                      <td className="py-3 px-5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {Math.round(c.churnProbability! * 100)}%
                          </span>
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500"
                              style={{
                                width: `${c.churnProbability! * 100}%`,
                                backgroundColor:
                                  c.churnProbability! > 0.75
                                    ? '#ef4444'
                                    : c.churnProbability! > 0.45
                                    ? '#f97316'
                                    : '#10b981'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badgeColor}`}>
                          {c.churnCategory}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono font-semibold text-indigo-600">
                        ${c.predictedCLV?.toLocaleString()}
                      </td>
                      <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenSimulatorWithCustomer(c)}
                          className="px-2.5 py-1 text-[10px] font-medium bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-1 inline-flex"
                        >
                          <Activity className="h-3 w-3" /> Simulate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
