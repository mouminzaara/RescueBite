import React from 'react';
import PageContainer from '../components/PageContainer';
import MetricCard from '../components/MetricCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

/**
 * Impact dashboard showing rescued meals, food saved, money saved, waste prevented.
 * Pulls data from props passed down from App (foodItems, reservations).
 */
export default function Impact({ foodItems = [], reservations = [] }) {
  // Compute metrics (fallback to example values if data missing)
  const mealsRescued = reservations.reduce((sum, r) => sum + (r.quantity || 1), 0);
  const moneySaved = reservations.reduce((sum, r) => {
    const original = r.originalPrice || 0;
    const rescued = r.price || 0;
    return sum + (original - rescued) * (r.quantity || 1);
  }, 0);
  // Assume average 0.3 kg per rescued meal
  const foodSavedKg = mealsRescued * 0.3;
  const wastePreventedKg = foodSavedKg;

  // Prepare data for "Meals rescued over time" chart
  const chartData = reservations
    .map((r) => ({
      date: new Date(r.created_at || Date.now()).toLocaleDateString(),
      quantity: r.quantity || 1,
    }))
    .reduce((acc, cur) => {
      const existing = acc.find((d) => d.date === cur.date);
      if (existing) {
        existing.quantity += cur.quantity;
      } else {
        acc.push({ date: cur.date, quantity: cur.quantity });
      }
      return acc;
    }, []);

  return (
    <PageContainer maxWidth="normal">
      <h1 className="text-2xl font-extrabold text-[#1C2A23] mb-6">RescueBite Impact</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Meals Rescued" value={mealsRescued} />
        <MetricCard title="Food Saved" value={foodSavedKg.toFixed(1)} unit="kg" />
        <MetricCard title="Money Saved" value={moneySaved.toFixed(0)} unit="₹" />
        <MetricCard title="Waste Prevented" value={wastePreventedKg.toFixed(1)} unit="kg" />
      </div>
      <h2 className="text-xl font-bold text-[#1C2A23] mb-4">Meals Rescued Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6D9C5" />
          <XAxis dataKey="date" stroke="#5C6A62" />
          <YAxis stroke="#5C6A62" />
          <Tooltip />
          <Line type="monotone" dataKey="quantity" stroke="#285C46" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </PageContainer>
  );
}
