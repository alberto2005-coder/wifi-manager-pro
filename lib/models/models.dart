class NetworkModel {
  final String ssid;
  final String? password;
  final String? auth;
  final String? signal;
  final String? bssid;
  final String? channel;
  final String? band;

  NetworkModel({
    required this.ssid,
    this.password,
    this.auth,
    this.signal,
    this.bssid,
    this.channel,
    this.band,
  });
}

class DeviceModel {
  final String ip;
  final String mac;
  final String type;
  final String interface;

  DeviceModel({
    required this.ip,
    required this.mac,
    required this.type,
    required this.interface,
  });
}
