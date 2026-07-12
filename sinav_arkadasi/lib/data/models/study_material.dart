class StudyMaterial {
  final String id;
  final String userId;
  final String title;
  final String fileType;
  final String storagePath;
  final String status;
  final int pageCount;
  final String? errorMessage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int questionCount;

  StudyMaterial({
    required this.id,
    required this.userId,
    required this.title,
    required this.fileType,
    required this.storagePath,
    required this.status,
    required this.pageCount,
    this.errorMessage,
    required this.createdAt,
    required this.updatedAt,
    this.questionCount = 0,
  });

  factory StudyMaterial.fromJson(Map<String, dynamic> json) {
    return StudyMaterial(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      title: json['title'] ?? '',
      fileType: json['file_type'] ?? 'image',
      storagePath: json['storage_path'] ?? '',
      status: json['status'] ?? 'uploaded',
      pageCount: json['page_count'] ?? 1,
      errorMessage: json['error_message'],
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
      questionCount: json['question_count'] ?? 0,
    );
  }
}
