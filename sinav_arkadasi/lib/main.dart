import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants.dart';
import 'core/theme.dart';
import 'presentation/router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
    authOptions: const FlutterAuthClientOptions(
      authFlowType: AuthFlowType.pkce,
    ),
  );

  // Session yenilemesini ve state değişikliklerini dinle.
  Supabase.instance.client.auth.onAuthStateChange.listen((_) {
    router.refresh();
  });

  runApp(const ProviderScope(child: SinavArkadasiApp()));
}

class SinavArkadasiApp extends StatefulWidget {
  const SinavArkadasiApp({super.key});

  @override
  State<SinavArkadasiApp> createState() => _SinavArkadasiAppState();
}

class _SinavArkadasiAppState extends State<SinavArkadasiApp>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Uygulama ön plana gelince session'ı tazeleyerek otomatik çıkışı önle.
    if (state == AppLifecycleState.resumed) {
      Supabase.instance.client.auth.refreshSession();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      routerConfig: router,
    );
  }
}
