import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/network_provider.dart';

class TrafficMonitorScreen extends StatelessWidget {
  const TrafficMonitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NetworkProvider>();
    final isDark = provider.isDarkMode;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildHeader(provider),
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(child: _buildMetricCard(provider.tr('download'), provider.downloadMbps, const Color(0xFF06D6A0), Icons.download_rounded, isDark)),
            const SizedBox(width: 16),
            Expanded(child: _buildMetricCard(provider.tr('upload'), provider.uploadMbps, const Color(0xFF3B82F6), Icons.upload_rounded, isDark)),
          ],
        ),
        const SizedBox(height: 32),
        _buildChartSection(provider, isDark),
      ],
    );
  }

  Widget _buildHeader(NetworkProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          provider.tr('traffic'),
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: provider.isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        Text(
          provider.tr('traffic_desc'),
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
        ),
      ],
    );
  }

  Widget _buildMetricCard(String label, double value, Color color, IconData icon, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2)),
        boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
              Text(
                "${value.toStringAsFixed(2)} Mbps",
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChartSection(NetworkProvider provider, bool isDark) {
    return Container(
      height: 350,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("History (Real-time)", style: TextStyle(fontWeight: FontWeight.bold)),
              Row(
                children: [
                  _buildLegendDot(const Color(0xFF06D6A0), provider.tr('download')),
                  const SizedBox(width: 16),
                  _buildLegendDot(const Color(0xFF3B82F6), provider.tr('upload')),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: FlGridData(show: true, drawVerticalLine: false, horizontalInterval: 1, getDrawingHorizontalLine: (v) => FlLine(color: Colors.white.withValues(alpha: 0.05), strokeWidth: 1)),
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  _lineBarData(provider.downloadHistory, const Color(0xFF06D6A0)),
                  _lineBarData(provider.uploadHistory, const Color(0xFF3B82F6)),
                ],
                minY: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  LineChartBarData _lineBarData(List<double> history, Color color) {
    return LineChartBarData(
      spots: history.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
      isCurved: true,
      color: color,
      barWidth: 3,
      isStrokeCapRound: true,
      dotData: const FlDotData(show: false),
      belowBarData: BarAreaData(
        show: true,
        gradient: LinearGradient(
          colors: [color.withValues(alpha: 0.2), color.withValues(alpha: 0.0)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
    );
  }

  Widget _buildLegendDot(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
      ],
    );
  }
}
