import 'package:flutter_test/flutter_test.dart';
import 'package:sinav_arkadasi/main.dart';

void main() {
  testWidgets('App renders without error', (WidgetTester tester) async {
    await tester.pumpWidget(const SinavArkadasiApp());
    expect(find.text('Sınav Arkadaşı'), findsOneWidget);
  });
}
