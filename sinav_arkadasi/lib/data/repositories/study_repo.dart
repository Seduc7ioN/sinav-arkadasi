import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';
import '../models/study_material.dart';
import '../models/question.dart';

class StudyRepository {
  final SupabaseClient _client = Supabase.instance.client;

  String get _token => _client.auth.currentSession?.accessToken ?? '';

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      };

  Future<List<StudyMaterial>> getMaterials() async {
    final response = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/materials'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Materyaller alınamadı: ${response.body}');
    }

    final data = jsonDecode(response.body);
    return (data['materials'] as List)
        .map((m) => StudyMaterial.fromJson(m))
        .toList();
  }

  Future<StudyMaterial> uploadFile({
    required String filePath,
    Uint8List? fileBytes,
    required String fileName,
    String? mimeType,
    required String title,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/upload'),
    );

    request.headers['Authorization'] = 'Bearer $_token';
    request.fields['title'] = title;

    if (fileBytes != null) {
      request.files.add(
        http.MultipartFile.fromBytes(
          'file',
          fileBytes,
          filename: fileName,
        ),
      );
    } else {
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
    }

    final response = await request.send();
    final body = await response.stream.bytesToString();

    if (response.statusCode != 200) {
      throw Exception('Dosya yüklenemedi: $body');
    }

    final data = jsonDecode(body);
    return StudyMaterial.fromJson(data['material']);
  }

  Future<Map<String, dynamic>> getMaterialDetail(String materialId) async {
    final response = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/$materialId'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Materyal detayı alınamadı: ${response.body}');
    }

    final data = jsonDecode(response.body);
    return {
      'material': StudyMaterial.fromJson(data['material']),
      'questions':
          (data['questions'] as List).map((q) => Question.fromJson(q)).toList(),
    };
  }

  Future<List<Question>> analyzeMaterial(String materialId) async {
    final response = await http.post(
      Uri.parse('${AppConstants.apiBaseUrl}/api/study/analyze'),
      headers: _headers,
      body: jsonEncode({'materialId': materialId}),
    );

    if (response.statusCode != 200) {
      throw Exception('Analiz başarısız: ${response.body}');
    }

    final data = jsonDecode(response.body);
    return (data['questions'] as List)
        .map((q) => Question.fromJson(q))
        .toList();
  }
}
