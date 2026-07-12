class Question {
  final String id;
  final String materialId;
  final String questionText;
  final List<String> options;
  final int correctOption;
  final String explanation;
  final String difficulty;

  Question({
    required this.id,
    required this.materialId,
    required this.questionText,
    required this.options,
    required this.correctOption,
    required this.explanation,
    required this.difficulty,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] ?? '',
      materialId: json['material_id'] ?? '',
      questionText: json['question_text'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctOption: json['correct_option'] ?? 0,
      explanation: json['explanation'] ?? '',
      difficulty: json['difficulty'] ?? 'medium',
    );
  }
}
