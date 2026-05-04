/**
 * @register Sanctuary
 * @design-ref DESIGN.md §1.5, §10 (Onboarding), §12
 */
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/tokens';
import { StarterPackExplorer } from '@/components/StarterPack/StarterPackExplorer';
import { useFirstWeekStore } from '@/lib/firstWeek';

export function StarterPack() {
  const setStarterSelections = useFirstWeekStore((state) => state.setStarterSelections);
  const starterSelections = useFirstWeekStore((state) => state.starterSelections);

  function handleContinue(selectionIds: string[]) {
    setStarterSelections(selectionIds);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StarterPackExplorer
        initialSelectedIds={starterSelections}
        onContinue={handleContinue}
        onSelectionsChange={setStarterSelections}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
