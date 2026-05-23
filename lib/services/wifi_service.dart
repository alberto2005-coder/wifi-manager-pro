import 'dart:io';
import 'dart:convert';
import 'dart:developer' as developer;
import 'package:network_info_plus/network_info_plus.dart';
import '../models/models.dart';

class WifiService {
  final _info = NetworkInfo();

  Future<String?> getLocalIP() async {
    try {
      final interfaces = await NetworkInterface.list(type: InternetAddressType.IPv4);
      for (var interface in interfaces) {
        final name = interface.name.toLowerCase();
        if (name.contains("virtual") || name.contains("vbox") || name.contains("vmware")) continue;
        
        for (var addr in interface.addresses) {
          final ip = addr.address;
          if (ip.startsWith("192.168.56.") || ip.startsWith("169.254.")) continue;
          if (!addr.isLoopback) return ip;
        }
      }
    } catch (_) {}
    return await _info.getWifiIP();
  }

  Future<String?> getCurrentSSID() async {
    try {
      final result = await Process.run('netsh', ['wlan', 'show', 'interfaces']);
      final output = result.stdout as String;
      final match = RegExp(r"SSID\s*:\s*(.+)").firstMatch(output);
      if (match != null) return match.group(1)?.trim();
    } catch (_) {}
    return await _info.getWifiName();
  }

  Future<List<NetworkModel>> getSavedNetworks() async {
    return await _getWindowsSavedNetworks();
  }

  Future<List<NetworkModel>> _getWindowsSavedNetworks() async {
    try {
      final result = await Process.run('netsh', ['wlan', 'show', 'profiles']);
      final output = result.stdout as String;
      final profileMatches = RegExp(r"(?:Perfil de todos los usuarios|All User Profile|Perfil de usuario|User Profile)\s*:\s*(.+)")
          .allMatches(output);

      List<NetworkModel> networks = [];
      for (var match in profileMatches) {
        final name = (match.group(1) ?? "").trim();
        if (name.isEmpty) continue;

        final detailResult = await Process.run('netsh', [
          'wlan',
          'show',
          'profiles',
          'name=$name',
          'key=clear',
        ]);
        final detail = detailResult.stdout as String;

        final authMatch = RegExp(r"Autenticaci.*:\s*(.+)", caseSensitive: false).allMatches(detail);
        String auth = "WPA2";
        if (authMatch.isNotEmpty) {
          final allAuths = authMatch.map((m) => m.group(1)?.trim() ?? "").join(" ");
          if (allAuths.contains("WPA3") && allAuths.contains("WPA2")) {
            auth = "WPA2/WPA3";
          } else {
            auth = authMatch.first.group(1)?.trim() ?? "WPA2";
          }
        }
        
        auth = auth.replaceAll("-Personal", "").replaceAll("Personal", "").trim();

        final passMatch = RegExp(r"(?:Contenido de la clave|Key Content)\s*:\s*(.+)", caseSensitive: false)
            .firstMatch(detail);
        final password = (passMatch?.group(1) ?? "").trim();

        networks.add(NetworkModel(
          ssid: name,
          password: password.isNotEmpty ? password : null,
          auth: auth,
        ));
      }
      return networks;
    } catch (e) {
      return [];
    }
  }

  Future<String?> getGatewayIP() async {
    try {
      final result = await Process.run('ipconfig', []);
      final output = result.stdout as String;
      final match = RegExp(r"(?:Puerta de enlace predeterminada|Default Gateway)(?:\s|\.)*:\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)", caseSensitive: false)
          .allMatches(output);
      
      for (var m in match) {
        final ip = m.group(1);
        if (ip != null && ip.trim().isNotEmpty && ip != "0.0.0.0") return ip.trim();
      }

      final localIp = await getLocalIP();
      if (localIp != null && localIp.contains('.')) {
        return '${localIp.substring(0, localIp.lastIndexOf('.'))}.1';
      }
    } catch (_) {}
    return null;
  }

  Future<List<NetworkModel>> scanNearby() async {
    try {
      developer.log(">>> Consultando redes cercanas (Caché Windows)...");
      final result = await Process.run('netsh', ['wlan', 'show', 'networks', 'mode=bssid']);
      final output = result.stdout as String;
      final lines = output.split('\n');
      
      Map<String, NetworkModel> networkMap = {};
      NetworkModel? current;
      
      final ssidRegex = RegExp(r"SSID\s*\d*\s*:\s*(.*)", caseSensitive: false);

      for (var line in lines) {
        final trimmed = line.trim();
        if (trimmed.isEmpty) continue;
        if (trimmed.startsWith("BSSID")) continue;

        if (trimmed.toUpperCase().startsWith("SSID")) {
          final match = ssidRegex.firstMatch(trimmed);
          if (match != null) {
            if (current != null) _addOrUpdate(networkMap, current);
            final name = match.group(1)?.trim() ?? "Red Oculta";
            current = NetworkModel(ssid: name.isEmpty ? "Red Oculta" : name, auth: "N/A", signal: "—");
            continue;
          }
        } 
        
        if (current != null) {
          final lowerLine = trimmed.toLowerCase();
          if (lowerLine.contains("autentic") || lowerLine.contains("auth")) {
            String auth = trimmed.split(':').last.trim();
            auth = auth.replaceAll("-Personal", "").replaceAll("Personal", "").trim();
            current = NetworkModel(
              ssid: current.ssid, auth: auth, signal: current.signal,
              channel: current.channel, band: current.band
            );
          } 
          if (lowerLine.contains("canal") || lowerLine.contains("channel")) {
            final chan = trimmed.split(':').last.trim();
            current = NetworkModel(
              ssid: current.ssid, auth: current.auth, signal: current.signal,
              channel: chan, band: current.band
            );
          }
          if (lowerLine.contains("banda") || lowerLine.contains("band")) {
            final band = trimmed.split(':').last.trim();
            current = NetworkModel(
              ssid: current.ssid, auth: current.auth, signal: current.signal,
              channel: current.channel, band: band
            );
          }
          if (trimmed.contains("%")) {
            final match = RegExp(r"(\d+)%").firstMatch(trimmed);
            if (match != null) {
              final newSigStr = "${match.group(1)}%";
              int oldVal = int.tryParse(current.signal!.replaceAll('%', '').trim()) ?? 0;
              int newVal = int.tryParse(match.group(1)!) ?? 0;
              if (newVal > oldVal) {
                current = NetworkModel(
                  ssid: current.ssid, auth: current.auth, signal: newSigStr,
                  channel: current.channel, band: current.band
                );
              }
            }
          }
        }
      }
      if (current != null) _addOrUpdate(networkMap, current);
      
      final sortedList = networkMap.values.toList();
      sortedList.sort((a, b) {
        int sigA = int.tryParse(a.signal!.replaceAll('%', '').trim()) ?? 0;
        int sigB = int.tryParse(b.signal!.replaceAll('%', '').trim()) ?? 0;
        return sigB.compareTo(sigA);
      });

      developer.log(">>> Total de redes únicas encontradas: ${sortedList.length}");
      return sortedList;
    } catch (e) {
      developer.log(">>> ERROR en scanNearby: $e");
      return [];
    }
  }

