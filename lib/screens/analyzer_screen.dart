import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/network_provider.dart';

class AnalyzerScreen extends StatelessWidget {
  const AnalyzerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NetworkProvider>();
    final isDark = provider.isDarkMode;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildHeader(provider),
        const SizedBox(height: 32),
        _buildSecurityAuditCard(provider, isDark),
        const SizedBox(height: 32),
        _buildChannelMapCard(provider, isDark),
      ],
    );
  }

  Widget _buildHeader(NetworkProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          provider.tr('analyzer_title'),
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: provider.isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        Text(
          provider.tr('analyzer_desc'),
          style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
        ),
      ],
    );
  }

  Widget _buildSecurityAuditCard(NetworkProvider provider, bool isDark) {
    final score = provider.getSecurityScore();
    final color = score > 80 ? const Color(0xFF06D6A0) : (score > 50 ? Colors.orange : Colors.redAccent);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.shield_outlined, color: Color(0xFF8B5CF6)),
              const SizedBox(width: 12),
              Text(provider.tr('security_audit'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 80,
                    height: 80,
                    child: CircularProgressIndicator(
                      value: score / 100,
                      strokeWidth: 8,
                      color: color,
                      backgroundColor: color.withValues(alpha: 0.1),
                    ),
                  ),
                  Text("${score.toInt()}%", style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                ],
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(provider.tr('score'), style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(
                      score > 80 ? provider.tr('sec_audit_ok') : provider.tr('sec_audit_warn'),
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChannelMapCard(NetworkProvider provider, bool isDark) {
    final usage = provider.getChannelUsage();
    
    return Container(
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
            children: [
              const Icon(Icons.bar_chart_rounded, color: Color(0xFF06D6A0)),
              const SizedBox(width: 12),
              Text(provider.tr('channel_map'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, meta) => Text(v.toInt().toString(), style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                barGroups: usage.entries.map((e) => BarChartGroupData(
                  x: e.key,
                  barRods: [
                    BarChartRodData(
                      toY: e.value.toDouble(),
                      color: const Color(0xFF8B5CF6),
                      width: 14,
                      borderRadius: BorderRadius.circular(4),
                      backDrawRodData: BackgroundBarChartRodData(show: true, toY: 10, color: const Color(0xFF8B5CF6).withValues(alpha: 0.05)),
                    ),
                  ],
                )).toList(),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Center(child: Text(provider.tr('scan_desc'), style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)))),
        ],
      ),
    );
  }
}
