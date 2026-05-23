import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/services.dart';

// RESTRUCTURED IMPORTS
import 'models/models.dart';
import 'providers/network_provider.dart';
import 'screens/analyzer_screen.dart';
import 'screens/traffic_screen.dart';
import 'screens/tools_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => NetworkProvider()..refresh(),
      child: const WifiManagerApp(),
    ),
  );
}

class WifiManagerApp extends StatelessWidget {
  const WifiManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NetworkProvider>();
    
    return MaterialApp(
      title: 'WiFi Manager Pro',
      debugShowCheckedModeBanner: false,
      themeMode: provider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: const Color(0xFF8B5CF6),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF8B5CF6),
          secondary: Color(0xFF10B981),
          surface: Colors.white,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF8B5CF6),
        scaffoldBackgroundColor: const Color(0xFF030712),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF8B5CF6),
          secondary: Color(0xFF06D6A0),
          surface: Color(0xFF0F1829),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NetworkProvider>();
    final isWide = MediaQuery.of(context).size.width > 1100;

    return Scaffold(
      bottomNavigationBar: !isWide
          ? BottomNavigationBar(
              currentIndex: _selectedIndex > 2 ? 0 : _selectedIndex,
              onTap: (idx) => setState(() => _selectedIndex = idx),
              backgroundColor: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
              selectedItemColor: const Color(0xFF8B5CF6),
              unselectedItemColor: const Color(0xFF64748B),
              type: BottomNavigationBarType.fixed,
              items: [
                BottomNavigationBarItem(
                  icon: const Icon(Icons.dashboard_rounded),
                  label: provider.tr('dashboard'),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.devices_rounded),
                  label: provider.tr('devices'),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.settings_rounded),
                  label: provider.tr('settings'),
                ),
              ],
            )
          : null,
      body: Row(
        children: [
          if (isWide)
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
              backgroundColor: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
              indicatorColor: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
              extended: true,
              leading: const Padding(
                padding: EdgeInsets.symmetric(vertical: 30),
                child: Icon(
                  Icons.wifi_tethering,
                  color: Color(0xFF8B5CF6),
                  size: 40,
                ),
              ),
              destinations: [
                NavigationRailDestination(
                  icon: const Icon(Icons.dashboard_rounded),
                  label: Text(provider.tr('dashboard')),
                ),
                NavigationRailDestination(
                  icon: const Icon(Icons.devices_rounded),
                  label: Text(provider.tr('devices')),
                ),
                NavigationRailDestination(
                  icon: const Icon(Icons.analytics_rounded),
                  label: Text(provider.tr('analyzer')),
                ),
                NavigationRailDestination(
                  icon: const Icon(Icons.show_chart_rounded),
                  label: Text(provider.tr('traffic')),
                ),
                NavigationRailDestination(
                  icon: const Icon(Icons.build_circle_rounded),
                  label: Text(provider.tr('adv_tools')),
                ),
                NavigationRailDestination(
                  icon: const Icon(Icons.settings_rounded),
                  label: Text(provider.tr('settings')),
                ),
              ],
            ),
          Expanded(
            child: Stack(
              children: [
                _buildBackgroundGradient(provider),
                SafeArea(child: _buildCurrentPage(provider, isWide)),
                if (provider.isLoading)
                  const Center(
                    child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackgroundGradient(NetworkProvider provider) {
    return Positioned(
      top: -150,
      left: 0,
      right: 0,
      child: Container(
        height: 500,
        decoration: BoxDecoration(
          gradient: RadialGradient(
            colors: [
              const Color(0xFF8B5CF6).withValues(alpha: provider.isDarkMode ? 0.15 : 0.1),
              Colors.transparent,
            ],
            radius: 1.5,
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentPage(NetworkProvider provider, bool isWide) {
    switch (_selectedIndex) {
      case 0: return _buildDashboard(provider, isWide);
      case 1: return _buildDevicesPage(provider);
      case 2: return const AnalyzerScreen();
      case 3: return const TrafficMonitorScreen();
      case 4: return const ToolsScreen();
      case 5: return _buildSettingsPage(provider);
      default: return _buildDashboard(provider, isWide);
    }
  }

  Widget _buildDashboard(NetworkProvider provider, bool isWide) {
    return RefreshIndicator(
      onRefresh: provider.refresh,
      color: const Color(0xFF8B5CF6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 3,
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                _buildHeader(provider),
                const SizedBox(height: 32),
                _buildStatusBar(provider),
                const SizedBox(height: 32),
                if (!isWide) ...[
                  _buildSpeedTestCard(provider),
                  const SizedBox(height: 32),
                  _buildToolBox(provider),
                  const SizedBox(height: 32),
                ],
                _buildSectionHeader(
                  provider.tr('saved_nets'),
                  provider.savedNetworks.length,
                ),
                const SizedBox(height: 16),
                _buildSavedNetworksGrid(provider.savedNetworks, isWide, provider.hidePasswordsDefault),
                const SizedBox(height: 32),
                _buildSectionHeader(
                  provider.tr('nearby_nets'),
                  provider.nearbyNetworks.length,
                ),
                const SizedBox(height: 16),
                _buildNearbyList(provider.nearbyNetworks, provider),
                const SizedBox(height: 40),
              ],
            ),
          ),
          if (isWide)
            Expanded(
              flex: 1,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(0, 24, 24, 24),
                children: [
                  _buildSpeedTestCard(provider),
                  const SizedBox(height: 24),
                  _buildToolBox(provider),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader(NetworkProvider provider) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'WiFi Manager Pro',
              style: GoogleFonts.inter(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: provider.isDarkMode ? Colors.white : Colors.black87,
              ),
            ),
            Text(
              provider.tr('connected'),
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
            ),
          ],
        ),
        IconButton(
          onPressed: provider.refresh,
          icon: const Icon(Icons.refresh),
          style: IconButton.styleFrom(
            backgroundColor: provider.isDarkMode ? const Color(0xFF162032) : Colors.black.withValues(alpha: 0.05),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBar(NetworkProvider provider) {
    return Container(
      decoration: BoxDecoration(
        color: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
        boxShadow: provider.isDarkMode ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            _buildStatItem(
              provider.tr('current_net'),
              provider.currentSsid ?? "—",
              highlight: true,
              isDarkMode: provider.isDarkMode,
            ),
            _buildVerticalDivider(provider.isDarkMode),
            _buildStatItem(provider.tr('local_ip'), provider.localIp ?? "—", isDarkMode: provider.isDarkMode),
            _buildVerticalDivider(provider.isDarkMode),
            _buildStatItem(
              "Ping",
              provider.ping > 0 ? "${provider.ping}ms" : "—",
              isDarkMode: provider.isDarkMode,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVerticalDivider(bool dark) =>
      VerticalDivider(color: dark ? Colors.white.withValues(alpha: 0.07) : Colors.black12, width: 1);

  Widget _buildStatItem(String label, String value, {bool highlight = false, required bool isDarkMode}) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 10,
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                color: highlight ? const Color(0xFF06D6A0) : (isDarkMode ? Colors.white : Colors.black87),
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, int count) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            count.toString(),
            style: const TextStyle(
              color: Color(0xFFC4B5FD),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSavedNetworksGrid(List<NetworkModel> networks, bool isWide, bool hideByDefault) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 400,
        mainAxisExtent: 180,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: networks.length,
      itemBuilder: (context, index) => _NetworkCard(
        network: networks[index],
        hideByDefault: hideByDefault,
        onQrTap: () => _showQrModal(context, networks[index]),
      ),
    );
  }

  Widget _buildNearbyList(List<NetworkModel> networks, NetworkProvider provider) {
    if (networks.isEmpty) {
      return Center(child: Text(provider.tr('nearby_nets')));
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: networks.length,
      itemBuilder: (context, index) {
        return _NearbyNetworkItem(network: networks[index], provider: provider);
      },
    );
  }

  Widget _buildSpeedTestCard(NetworkProvider provider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: provider.isDarkMode ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12)],
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.speed, color: Color(0xFF06D6A0)),
              const SizedBox(width: 12),
              Text(
                provider.tr('speed_test'),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSpeedMetric(
                provider.tr('download'),
                provider.downloadSpeed.toStringAsFixed(1),
                const Color(0xFF06D6A0),
              ),
              _buildSpeedMetric(
                provider.tr('upload'),
                provider.uploadSpeed.toStringAsFixed(1),
                const Color(0xFF3B82F6),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: provider.isTesting ? null : provider.startSpeedTest,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(provider.isTesting ? provider.tr('testing') : provider.tr('start_test')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeedMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
        ),
        Text(label, style: TextStyle(color: color, fontSize: 10)),
      ],
    );
  }

  Widget _buildToolBox(NetworkProvider provider) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: provider.isDarkMode ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            provider.tr('tools'),
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          _buildToolButton(
            provider.tr('flush_dns'),
            Icons.cleaning_services,
            () async {
              await provider.performFlushDNS();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(provider.tr('dns_success')),
                    backgroundColor: const Color(0xFF8B5CF6),
                  ),
                );
              }
            },
          ),
          _buildToolButton(provider.tr('scan_lan'), Icons.devices, () async {
            setState(() => _selectedIndex = 1);
            await provider.scanForDevices();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(provider.tr('lan_success')),
                  backgroundColor: const Color(0xFF10B981),
                ),
              );
            }
          }),
          _buildToolButton(
            provider.tr('router_panel'),
            Icons.router,
            () {
              if (provider.gatewayIp != null) {
                provider.openRouterPanel();
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(provider.tr('no_router'))),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildToolButton(String label, IconData icon, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, size: 18, color: const Color(0xFF8B5CF6)),
      title: Text(
        label,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        size: 16,
        color: Color(0xFF64748B),
      ),
    );
  }

  void _showQrModal(BuildContext context, NetworkModel network) {
    final provider = context.read<NetworkProvider>();
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: provider.tr('close'),
      barrierColor: Colors.black54,
      pageBuilder: (ctx, anim1, anim2) => Center(
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
              borderRadius: BorderRadius.circular(28),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  provider.tr('share_wifi'),
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 24),
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(12),
                  child: QrImageView(
                    data:
                        "WIFI:S:${network.ssid};T:${_mapAuthType(network.auth!)};P:${network.password};;",
                    version: QrVersions.auto,
                    size: 200.0,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  network.ssid,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(provider.tr('close')),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _mapAuthType(String auth) {
    if (auth.contains("WPA3")) return "WPA3";
    if (auth.contains("WPA2")) return "WPA2";
    return "WPA";
  }

  Widget _buildDevicesPage(NetworkProvider provider) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  provider.tr('devices'),
                  style: GoogleFonts.inter(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: provider.isDarkMode ? Colors.white : Colors.black87,
                  ),
                ),
                Text(
                  provider.tr('detected_devs'),
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                ),
              ],
            ),
            ElevatedButton.icon(
              onPressed: provider.isLoading ? null : provider.scanForDevices,
              icon: const Icon(Icons.search_rounded, size: 18),
              label: Text(provider.tr('scan_lan')),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
        if (provider.devices.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: Center(
              child: Text(
                provider.tr('no_devices'),
                style: const TextStyle(color: Color(0xFF64748B)),
              ),
            ),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 300,
              mainAxisExtent: 100,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: provider.devices.length,
            itemBuilder: (context, index) {
              final device = provider.devices[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                  boxShadow: provider.isDarkMode ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF06D6A0).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.laptop_chromebook_rounded,
                          color: Color(0xFF06D6A0), size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            device.ip,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            device.mac,
                            style: const TextStyle(
                                color: Color(0xFF64748B), fontSize: 11),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildSettingsPage(NetworkProvider provider) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(
          provider.tr('settings'),
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: provider.isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        const Text(
          "WiFi Manager Pro Config",
          style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
        ),
        const SizedBox(height: 32),
        _buildSettingsSection(provider, "General", [
          _buildSettingsTile(
              provider,
              provider.tr('dark_mode'), 
              provider.isDarkMode ? provider.tr('enabled') : provider.tr('disabled'), 
              Icons.dark_mode_rounded,
              trailing: Switch(
                value: provider.isDarkMode,
                onChanged: (_) => provider.toggleDarkMode(),
                activeThumbColor: const Color(0xFF8B5CF6),
              ),
          ),
          _buildSettingsTile(
              provider,
              provider.tr('language'), 
              provider.language == 'es' ? "Español" : "English", 
              Icons.language_rounded,
              trailing: DropdownButton<String>(
                value: provider.language,
                underline: const SizedBox(),
                dropdownColor: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
                items: const [
                  DropdownMenuItem(value: 'es', child: Text("ES", style: TextStyle(fontSize: 12))),
                  DropdownMenuItem(value: 'en', child: Text("EN", style: TextStyle(fontSize: 12))),
                ],
                onChanged: (val) => provider.setLanguage(val!),
              ),
          ),
        ]),
        const SizedBox(height: 24),
        _buildSettingsSection(provider, provider.tr('security'), [
          _buildSettingsTile(
            provider,
            provider.tr('hide_pass'), 
            provider.hidePasswordsDefault ? provider.tr('enabled') : provider.tr('disabled'), 
            Icons.security_rounded,
            trailing: Switch(
              value: provider.hidePasswordsDefault,
              onChanged: (_) => provider.toggleHidePasswords(),
              activeThumbColor: const Color(0xFF8B5CF6),
            ),
          ),
          _buildSettingsTile(
              provider,
              provider.tr('clear_cache'), provider.tr('cache_desc'), Icons.delete_sweep_rounded,
              onTap: () {
                provider.refresh();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Cache cleaned")),
                );
              }),
        ]),
        const SizedBox(height: 24),
        _buildSettingsSection(provider, provider.tr('version'), [
          _buildSettingsTile(
              provider,
              provider.tr('version'), "1.0.0 (Native Windows)", Icons.info_outline_rounded,
              trailing: const SizedBox.shrink()),
          _buildSettingsTile(
              provider,
              provider.tr('dev_by'), "GRGAME", Icons.code_rounded,
              trailing: const SizedBox.shrink()),
        ]),
        const SizedBox(height: 40),
      ],
    );
  }

  Widget _buildSettingsSection(NetworkProvider provider, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title,
            style: const TextStyle(
                color: Color(0xFF8B5CF6),
                fontWeight: FontWeight.bold,
                fontSize: 14),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: provider.isDarkMode ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10)],
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildSettingsTile(NetworkProvider provider, String title, String subtitle, IconData icon, {Widget? trailing, VoidCallback? onTap}) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: const Color(0xFF64748B), size: 20),
      title: Text(title,
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: provider.isDarkMode ? Colors.white : Colors.black87)),
      subtitle: Text(subtitle,
          style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 12)),
      trailing: trailing ?? const Icon(Icons.chevron_right, color: Color(0xFF1E293B), size: 18),
    );
  }
}

