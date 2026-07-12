import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../repositories/auth_repo.dart';

final authRepoProvider = Provider<AuthRepository>((ref) => AuthRepository());

final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(authRepoProvider).authState;
});

final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider).valueOrNull;
  return authState?.session?.user;
});

enum AuthStatus { idle, loading, success, error }

class AuthNotifier extends StateNotifier<AuthStatus> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(AuthStatus.idle);

  Future<void> signUp(String email, String password) async {
    state = AuthStatus.loading;
    try {
      await _repo.signUp(email, password);
      state = AuthStatus.success;
    } catch (e) {
      state = AuthStatus.error;
      rethrow;
    }
  }

  Future<void> signIn(String email, String password) async {
    state = AuthStatus.loading;
    try {
      await _repo.signIn(email, password);
      state = AuthStatus.success;
    } catch (e) {
      state = AuthStatus.error;
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _repo.signOut();
    state = AuthStatus.idle;
  }
}

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthStatus>((ref) {
  return AuthNotifier(ref.watch(authRepoProvider));
});
