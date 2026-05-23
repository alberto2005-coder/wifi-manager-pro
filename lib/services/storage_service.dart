import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String keyHidePasswords = 'hide_passwords';
  static const String keyDarkMode = 'dark_mode';
  static const String keyLanguage = 'language';

  static Future<bool> shouldHidePasswords() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(keyHidePasswords) ?? true;
  }

  static Future<void> setHidePasswords(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(keyHidePasswords, value);
  }

  static Future<bool> isDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(keyDarkMode) ?? true;
  }

  static Future<void> setDarkMode(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(keyDarkMode, value);
  }

  static Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyLanguage) ?? 'es';
  }

  static Future<void> setLanguage(String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyLanguage, value);
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