class _NetworkCard extends StatefulWidget {
  final NetworkModel network;
  final bool hideByDefault;
  final VoidCallback onQrTap;

  const _NetworkCard({required this.network, required this.hideByDefault, required this.onQrTap});

  @override
  State<_NetworkCard> createState() => _NetworkCardState();
}

class _NetworkCardState extends State<_NetworkCard> {
  late bool _obscure;

  @override
  void initState() {
    super.initState();
    _obscure = widget.hideByDefault;
  }

  @override
  void didUpdateWidget(_NetworkCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.hideByDefault != widget.hideByDefault) {
      _obscure = widget.hideByDefault;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NetworkProvider>();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: provider.isDarkMode ? const Color(0xFF1E293B).withValues(alpha: 0.4) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: provider.isDarkMode ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  widget.network.ssid,
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: provider.isDarkMode ? Colors.white : Colors.black87,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  widget.network.auth ?? "WPA2",
                  style: const TextStyle(
                    color: Color(0xFFC4B5FD),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: provider.isDarkMode ? Colors.black26 : Colors.black.withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _obscure
                        ? "••••••••"
                        : (widget.network.password ?? provider.tr('no_key')),
                    style: TextStyle(color: provider.isDarkMode ? Colors.white : Colors.black87),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    _obscure ? Icons.visibility_off : Icons.visibility,
                    size: 16,
                    color: const Color(0xFF64748B),
                  ),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
                IconButton(
                  icon: const Icon(Icons.copy, size: 16, color: Color(0xFF64748B)),
                  onPressed: () {
                    Clipboard.setData(
                      ClipboardData(text: widget.network.password ?? ""),
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(provider.tr('copied'))),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.qr_code, size: 16, color: Color(0xFF64748B)),
                  onPressed: widget.onQrTap,
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                  onPressed: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        backgroundColor: provider.isDarkMode ? const Color(0xFF0F1829) : Colors.white,
                        title: Text(provider.tr('security'), style: TextStyle(color: provider.isDarkMode ? Colors.white : Colors.black87)),
                        content: Text(
                          provider.language == 'es' 
                            ? "¿Deseas olvidar la red ${widget.network.ssid}?" 
                            : "Do you want to forget the network ${widget.network.ssid}?",
                          style: TextStyle(color: provider.isDarkMode ? Colors.white70 : Colors.black87),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, false), 
                            child: Text(provider.tr('close'))
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: Text(
                              provider.language == 'es' ? "Olvidar" : "Forget",
                              style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)
                            ),
                          ),
                        ],
                      ),
                    );
                    if (confirm == true) {
                      final ok = await provider.forgetNetwork(widget.network.ssid);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              ok 
                                ? (provider.language == 'es' ? "Red olvidada con éxito" : "Network forgotten successfully")
                                : (provider.language == 'es' ? "Error al olvidar la red" : "Error forgetting network")
                            ),
                            backgroundColor: ok ? const Color(0xFF10B981) : Colors.redAccent,
                          ),
                        );
                      }
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NearbyNetworkItem extends StatefulWidget {
  final NetworkModel network;
  final NetworkProvider provider;

  const _NearbyNetworkItem({required this.network, required this.provider});

  @override
  State<_NearbyNetworkItem> createState() => _NearbyNetworkItemState();
}

