"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black tracking-wider uppercase text-[#D4AF37] mb-8 border-b border-zinc-800 pb-4">
          Order Ledger
        </h1>

        {loading ? (
          <div className="text-center font-mono text-zinc-500 uppercase tracking-widest py-20">Syncing Ledger...</div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-4 uppercase tracking-wider">Date</th>
                  <th className="p-4 uppercase tracking-wider">Customer</th>
                  <th className="p-4 uppercase tracking-wider">Total</th>
                  <th className="p-4 uppercase tracking-wider">Status</th>
                  <th className="p-4 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 text-zinc-300">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 truncate max-w-[150px]">{order.customer_email}</td>
                    <td className="p-4 text-[#D4AF37]">${order.total_amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest ${
                        order.status === 'processing' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-900' :
                        order.status === 'shipped' ? 'bg-blue-900/30 text-blue-500 border border-blue-900' :
                        'bg-green-900/30 text-green-500 border border-green-900'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-black border border-zinc-700 text-white text-xs uppercase tracking-widest p-2 rounded cursor-pointer outline-none focus:border-[#D4AF37]"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="p-10 text-center text-zinc-600 uppercase tracking-widest">
                No transactions recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}