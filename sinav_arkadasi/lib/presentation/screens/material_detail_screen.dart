import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/models/question.dart';
import '../../data/models/study_material.dart';
import '../../data/providers/materials_provider.dart';
import '../widgets/question_card.dart';

class MaterialDetailScreen extends ConsumerStatefulWidget {
  final String materialId;

  const MaterialDetailScreen({super.key, required this.materialId});

  @override
  ConsumerState<MaterialDetailScreen> createState() =>
      _MaterialDetailScreenState();
}

class _MaterialDetailScreenState extends ConsumerState<MaterialDetailScreen> {
  bool _analyzing = false;

  Future<void> _startAnalysis() async {
    setState(() => _analyzing = true);
    try {
      final notifier =
          ref.read(materialDetailProvider(widget.materialId).notifier);
      await notifier.analyze(widget.materialId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Analiz hatası: $e'),
              backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _analyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(materialDetailProvider(widget.materialId));

    return Scaffold(
      appBar: AppBar(title: const Text('Materyal Detayı')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
              const SizedBox(height: 12),
              Text('Bir hata oluştu',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(err.toString(),
                  style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        data: (data) {
          final material = data['material'] as StudyMaterial;
          final questions = data['questions'] as List<Question>;

          if (material.status == 'uploaded') {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.psychology,
                        size: 64,
                        color: AppTheme.primary.withOpacity(0.3)),
                    const SizedBox(height: 16),
                    Text('Analize hazır',
                        style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 8),
                    Text(
                      'AI, bu materyaldeki önemli noktaları\ntespit edip soru çıkaracak',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _analyzing ? null : _startAnalysis,
                      child: _analyzing
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Analiz Et'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (material.status == 'processing') {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('AI analiz ediyor...'),
                  SizedBox(height: 4),
                  Text('Bu işlem birkaç saniye sürebilir',
                      style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            );
          }

          if (material.status == 'failed') {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 48, color: AppTheme.error),
                    const SizedBox(height: 12),
                    Text('Analiz başarısız',
                        style: Theme.of(context).textTheme.titleLarge),
                    if (material.errorMessage != null) ...[
                      const SizedBox(height: 4),
                      Text(material.errorMessage!,
                          style: Theme.of(context).textTheme.bodySmall,
                          textAlign: TextAlign.center),
                    ],
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _analyzing ? null : _startAnalysis,
                      child: const Text('Tekrar Dene'),
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) =>
                QuestionCard(question: questions[index], index: index),
          );
        },
      ),
    );
  }
}