class _NearbyNetworkItemState extends State<_NearbyNetworkItem> {
  bool _expanded = false;
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final net = widget.network;
    final provider = widget.provider;
    final isDark = provider.isDarkMode;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F1829) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _expanded ? const Color(0xFF8B5CF6).withValues(alpha: 0.5) : Colors.transparent,
        ),
        boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
      ),
      child: Column(
        children: [
          ListTile(
            onTap: () => setState(() => _expanded = !_expanded),
            leading: const Icon(Icons.wifi, color: Color(0xFFF59E0B)),
            title: Text(
              net.ssid,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            subtitle: Text(
              "${net.auth} • ${provider.tr('signal')}: ${net.signal ?? '—'} • ${provider.tr('channel')}: ${net.channel ?? '?'}",
              style: const TextStyle(
                color: Color(0xFF64748B),
                fontSize: 12,
              ),
            ),
            trailing: Icon(
              _expanded ? Icons.expand_less : Icons.expand_more,
              color: const Color(0xFF64748B),
            ),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: TextField(
                        controller: _passwordController,
                        obscureText: _obscure,
                        style: const TextStyle(fontSize: 13),
                        decoration: InputDecoration(
                          hintText: provider.language == 'es' ? "Contraseña" : "Password",
                          hintStyle: const TextStyle(fontSize: 13),
                          filled: true,
                          fillColor: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.03),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, size: 16),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: provider.isLoading
                        ? null
                        : () async {
                            final pass = _passwordController.text;
                            if (pass.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    provider.language == 'es' 
                                      ? "Por favor, introduce la contraseña" 
                                      : "Please enter the password"
                                  ),
                                  backgroundColor: Colors.redAccent,
                                ),
                              );
                              return;
                            }
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  provider.language == 'es'
                                    ? "Intentando conectar a ${net.ssid}..."
                                    : "Attempting to connect to ${net.ssid}..."
                                ),
                              ),
                            );
                            final success = await provider.connectToNetwork(net.ssid, pass);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    success
                                      ? (provider.language == 'es' ? "Conectado correctamente" : "Connected successfully")
                                      : (provider.language == 'es' ? "Error al conectar" : "Connection failed")
                                  ),
                                  backgroundColor: success ? const Color(0xFF10B981) : Colors.redAccent,
                                ),
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B5CF6),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    child: Text(
                      provider.language == 'es' ? "Conectar" : "Connect",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
