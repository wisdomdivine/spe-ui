"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsExchange,
  IconDroplet,
  IconChartBar,
  IconTrendingDown,
  IconActivity,
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Area,
  AreaChart,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type TabId = "converter" | "darcy" | "material" | "decline" | "ipr";

interface Tab {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}

const TABS: Tab[] = [
  { id: "converter", label: "Unit Converter", shortLabel: "Units", icon: IconArrowsExchange, description: "Convert between common oilfield and SI units" },
  { id: "darcy", label: "Darcy's Law", shortLabel: "Darcy", icon: IconDroplet, description: "Solve for any unknown variable in Darcy's equation" },
  { id: "material", label: "Material Balance", shortLabel: "P/Z", icon: IconChartBar, description: "Gas reservoir P/Z vs Gp plot with OGIP estimation" },
  { id: "decline", label: "Decline Curve", shortLabel: "DCA", icon: IconTrendingDown, description: "Exponential, hyperbolic, and harmonic decline analysis" },
  { id: "ipr", label: "Vogel's IPR", shortLabel: "IPR", icon: IconActivity, description: "Inflow Performance Relationship curve generation" },
];

/* ------------------------------------------------------------------ */
/*  Unit Converter Data                                                */
/* ------------------------------------------------------------------ */
interface UnitCategory {
  name: string;
  units: { label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[];
}

const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: "Pressure",
    units: [
      { label: "psi", toBase: (v) => v, fromBase: (v) => v },
      { label: "kPa", toBase: (v) => v * 0.145038, fromBase: (v) => v / 0.145038 },
      { label: "MPa", toBase: (v) => v * 145.038, fromBase: (v) => v / 145.038 },
      { label: "bar", toBase: (v) => v * 14.5038, fromBase: (v) => v / 14.5038 },
      { label: "atm", toBase: (v) => v * 14.696, fromBase: (v) => v / 14.696 },
      { label: "Pa", toBase: (v) => v * 0.000145038, fromBase: (v) => v / 0.000145038 },
    ],
  },
  {
    name: "Volume",
    units: [
      { label: "bbl", toBase: (v) => v, fromBase: (v) => v },
      { label: "m3", toBase: (v) => v * 6.28981, fromBase: (v) => v / 6.28981 },
      { label: "ft3", toBase: (v) => v * 0.178108, fromBase: (v) => v / 0.178108 },
      { label: "litre", toBase: (v) => v * 0.00628981, fromBase: (v) => v / 0.00628981 },
      { label: "US gal", toBase: (v) => v * 0.0238095, fromBase: (v) => v / 0.0238095 },
    ],
  },
  {
    name: "Flow Rate",
    units: [
      { label: "bbl/day", toBase: (v) => v, fromBase: (v) => v },
      { label: "m3/day", toBase: (v) => v * 6.28981, fromBase: (v) => v / 6.28981 },
      { label: "m3/hr", toBase: (v) => v * 150.955, fromBase: (v) => v / 150.955 },
      { label: "ft3/day", toBase: (v) => v * 0.178108, fromBase: (v) => v / 0.178108 },
      { label: "L/min", toBase: (v) => v * 0.00907185, fromBase: (v) => v / 0.00907185 },
    ],
  },
  {
    name: "Length",
    units: [
      { label: "ft", toBase: (v) => v, fromBase: (v) => v },
      { label: "m", toBase: (v) => v * 3.28084, fromBase: (v) => v / 3.28084 },
      { label: "in", toBase: (v) => v / 12, fromBase: (v) => v * 12 },
      { label: "cm", toBase: (v) => v * 0.0328084, fromBase: (v) => v / 0.0328084 },
      { label: "km", toBase: (v) => v * 3280.84, fromBase: (v) => v / 3280.84 },
      { label: "mi", toBase: (v) => v * 5280, fromBase: (v) => v / 5280 },
    ],
  },
  {
    name: "Permeability",
    units: [
      { label: "mD", toBase: (v) => v, fromBase: (v) => v },
      { label: "D", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { label: "m2", toBase: (v) => v * 1.01325e15, fromBase: (v) => v / 1.01325e15 },
    ],
  },
  {
    name: "Viscosity",
    units: [
      { label: "cp", toBase: (v) => v, fromBase: (v) => v },
      { label: "Pa.s", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { label: "mPa.s", toBase: (v) => v, fromBase: (v) => v },
      { label: "poise", toBase: (v) => v * 100, fromBase: (v) => v / 100 },
    ],
  },
  {
    name: "API Gravity",
    units: [
      { label: "API", toBase: (v) => v, fromBase: (v) => v },
      { label: "SG (60F)", toBase: (v) => 141.5 / (v + 131.5) > 0 ? (141.5 / v) - 131.5 : 0, fromBase: (v) => 141.5 / (v + 131.5) },
    ],
  },
  {
    name: "Temperature",
    units: [
      { label: "F", toBase: (v) => v, fromBase: (v) => v },
      { label: "C", toBase: (v) => v * 9 / 5 + 32, fromBase: (v) => (v - 32) * 5 / 9 },
      { label: "K", toBase: (v) => (v - 273.15) * 9 / 5 + 32, fromBase: (v) => ((v - 32) * 5 / 9) + 273.15 },
      { label: "R", toBase: (v) => v - 459.67, fromBase: (v) => v + 459.67 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Shared Components                                                  */
/* ------------------------------------------------------------------ */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-2 rounded-xl text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
      title="Copy"
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
    </button>
  );
}

function FormulaBlock({ formula, description }: { formula: string; description: string }) {
  return (
    <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-5">
      <div className="flex items-start gap-3">
        <IconInfoCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Formula</p>
          <p className="text-sm font-mono font-bold text-gray-700">{formula}</p>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, unit, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
          className="w-full h-12 bg-white border border-gray-100 rounded-xl px-4 pr-14 font-bold text-sm text-gray-900 outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">{unit}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Unit Converter                                                  */
/* ------------------------------------------------------------------ */
function UnitConverter() {
  const [catIndex, setCatIndex] = useState(0);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [inputVal, setInputVal] = useState("1");

  const cat = UNIT_CATEGORIES[catIndex];
  const fromUnit = cat.units[fromIdx] || cat.units[0];
  const toUnit = cat.units[toIdx] || cat.units[1];

  const result = useMemo(() => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) return "";
    // Special handling for API gravity
    if (cat.name === "API Gravity") {
      if (fromUnit.label === "API" && toUnit.label === "SG (60F)") {
        return (141.5 / (num + 131.5)).toFixed(6);
      } else if (fromUnit.label === "SG (60F)" && toUnit.label === "API") {
        return ((141.5 / num) - 131.5).toFixed(4);
      }
      return String(num);
    }
    const baseVal = fromUnit.toBase(num);
    const converted = toUnit.fromBase(baseVal);
    return converted < 0.001 || converted > 1e9
      ? converted.toExponential(6)
      : parseFloat(converted.toFixed(8)).toString();
  }, [inputVal, fromUnit, toUnit, cat.name]);

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {UNIT_CATEGORIES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => { setCatIndex(i); setFromIdx(0); setToIdx(Math.min(1, c.units.length - 1)); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              i === catIndex ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Conversion row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">From</label>
          <select
            value={fromIdx}
            onChange={(e) => setFromIdx(Number(e.target.value))}
            className="w-full h-10 bg-white border border-gray-100 rounded-xl px-4 font-bold text-sm text-gray-700 outline-none focus:border-blue-200 mb-2"
          >
            {cat.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
          </select>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full h-14 bg-white border border-gray-100 rounded-xl px-5 font-bold text-lg text-gray-900 outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter value"
          />
        </div>

        <div className="flex items-center justify-center py-2">
          <button
            onClick={() => { const temp = fromIdx; setFromIdx(toIdx); setToIdx(temp); }}
            className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <IconArrowsExchange size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">To</label>
          <select
            value={toIdx}
            onChange={(e) => setToIdx(Number(e.target.value))}
            className="w-full h-10 bg-white border border-gray-100 rounded-xl px-4 font-bold text-sm text-gray-700 outline-none focus:border-blue-200 mb-2"
          >
            {cat.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}
          </select>
          <div className="relative">
            <div className="w-full h-14 bg-gray-50 border border-gray-100 rounded-xl px-5 font-bold text-lg text-gray-900 flex items-center justify-between">
              <span className={result ? "text-gray-900" : "text-gray-300"}>{result || "---"}</span>
              {result && <CopyButton value={result} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Darcy's Law Solver                                              */
/* ------------------------------------------------------------------ */
function DarcySolver() {
  type SolveFor = "q" | "k" | "dP" | "A";
  const [solveFor, setSolveFor] = useState<SolveFor>("q");
  const [k, setK] = useState("100");
  const [A, setA] = useState("1000");
  const [dP, setDP] = useState("500");
  const [mu, setMu] = useState("1");
  const [L, setL] = useState("1000");
  const [q, setQ] = useState("50");

  const result = useMemo(() => {
    const kN = parseFloat(k), AN = parseFloat(A), dPN = parseFloat(dP), muN = parseFloat(mu), LN = parseFloat(L), qN = parseFloat(q);
    // q = (k * A * dP) / (mu * L) * (1/887.2) in field units
    // Using Darcy field units: q(bbl/day) = 1.1271e-3 * k(mD) * A(ft2) * dP(psi) / (mu(cp) * L(ft))
    const C = 1.1271e-3;
    switch (solveFor) {
      case "q": {
        if (isNaN(kN) || isNaN(AN) || isNaN(dPN) || isNaN(muN) || isNaN(LN) || muN === 0 || LN === 0) return null;
        return { value: (C * kN * AN * dPN / (muN * LN)), unit: "bbl/day" };
      }
      case "k": {
        if (isNaN(qN) || isNaN(AN) || isNaN(dPN) || isNaN(muN) || isNaN(LN) || AN === 0 || dPN === 0) return null;
        return { value: (qN * muN * LN / (C * AN * dPN)), unit: "mD" };
      }
      case "dP": {
        if (isNaN(qN) || isNaN(kN) || isNaN(AN) || isNaN(muN) || isNaN(LN) || kN === 0 || AN === 0) return null;
        return { value: (qN * muN * LN / (C * kN * AN)), unit: "psi" };
      }
      case "A": {
        if (isNaN(qN) || isNaN(kN) || isNaN(dPN) || isNaN(muN) || isNaN(LN) || kN === 0 || dPN === 0) return null;
        return { value: (qN * muN * LN / (C * kN * dPN)), unit: "ft2" };
      }
    }
  }, [solveFor, k, A, dP, mu, L, q]);

  const variables: { id: SolveFor; label: string; unit: string; value: string; setter: (v: string) => void }[] = [
    { id: "q", label: "Flow Rate (q)", unit: "bbl/day", value: q, setter: setQ },
    { id: "k", label: "Permeability (k)", unit: "mD", value: k, setter: setK },
    { id: "dP", label: "Pressure Drop (dP)", unit: "psi", value: dP, setter: setDP },
    { id: "A", label: "Cross-Sectional Area (A)", unit: "ft2", value: A, setter: setA },
  ];

  return (
    <div className="space-y-6">
      {/* Solve-for selector */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Solve for</p>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <button
              key={v.id}
              onClick={() => setSolveFor(v.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                solveFor === v.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900"
              }`}
            >
              {v.id}
            </button>
          ))}
        </div>
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {variables.filter((v) => v.id !== solveFor).map((v) => (
          <NumberInput key={v.id} label={v.label} value={v.value} onChange={v.setter} unit={v.unit} />
        ))}
        <NumberInput label="Viscosity (mu)" value={mu} onChange={setMu} unit="cp" />
        <NumberInput label="Length (L)" value={L} onChange={setL} unit="ft" />
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-blue-600 p-6 text-white"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">
            {variables.find((v) => v.id === solveFor)?.label}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black">
              {result.value < 0.01 || result.value > 1e7 ? result.value.toExponential(4) : parseFloat(result.value.toFixed(4)).toLocaleString()}
            </span>
            <span className="text-sm font-bold text-blue-200">{result.unit}</span>
            <CopyButton value={result.value.toString()} />
          </div>
        </motion.div>
      )}

      <FormulaBlock
        formula="q = (1.1271 x 10^-3) x k x A x dP / (mu x L)"
        description="Darcy's law in oilfield units. q in bbl/day, k in mD, A in ft2, dP in psi, mu in cp, L in ft."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Material Balance (Gas Reservoir P/Z)                            */
/* ------------------------------------------------------------------ */
function MaterialBalance() {
  const [dataPoints, setDataPoints] = useState<{ gp: string; p: string; z: string }[]>([
    { gp: "0", p: "4000", z: "0.85" },
    { gp: "5", p: "3500", z: "0.82" },
    { gp: "10", p: "3000", z: "0.78" },
    { gp: "15", p: "2500", z: "0.75" },
  ]);

  const chartData = useMemo(() => {
    const points = dataPoints
      .map((d) => ({ gp: parseFloat(d.gp), pz: parseFloat(d.p) / parseFloat(d.z) }))
      .filter((d) => !isNaN(d.gp) && !isNaN(d.pz) && isFinite(d.pz));

    if (points.length < 2) return { points, regression: [], ogip: null, piZi: null };

    // Linear regression: P/Z = (Pi/Zi) - (Pi/Zi)/G * Gp
    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.gp, 0);
    const sumY = points.reduce((s, p) => s + p.pz, 0);
    const sumXY = points.reduce((s, p) => s + p.gp * p.pz, 0);
    const sumX2 = points.reduce((s, p) => s + p.gp * p.gp, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const ogip = slope !== 0 ? -intercept / slope : null;
    const piZi = intercept;

    const regression = ogip && ogip > 0
      ? [{ gp: 0, pz: intercept }, { gp: ogip, pz: 0 }]
      : [{ gp: 0, pz: intercept }, { gp: Math.max(...points.map(p => p.gp)) * 1.5, pz: intercept + slope * Math.max(...points.map(p => p.gp)) * 1.5 }];

    return { points, regression, ogip: ogip && ogip > 0 ? ogip : null, piZi };
  }, [dataPoints]);

  const addPoint = () => setDataPoints([...dataPoints, { gp: "", p: "", z: "" }]);
  const removePoint = (i: number) => setDataPoints(dataPoints.filter((_, idx) => idx !== i));
  const updatePoint = (i: number, field: string, val: string) => {
    const newPoints = [...dataPoints];
    newPoints[i] = { ...newPoints[i], [field]: val };
    setDataPoints(newPoints);
  };

  return (
    <div className="space-y-6">
      {/* Data entry table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="pb-3 pr-3">Gp (Bscf)</th>
              <th className="pb-3 pr-3">P (psi)</th>
              <th className="pb-3 pr-3">Z</th>
              <th className="pb-3 pr-3">P/Z</th>
              <th className="pb-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dataPoints.map((dp, i) => {
              const pz = parseFloat(dp.p) / parseFloat(dp.z);
              return (
                <tr key={i}>
                  <td className="py-2 pr-3">
                    <input type="number" value={dp.gp} onChange={(e) => updatePoint(i, "gp", e.target.value)}
                      className="w-full h-10 bg-white border border-gray-100 rounded-lg px-3 text-sm font-bold outline-none focus:border-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </td>
                  <td className="py-2 pr-3">
                    <input type="number" value={dp.p} onChange={(e) => updatePoint(i, "p", e.target.value)}
                      className="w-full h-10 bg-white border border-gray-100 rounded-lg px-3 text-sm font-bold outline-none focus:border-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </td>
                  <td className="py-2 pr-3">
                    <input type="number" value={dp.z} onChange={(e) => updatePoint(i, "z", e.target.value)} step="0.01"
                      className="w-full h-10 bg-white border border-gray-100 rounded-lg px-3 text-sm font-bold outline-none focus:border-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </td>
                  <td className="py-2 pr-3 text-sm font-bold text-gray-500">
                    {!isNaN(pz) && isFinite(pz) ? pz.toFixed(1) : "---"}
                  </td>
                  <td className="py-2">
                    <button onClick={() => removePoint(i)} className="text-gray-300 hover:text-red-500 transition-colors text-xs font-bold">x</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={addPoint} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
        + Add Data Point
      </button>

      {/* Chart */}
      {chartData.points.length >= 2 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="gp"
                type="number"
                domain={[0, "auto"]}
                label={{ value: "Gp (Bscf)", position: "bottom", offset: 0, style: { fontSize: 11, fontWeight: 700, fill: "#9ca3af" } }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                dataKey="pz"
                type="number"
                domain={[0, "auto"]}
                label={{ value: "P/Z (psi)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fontWeight: 700, fill: "#9ca3af" } }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700 }}
                formatter={(val: unknown) => [Number(val).toFixed(1), "P/Z"]}
                labelFormatter={(label: unknown) => `Gp: ${label} Bscf`}
              />
              {/* Regression line */}
              <Line data={chartData.regression} dataKey="pz" type="linear" stroke="#2563eb" strokeWidth={2} strokeDasharray="8 4" dot={false} name="Trend" />
              {/* Data points */}
              {chartData.points.map((pt, i) => (
                <ReferenceDot key={i} x={pt.gp} y={pt.pz} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* OGIP result */}
      {chartData.ogip !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-blue-600 p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Original Gas In Place (OGIP)</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black">{chartData.ogip.toFixed(2)}</span>
            <span className="text-sm font-bold text-blue-200">Bscf</span>
            <CopyButton value={chartData.ogip.toFixed(2)} />
          </div>
          {chartData.piZi && (
            <p className="text-xs font-bold text-blue-200 mt-2">Pi/Zi = {chartData.piZi.toFixed(1)} psi</p>
          )}
        </motion.div>
      )}

      <FormulaBlock
        formula="P/Z = (Pi/Zi) - (Pi/Zi)/G x Gp"
        description="Gas material balance equation. Plot P/Z vs cumulative production (Gp). The x-intercept gives OGIP (G). Linear regression extrapolates the trend line."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Decline Curve Analysis                                          */
/* ------------------------------------------------------------------ */
function DeclineCurve() {
  const [qi, setQi] = useState("1000");
  const [di, setDi] = useState("0.1");
  const [b, setB] = useState("0.5");
  const [months, setMonths] = useState("60");

  const chartData = useMemo(() => {
    const qiN = parseFloat(qi), diN = parseFloat(di), bN = parseFloat(b), mN = parseInt(months);
    if (isNaN(qiN) || isNaN(diN) || isNaN(mN) || qiN <= 0 || diN <= 0 || mN <= 0) return [];

    const data = [];
    for (let t = 0; t <= mN; t++) {
      let qExp = qiN * Math.exp(-diN * t);
      let qHyp = isNaN(bN) || bN <= 0 ? qExp : qiN / Math.pow(1 + bN * diN * t, 1 / bN);
      let qHarm = qiN / (1 + diN * t);

      data.push({
        t,
        exponential: Math.max(0, qExp),
        hyperbolic: Math.max(0, qHyp),
        harmonic: Math.max(0, qHarm),
      });
    }
    return data;
  }, [qi, di, b, months]);

  // EUR calculation (trapezoidal for exponential)
  const eur = useMemo(() => {
    const qiN = parseFloat(qi), diN = parseFloat(di), mN = parseInt(months);
    if (isNaN(qiN) || isNaN(diN) || diN <= 0) return null;
    // EUR exponential = qi / di * (1 - e^(-di*t)) in months, convert to cumulative
    const eurExp = (qiN / diN) * (1 - Math.exp(-diN * mN)) * 30.44; // bbl (assuming daily rate * days/month)
    return eurExp;
  }, [qi, di, months]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NumberInput label="Initial Rate (qi)" value={qi} onChange={setQi} unit="bbl/d" />
        <NumberInput label="Decline Rate (Di)" value={di} onChange={setDi} unit="/month" />
        <NumberInput label="b Factor" value={b} onChange={setB} placeholder="0.5" />
        <NumberInput label="Duration" value={months} onChange={setMonths} unit="months" />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="t"
                label={{ value: "Time (months)", position: "bottom", offset: 0, style: { fontSize: 11, fontWeight: 700, fill: "#9ca3af" } }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                label={{ value: "Rate (bbl/day)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fontWeight: 700, fill: "#9ca3af" } }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700 }}
                formatter={(val: unknown) => [Number(val).toFixed(1) + " bbl/d"]}
                labelFormatter={(label: unknown) => `Month ${label}`}
              />
              <Line dataKey="exponential" stroke="#2563eb" strokeWidth={2} dot={false} name="Exponential" />
              <Line dataKey="hyperbolic" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Hyperbolic" />
              <Line dataKey="harmonic" stroke="#f59e0b" strokeWidth={2} dot={false} name="Harmonic" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-3 h-0.5 bg-blue-600 inline-block" /> Exponential</span>
            <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-3 h-0.5 bg-purple-500 inline-block" /> Hyperbolic</span>
            <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> Harmonic</span>
          </div>
        </div>
      )}

      {eur && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-blue-600 p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">EUR (Exponential)</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black">{(eur / 1000).toFixed(1)}</span>
            <span className="text-sm font-bold text-blue-200">Mstb</span>
            <CopyButton value={(eur / 1000).toFixed(1)} />
          </div>
        </motion.div>
      )}

      <FormulaBlock
        formula="Exponential: q(t) = qi x e^(-Di x t)  |  Hyperbolic: q(t) = qi / (1 + b x Di x t)^(1/b)  |  Harmonic: q(t) = qi / (1 + Di x t)"
        description="Arps decline equations. qi is initial rate, Di is nominal decline rate, b is the decline exponent (0 = exponential, 0 < b < 1 = hyperbolic, b = 1 = harmonic)."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Vogel's IPR                                                     */
/* ------------------------------------------------------------------ */
function VogelIPR() {
  const [pRes, setPRes] = useState("3000");
  const [qTest, setQTest] = useState("500");
  const [pTest, setPTest] = useState("2000");

  const chartData = useMemo(() => {
    const PR = parseFloat(pRes), QT = parseFloat(qTest), PT = parseFloat(pTest);
    if (isNaN(PR) || isNaN(QT) || isNaN(PT) || PR <= 0 || QT <= 0 || PT <= 0 || PT >= PR) return { curve: [], qMax: null };

    // Vogel: q/qmax = 1 - 0.2(Pwf/Pr) - 0.8(Pwf/Pr)^2
    // qmax = qtest / (1 - 0.2(Ptest/Pr) - 0.8(Ptest/Pr)^2)
    const ratio = PT / PR;
    const vogelRatio = 1 - 0.2 * ratio - 0.8 * ratio * ratio;
    if (vogelRatio <= 0) return { curve: [], qMax: null };
    const qMax = QT / vogelRatio;

    const curve = [];
    for (let i = 50; i >= 0; i--) {
      const pwf = (PR * i) / 50;
      const r = pwf / PR;
      const qo = qMax * (1 - 0.2 * r - 0.8 * r * r);
      curve.push({ pwf, qo: Math.max(0, qo) });
    }

    return { curve, qMax };
  }, [pRes, qTest, pTest]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberInput label="Reservoir Pressure (Pr)" value={pRes} onChange={setPRes} unit="psi" />
        <NumberInput label="Test Rate (qtest)" value={qTest} onChange={setQTest} unit="bbl/d" />
        <NumberInput label="Test Pressure (Pwf,test)" value={pTest} onChange={setPTest} unit="psi" />
      </div>

      {chartData.curve.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.curve} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="qo"
                type="number"
                domain={[0, "auto"]}
                label={{ value: "Flow Rate (bbl/day)", position: "bottom", offset: 0, style: { fontSize: 11, fontWeight: 700, fill: "#9ca3af" } }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                dataKey="pwf"
                type="number"
                domain={[0, "auto"]}
                label={{ value: "Pwf (psi)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fontWeight: 700, fill: "#9ca3af" } }}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700 }}
                formatter={(val: unknown, name: unknown) => [Number(val).toFixed(1) + (name === "qo" ? " bbl/d" : " psi")]}
              />
              <defs>
                <linearGradient id="iprGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area dataKey="pwf" stroke="#2563eb" strokeWidth={2.5} fill="url(#iprGrad)" dot={false} name="IPR Curve" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.qMax && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-blue-600 p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Absolute Open Flow (AOF / qmax)</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black">{chartData.qMax.toFixed(1)}</span>
            <span className="text-sm font-bold text-blue-200">bbl/day</span>
            <CopyButton value={chartData.qMax.toFixed(1)} />
          </div>
        </motion.div>
      )}

      <FormulaBlock
        formula="q/qmax = 1 - 0.2(Pwf/Pr) - 0.8(Pwf/Pr)^2"
        description="Vogel's empirical IPR equation for solution-gas drive reservoirs below bubble point. Requires one test point (qtest at Pwf,test) and reservoir pressure (Pr) to generate the full IPR curve."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function PetroCalcPage() {
  const [activeTab, setActiveTab] = useState<TabId>("converter");
  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFF] font-sans text-black overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link
              href="/programs/resources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors mb-4"
            >
              <IconArrowLeft size={14} />
              All Resources
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <IconActivity size={20} />
              </div>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">PetroCalc Suite</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Engineering Calculators
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-gray-500">
              Real-time petroleum engineering calculations. No sign-up, no server - everything runs in your browser.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                        : "bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-5 sm:p-8 lg:p-10 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">{activeTabData.label}</h2>
              <p className="text-sm font-medium text-gray-400 mt-1">{activeTabData.description}</p>
            </div>

            {activeTab === "converter" && <UnitConverter />}
            {activeTab === "darcy" && <DarcySolver />}
            {activeTab === "material" && <MaterialBalance />}
            {activeTab === "decline" && <DeclineCurve />}
            {activeTab === "ipr" && <VogelIPR />}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
