"use client";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMemo } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Doc } from "../../../../../convex/_generated/dataModel";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboardPage() {
  const kpis = useQuery(api.admin.getKPIs);
  const pending = useQuery(api.admin.pendingApprovals);
  const revenue = useQuery(api.admin.revenueByMonth);
  const topTutors = useQuery(api.admin.getTopTutors);
  const recentLessons = useQuery(api.admin.getRecentLessons);
  const newUsers = useQuery(api.admin.getNewUsers);

  const pie = useMemo(() => {
    if (!kpis) return [];
    return [
      { name: "Tutors", value: kpis.totalTutors },
      { name: "Students", value: kpis.totalStudents },
    ];
  }, [kpis]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {kpis &&
            [
              ["Total Users", kpis.totalUsers],
              ["Tutors", kpis.totalTutors],
              ["Students", kpis.totalStudents],
              ["Revenue", `$${kpis.totalRevenue / 100}`],
            ].map(([label, value], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <p className="text-sm text-gray-500">{label as string}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
              </motion.div>
            ))}
        </div>

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly revenue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Monthly Revenue
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenue ?? []}>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* User distribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              User Split
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {pie.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Tutors */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Top Tutors
            </h3>
            <div className="space-y-3">
              {topTutors?.map((tutor, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {tutor.tutorName}
                  </span>
                  <Badge variant="secondary">{tutor.lessonCount} lessons</Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Lessons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Recent Lessons
            </h3>
            <div className="space-y-4">
              {recentLessons?.map((lesson, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium text-gray-800">
                    {lesson.studentName} with {lesson.tutorName}
                  </p>
                  <p className="text-gray-500">
                    {format(new Date(lesson.datetime), "PPp")}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* New Users */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              New Users
            </h3>
            <div className="space-y-3">
              {newUsers?.map((user: Doc<"users">, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{user.name}</span>
                  <Badge
                    variant={user.role === "tutor" ? "default" : "outline"}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pending approvals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Pending Approvals ({pending?.length ?? 0})
          </h3>
          <div className="space-y-2">
            {pending?.slice(0, 5).map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <span className="font-medium text-gray-800">
                  {p.user?.name}
                </span>
                <Badge>{p.subjects?.[0]}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