  void _addOrUpdate(Map<String, NetworkModel> map, NetworkModel net) {
    if (!map.containsKey(net.ssid)) {
      map[net.ssid] = net;
    } else {
      int cSig = int.tryParse(map[net.ssid]!.signal!.replaceAll('%', '').trim()) ?? 0;
      int nSig = int.tryParse(net.signal!.replaceAll('%', '').trim()) ?? 0;
      if (nSig > cSig) map[net.ssid] = net;
    }
  }

  Future<void> flushDNS() async {
    await Process.run('ipconfig', ['/flushdns']);
  }

  Future<List<DeviceModel>> scanDevices() async {
    List<DeviceModel> devices = [];
    try {
      final result = await Process.run('arp', ['-a']);
      final output = result.stdout as String;
      final lines = output.split('\n');

      for (var line in lines) {
        final match = RegExp(r"(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]{17}|[0-9a-fA-F:]{17})\s+(\w+)")
            .firstMatch(line);
        if (match != null) {
          final ip = match.group(1)!;
          final type = match.group(3)!.toLowerCase();
          
          if (ip.startsWith("224.") || ip.startsWith("239.") || ip.endsWith(".255") || ip == "255.255.255.255") continue;
          if (!type.contains("din") && !type.contains("dyn")) continue;

          devices.add(DeviceModel(
            ip: ip,
            mac: match.group(2)!.toUpperCase(),
            type: "Dinamico",
            interface: "LAN",
          ));
        }
      }
    } catch (_) {}
    return devices;
  }

  Future<Map<String, double>> getNetworkStats() async {
    try {
      final result = await Process.run('netsh', ['interface', 'ipv4', 'show', 'subinterfaces']);
      final output = result.stdout as String;
      final lines = output.split('\n');
      
      double received = 0;
      double sent = 0;
      
      final regex = RegExp(r'^\s*\d+\s+\d+\s+(\d+)\s+(\d+)\s+(.+)$');
      for (var line in lines) {
        final match = regex.firstMatch(line.trim());
        if (match != null) {
          final interfaceName = match.group(3)!.toLowerCase();
          if (interfaceName.contains('loopback')) continue;
          received += double.tryParse(match.group(1)!) ?? 0;
          sent += double.tryParse(match.group(2)!) ?? 0;
        }
      }
      return {'received': received, 'sent': sent};
    } catch (_) {
      return {'received': 0, 'sent': 0};
    }
  }

  Future<bool> connectToNetwork(String ssid, String password) async {
    try {
      final hexSsid = utf8.encode(ssid).map((b) => b.toRadixString(16).padLeft(2, '0')).join();
      final xmlProfile = '''<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
	<name>$ssid</name>
	<SSIDConfig>
		<SSID>
			<hex>$hexSsid</hex>
			<name>$ssid</name>
		</SSID>
	</SSIDConfig>
	<connectionType>ESS</connectionType>
	<connectionMode>auto</connectionMode>
	<MSM>
		<security>
			<authEncryption>
				<authentication>WPA2PSK</authentication>
				<encryption>AES</encryption>
				<useOneX>false</useOneX>
			</authEncryption>
			<sharedKey>
				<keyType>passPhrase</keyType>
				<protected>false</protected>
				<keyMaterial>$password</keyMaterial>
			</sharedKey>
		</security>
	</MSM>
</WLANProfile>''';

      final tempDir = Directory.systemTemp;
      final tempFile = File('${tempDir.path}${Platform.pathSeparator}wifi_profile.xml');
      await tempFile.writeAsString(xmlProfile, encoding: utf8);

      final addResult = await Process.run('netsh', ['wlan', 'add', 'profile', 'filename=${tempFile.path}']);
      try {
        await tempFile.delete();
      } catch (_) {}

      if (addResult.exitCode != 0 || (addResult.stdout as String).toLowerCase().contains('error')) {
        return false;
      }

      final connectResult = await Process.run('netsh', ['wlan', 'connect', 'name=$ssid']);
      return connectResult.exitCode == 0;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteNetwork(String ssid) async {
    try {
      final result = await Process.run('netsh', ['wlan', 'delete', 'profile', 'name=$ssid']);
      return result.exitCode == 0;
    } catch (_) {
      return false;
    }
  }
}
