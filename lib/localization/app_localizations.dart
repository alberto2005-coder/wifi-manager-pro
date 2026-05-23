import 'dart:convert';
import 'dart:developer' as developer;
import 'package:flutter/services.dart';

class AppLocalizations {
  Map<String, String> _localizedStrings = {};

  Future<void> load(String langCode) async {
    try {
      String jsonString = await rootBundle.loadString('assets/lang/$langCode.json');
      Map<String, dynamic> jsonMap = json.decode(jsonString);
      _localizedStrings = jsonMap.map((key, value) => MapEntry(key, value.toString()));
    } catch (e) {
      developer.log("Error loading localization: $e");
    }
  }

  String translate(String key) {
    return _localizedStrings[key] ?? key;
  }
}
