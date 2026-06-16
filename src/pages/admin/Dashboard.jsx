/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ScreenLoader } from '../../components/common/UiStates';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0, users: 0 });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/sales-stats')
        ]);
        setStats(statsRes.data);
        setSalesData(salesRes.data.monthlySales || []);
        setTopProducts(salesRes.data.topProducts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <ScreenLoader label="Memuat dashboard..." />;

  const statCards = [
    {
      label: 'Categories',
      value: stats.categories.toLocaleString('id-ID'),
      icon: FolderTree,
      color: 'text-[#00BFA5]',
      bg: 'from-[#00BFA5]/10 to-transparent'
    },
    {
      label: 'Products',
      value: stats.products.toLocaleString('id-ID'),
      icon: Package,
      color: 'text-blue-400',
      bg: 'from-blue-500/10 to-transparent'
    },
    {
      label: 'Orders',
      value: stats.orders.toLocaleString('id-ID'),
      icon: ShoppingCart,
      color: 'text-purple-400',
      bg: 'from-purple-500/10 to-transparent'
    },
    {
      label: 'Users',
      value: stats.users.toLocaleString('id-ID'),
      icon: Users,
      color: 'text-amber-400',
      bg: 'from-amber-500/10 to-transparent'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00BFA5]/20 blur-xl rounded-2xl" />
          <div className="relative bg-[#00BFA5]/10 border border-[#00BFA5]/30 p-3 rounded-2xl">
            <LayoutDashboard size={28} className="text-[#00BFA5]" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-[-1px]">DASHBOARD</h1>
          <p className="text-[#2a3a3a] text-sm">
            Selamat datang kembali, <span className="text-white font-semibold">{user?.full_name}</span>
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative bg-[#14141E] border border-white/5 rounded-3xl p-6 overflow-hidden hover:border-[#00BFA5]/30 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Subtle gradient background */}
            <div className={`absolute inset-0 bg-linear-to-br ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#00BFA5]/30 transition-colors`}>
                <card.icon size={26} className={card.color} />
              </div>
              <span className="text-[10px] font-black tracking-[2px] uppercase text-white/40">{card.label}</span>
            </div>

            <p className="text-5xl font-black text-white tracking-tighter mb-1">
              {card.value}
            </p>
            <p className="text-xs text-[#00BFA5]/70 font-medium">+12% dari bulan lalu</p>

            {/* Decorative line */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-[#00BFA5]/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-[#14141E] border border-white/5 rounded-3xl p-6 xl:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#00BFA5]/10 p-2 rounded-xl">
                <TrendingUp size={22} className="text-[#00BFA5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Penjualan Bulanan</h2>
                <p className="text-xs text-[#2a3a3a]">Total Revenue (Rp)</p>
              </div>
            </div>
            <div className="text-xs px-3 py-1.5 bg-[#00BFA5]/10 text-[#00BFA5] rounded-full font-medium">
              LIVE
            </div>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="month"
                stroke="#ffffff30"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#ffffff30"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0, 191, 165, 0.15)'
                }}
              />
              <Line
                type="natural"
                dataKey="total"
                stroke="#00BFA5"
                strokeWidth={3}
                dot={{ fill: '#00BFA5', r: 4 }}
                activeDot={{ r: 6, fill: '#00BFA5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-[#14141E] border border-white/5 rounded-3xl p-6 xl:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#00BFA5]/10 p-2 rounded-xl">
              <Package size={22} className="text-[#00BFA5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Top 5 Produk Terlaris</h2>
              <p className="text-xs text-[#2a3a3a]">Berdasarkan jumlah terjual</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 25, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                type="number"
                stroke="#ffffff30"
                fontSize={11}
                tickFormatter={(v) => `${v} pcs`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#ffffff30"
                fontSize={11}
                width={95}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} pcs`, 'Terjual']}
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: 'none',
                  borderRadius: '12px'
                }}
              />
              <Bar
                dataKey="quantity"
                fill="#00BFA5"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decorative subtle grid (mirip Login) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-[-1]"
        style={{
          backgroundImage: `linear-gradient(#00BFA5 1px, transparent 1px), linear-gradient(90deg, #00BFA5 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
    </div>
  );
}