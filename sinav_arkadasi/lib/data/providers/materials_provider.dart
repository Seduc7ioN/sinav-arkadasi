import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/study_material.dart';
import '../models/question.dart';
import '../repositories/study_repo.dart';

final studyRepoProvider = Provider<StudyRepository>((ref) => StudyRepository());

final materialsProvider =
    AsyncNotifierProvider<MaterialsNotifier, List<StudyMaterial>>(
        MaterialsNotifier.new);

class MaterialsNotifier extends AsyncNotifier<List<StudyMaterial>> {
  @override
  Future<List<StudyMaterial>> build() async {
    return ref.watch(studyRepoProvider).getMaterials();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(studyRepoProvider).getMaterials(),
    );
  }

  Future<StudyMaterial> upload(String filePath, String title) async {
    final material =
        await ref.read(studyRepoProvider).uploadFile(filePath, title);
    await refresh();
    return material;
  }
}

class MaterialDetailNotifier
    extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final StudyRepository _repo;

  MaterialDetailNotifier(this._repo) : super(const AsyncLoading()) {}

  Future<void> load(String materialId) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _repo.getMaterialDetail(materialId));
  }

  Future<List<Question>> analyze(String materialId) async {
    final questions = await _repo.analyzeMaterial(materialId);
    await load(materialId);
    return questions;
  }
}

final materialDetailProvider = StateNotifierProvider.family<
    MaterialDetailNotifier,
    AsyncValue<Map<String, dynamic>>,
    String>((ref, materialId) {
  final notifier = MaterialDetailNotifier(ref.watch(studyRepoProvider));
  notifier.load(materialId);
  return notifier;
});
