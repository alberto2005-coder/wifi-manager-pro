import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/network_provider.dart';

class ToolsScreen extends StatefulWidget {
  const ToolsScreen({super.key});

  @override
  State<ToolsScreen> createState() => _ToolsScreenState();
}

class _ToolsScreenState extends State<ToolsScreen> {
  final _ipController = TextEditingController();
  String _generatedPass = "";

  void _generatePass() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#\$%^&*()_+';
    setState(() {
      _generatedPass = List.generate(20, (index) => chars[Random().nextInt(chars.length)]).join();
    });
  }

  @override
  void dispose() {
    _ipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NetworkProvider>();
    final isDark = provider.isDarkMode;

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        _buildHeader(provider),
        const SizedBox(height: 32),
        _buildPortScannerCard(provider, isDark),
        const SizedBox(height: 32),
        _buildPasswordGeneratorCard(provider, isDark),
        const SizedBox(height: 40),
      ],
    );
  }

  Widget _buildHeader(NetworkProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          provider.tr('adv_tools'),
          style: GoogleFonts.inter(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: provider.isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        const Text(
          "Professional analysis and security toolkit",
          style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
        ),
      ],
    );
  }

  Widget _buildPortScannerCard(NetworkProvider provider, bool isDark) {
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
              const Icon(Icons.radar_rounded, color: Color(0xFF06D6A0)),
              const SizedBox(width: 12),
              Text(provider.tr('port_scan_title'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 8),
          Text(provider.tr('port_scan_desc'), style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _ipController,
                  decoration: InputDecoration(
                    hintText: "Target IP (e.g. 192.168.1.1)",
                    filled: true,
                    fillColor: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.03),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: provider.isScanningPorts ? null : () => provider.scanPorts(_ipController.text),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF06D6A0),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(provider.isScanningPorts ? provider.tr('scanning') : provider.tr('scan_lan')),
              ),
            ],
          ),
          if (provider.openPorts.isNotEmpty) ...[
            const SizedBox(height: 20),
            Text(provider.tr('open_ports'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: provider.openPorts.map((p) => Chip(
                label: Text("PORT $p", style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                backgroundColor: const Color(0xFF06D6A0).withValues(alpha: 0.1),
                side: const BorderSide(color: Color(0xFF06D6A0)),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPasswordGeneratorCard(NetworkProvider provider, bool isDark) {
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
              const Icon(Icons.password_rounded, color: Color(0xFF8B5CF6)),
              const SizedBox(width: 12),
              Text(provider.tr('pass_gen'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 8),
          Text(provider.tr('pass_gen_desc'), style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.03),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _generatedPass.isEmpty ? "••••••••••••••••••••" : _generatedPass,
                    style: GoogleFonts.firaCode(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              IconButton(
                onPressed: _generatedPass.isEmpty ? null : () {
                  Clipboard.setData(ClipboardData(text: _generatedPass));
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.tr('copied'))));
                },
                icon: const Icon(Icons.copy),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _generatePass,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(provider.tr('pass_gen')),
            ),
          ),
        ],
      ),
    );
  }
}
