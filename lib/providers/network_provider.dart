import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/wifi_service.dart';
import '../services/speed_test_service.dart';
import '../services/storage_service.dart';
import '../localization/app_localizations.dart';

import 'package:url_launcher/url_launcher.dart';

class NetworkProvider with ChangeNotifier {
  final WifiService _wifiService = WifiService();
  final SpeedTestService _speedService = SpeedTestService();
  final AppLocalizations _appLoc = AppLocalizations();

  List<NetworkModel> _savedNetworks = [];
  List<NetworkModel> _nearbyNetworks = [];
  List<DeviceModel> _devices = [];
  String? _currentSsid;
  String? _localIp;
  String? _gatewayIp;
  bool _isLoading = false;
  
  // Settings
  bool _hidePasswordsDefault = true;
  bool _isDarkMode = true;
  String _language = 'es';

  // Traffic Monitor Stats
  Timer? _trafficTimer;
  double _lastReceived = 0;
  double _lastSent = 0;
  double _downloadMbps = 0;
  double _uploadMbps = 0;
  List<double> downloadHistory = [];
  List<double> uploadHistory = [];

  // Getters
  List<NetworkModel> get savedNetworks => _savedNetworks;
  List<NetworkModel> get nearbyNetworks => _nearbyNetworks;
  List<DeviceModel> get devices => _devices;
  String? get currentSsid => _currentSsid;
  String? get localIp => _localIp;
  String? get gatewayIp => _gatewayIp;
  bool get isLoading => _isLoading;
  bool get hidePasswordsDefault => _hidePasswordsDefault;
  bool get isDarkMode => _isDarkMode;
  String get language => _language;
  double get downloadMbps => _downloadMbps;
  double get uploadMbps => _uploadMbps;

  NetworkProvider() {
    _initSettings();
    _startTrafficMonitor();
  }

  Future<void> _initSettings() async {
    _isDarkMode = await StorageService.isDarkMode();
    _language = await StorageService.getLanguage();
    _hidePasswordsDefault = await StorageService.shouldHidePasswords();
    await _appLoc.load(_language);
    notifyListeners();
  }

  String tr(String key) => _appLoc.translate(key);

  void _startTrafficMonitor() {
    _trafficTimer?.cancel();
    _trafficTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      final stats = await _wifiService.getNetworkStats();
      final rx = stats['received']!;
      final tx = stats['sent']!;

      if (_lastReceived > 0) {
        _downloadMbps = ((rx - _lastReceived) * 8) / (1024 * 1024);
        _uploadMbps = ((tx - _lastSent) * 8) / (1024 * 1024);
        
        downloadHistory.add(_downloadMbps);
        uploadHistory.add(_uploadMbps);
        if (downloadHistory.length > 30) downloadHistory.removeAt(0);
        if (uploadHistory.length > 30) uploadHistory.removeAt(0);
      }

      _lastReceived = rx;
      _lastSent = tx;
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _trafficTimer?.cancel();
    super.dispose();
  }

  // PORT SCANNER LOGIC
  List<int> openPorts = [];
  bool isScanningPorts = false;
  
  Future<void> scanPorts(String ip) async {
    isScanningPorts = true;
    openPorts.clear();
    notifyListeners();

    final List<int> commonPorts = [21, 22, 23, 25, 53, 80, 110, 443, 3306, 3389, 8080];
    
    for (int port in commonPorts) {
      try {
        final socket = await Socket.connect(ip, port, timeout: const Duration(milliseconds: 500));
        openPorts.add(port);
        await socket.close();
      } catch (_) {}
      notifyListeners();
    }

    isScanningPorts = false;
    notifyListeners();
  }

  // ANALYZER LOGIC
  Map<int, int> getChannelUsage() {
    Map<int, int> usage = {};
    for (var net in _nearbyNetworks) {
      if (net.channel != null) {
        int chan = int.tryParse(net.channel!) ?? 0;
        if (chan > 0) usage[chan] = (usage[chan] ?? 0) + 1;
      }
    }
    return usage;
  }

  double getSecurityScore() {
    if (_savedNetworks.isEmpty) return 100;
    int weak = 0;
    for (var net in _savedNetworks) {
      final auth = net.auth?.toUpperCase() ?? "";
      if (auth.contains("WEP") || auth.contains("WPA") && !auth.contains("WPA2") && !auth.contains("WPA3")) {
        weak++;
      }
      if (net.password != null && net.password!.length < 8) {
        weak++;
      }
    }
    double score = 100 - (weak * (100 / _savedNetworks.length));
    return score.clamp(0, 100);
  }

  Future<void> toggleHidePasswords() async {
    _hidePasswordsDefault = !_hidePasswordsDefault;
    await StorageService.setHidePasswords(_hidePasswordsDefault);
    notifyListeners();
  }

  Future<void> toggleDarkMode() async {
    _isDarkMode = !_isDarkMode;
    await StorageService.setDarkMode(_isDarkMode);
    notifyListeners();
  }

  Future<void> setLanguage(String lang) async {
    _language = lang;
    await _appLoc.load(lang);
    await StorageService.setLanguage(lang);
    notifyListeners();
  }

  Future<void> refresh() async {
    _isLoading = true;
    notifyListeners();

    _currentSsid = await _wifiService.getCurrentSSID();
    _localIp = await _wifiService.getLocalIP();
    _gatewayIp = await _wifiService.getGatewayIP();
    _savedNetworks = await _wifiService.getSavedNetworks();
    _nearbyNetworks = await _wifiService.scanNearby();
    
    ping = await _speedService.checkPing();

    _isLoading = false;
    notifyListeners();
  }

  Future<void> performFlushDNS() async {
    await _wifiService.flushDNS();
  }

  Future<void> scanForDevices() async {
    _isLoading = true;
    notifyListeners();
    _devices = await _wifiService.scanDevices();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> openRouterPanel() async {
    final gateway = _gatewayIp ?? await _wifiService.getGatewayIP();
    if (gateway == null) return;
    final url = Uri.parse('http://$gateway');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  // Speed test data
  double downloadSpeed = 0;
  double uploadSpeed = 0;
  int ping = 0;
  bool isTesting = false;

  void startSpeedTest() async {
    isTesting = true;
    downloadSpeed = 0;
    uploadSpeed = 0;
    ping = 0;
    notifyListeners();

    ping = await _speedService.checkPing();
    notifyListeners();

    await for (var speed in _speedService.runDownloadTest()) {
      downloadSpeed = speed;
      notifyListeners();
    }

    await for (var speed in _speedService.runUploadTest()) {
      uploadSpeed = speed;
      notifyListeners();
    }

    isTesting = false;
    notifyListeners();
  }

  Future<bool> connectToNetwork(String ssid, String password) async {
    _isLoading = true;
    notifyListeners();
    final success = await _wifiService.connectToNetwork(ssid, password);
    if (success) {
      await refresh();
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }

  Future<bool> forgetNetwork(String ssid) async {
    _isLoading = true;
    notifyListeners();
    final success = await _wifiService.deleteNetwork(ssid);
    if (success) {
      await refresh();
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }
}
