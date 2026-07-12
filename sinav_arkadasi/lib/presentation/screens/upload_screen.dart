import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme.dart';
import '../../data/providers/materials_provider.dart';

class UploadScreen extends ConsumerStatefulWidget {
  const UploadScreen({super.key});

  @override
  ConsumerState<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends ConsumerState<UploadScreen> {
  final _picker = ImagePicker();
  final _titleCtrl = TextEditingController();
  String? _filePath;
  String? _fileName;
  bool _uploading = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickFromCamera() async {
    final file = await _picker.pickImage(source: ImageSource.camera);
    if (file != null) {
      setState(() {
        _filePath = file.path;
        _fileName = file.name;
        if (_titleCtrl.text.isEmpty) {
          _titleCtrl.text = file.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        }
      });
    }
  }

  Future<void> _pickFromGallery() async {
    final file = await _picker.pickImage(source: ImageSource.gallery);
    if (file != null) {
      setState(() {
        _filePath = file.path;
        _fileName = file.name;
        if (_titleCtrl.text.isEmpty) {
          _titleCtrl.text = file.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        }
      });
    }
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'ppt', 'pptx'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _filePath = result.files.single.path;
        _fileName = result.files.single.name;
        if (_titleCtrl.text.isEmpty) {
          _titleCtrl.text =
              result.files.single.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        }
      });
    }
  }

  Future<void> _upload() async {
    if (_filePath == null) return;
    setState(() => _uploading = true);

    try {
      final title = _titleCtrl.text.trim().isEmpty
          ? 'İsimsiz Materyal'
          : _titleCtrl.text.trim();
      final material = await ref.read(materialsProvider.notifier).upload(
            _filePath!,
            title,
          );
      if (material.status == 'uploaded' && mounted) {
        context.push('/material/${material.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Hata: $e'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Materyal Yükle')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_filePath != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _fileName?.endsWith('.pdf') == true ||
                        _fileName?.endsWith('.ppt') == true ||
                        _fileName?.endsWith('.pptx') == true
                    ? Container(
                        height: 200,
                        color: AppTheme.primary.withOpacity(0.05),
                        child: Icon(
                          _fileName!.endsWith('.pdf')
                              ? Icons.picture_as_pdf
                              : Icons.slideshow,
                          size: 64,
                          color: AppTheme.primary,
                        ),
                      )
                    : Image.file(File(_filePath!),
                        height: 250,
                        width: double.infinity,
                        fit: BoxFit.cover),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Materyal Adı',
                  prefixIcon: Icon(Icons.label_outline),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _uploading ? null : _upload,
                child: _uploading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Yükle ve Analiz Et'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => setState(() {
                  _filePath = null;
                  _fileName = null;
                }),
                child: const Text('Dosyayı Değiştir'),
              ),
            ] else ...[
              const SizedBox(height: 40),
              Text('Materyal ekle',
                  style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                'Ders notlarının fotoğraflarını çek veya\ngaleriden dosya yükle',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
              ),
              const SizedBox(height: 32),
              _OptionCard(
                icon: Icons.camera_alt,
                title: 'Fotoğraf Çek',
                subtitle: 'Kamerayı aç, notlarını çek',
                onTap: _pickFromCamera,
              ),
              const SizedBox(height: 12),
              _OptionCard(
                icon: Icons.photo_library,
                title: 'Galeriden Seç',
                subtitle: 'Telefonundaki fotoğrafı yükle',
                onTap: _pickFromGallery,
              ),
              const SizedBox(height: 12),
              _OptionCard(
                icon: Icons.insert_drive_file,
                title: 'PDF / PPT Yükle',
                subtitle: 'Dosya yöneticisinden seç',
                onTap: _pickFile,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _OptionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: AppTheme.primary, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: AppTheme.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
