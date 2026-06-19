import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizing, spacing, type } from '@/tokens';
import type { LookPiece } from '@/lib/firstWeek';

const defaultOutfitPieces: LookPiece[] = [
  {
    label: 'camel jacket',
    detail: 'soft shoulder',
    kind: 'jacket',
  },
  {
    label: 'oxford',
    detail: 'blue cotton',
    kind: 'oxford',
  },
  {
    label: 'indigo denim',
    detail: 'straight leg',
    kind: 'denim',
  },
];

type OutfitCompositionProps = {
  pieces?: LookPiece[];
};

export function OutfitComposition({ pieces = defaultOutfitPieces }: OutfitCompositionProps) {
  const accessibilityLabel = pieces.map((piece) => piece.label).join(', ');

  return (
    <View style={styles.stage} accessibilityLabel={accessibilityLabel} accessible>
      {pieces.map((piece) => (
        <View key={piece.label} style={[styles.piece, pieceStyles[piece.kind as keyof typeof pieceStyles] ?? pieceStyles.tee]}>
          <View style={styles.cutout}>
            <Text style={styles.pieceName}>{piece.label}</Text>
            <Text style={styles.pieceDetail}>{piece.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing[7],
  },
  piece: {
    borderColor: colors.smoke[500],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
    backgroundColor: colors.shadow,
    padding: spacing[4],
  },
  cutout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.smoke[400],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
    backgroundColor: colors.void,
  },
  pieceName: {
    color: colors.paper,
    fontFamily: type.families.displayMagazine,
    fontSize: type.bodyLg.size,
    fontStyle: 'italic',
    fontWeight: type.bodyLg.weight,
    lineHeight: type.bodyLg.lineHeight,
  },
  pieceDetail: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    textTransform: 'uppercase',
  },
});

const pieceStyles = StyleSheet.create({
  jacket: {
    width: '60%',
    height: sizing.outfit.jacketHeight,
    alignSelf: 'center',
  },
  oxford: {
    width: '44%',
    height: sizing.outfit.oxfordHeight,
    marginTop: -spacing[8],
    marginLeft: spacing[2],
  },
  denim: {
    width: '52%',
    height: sizing.outfit.denimHeight,
    alignSelf: 'flex-end',
    marginTop: -spacing[7],
  },
  tee: {
    width: '48%',
    height: sizing.outfit.oxfordHeight,
    marginTop: -spacing[7],
    marginLeft: spacing[3],
  },
  sneaker: {
    width: '50%',
    height: sizing.outfit.oxfordHeight,
    alignSelf: 'flex-end',
    marginTop: -spacing[7],
  },
  boot: {
    width: '42%',
    height: sizing.outfit.denimHeight,
    alignSelf: 'flex-end',
    marginTop: -spacing[7],
  },
  trouser: {
    width: '52%',
    height: sizing.outfit.denimHeight,
    alignSelf: 'flex-end',
    marginTop: -spacing[7],
  },
  skirt: {
    width: '54%',
    height: sizing.outfit.denimHeight,
    alignSelf: 'flex-end',
    marginTop: -spacing[7],
  },
  cap: {
    width: '42%',
    height: sizing.outfit.oxfordHeight,
    marginTop: -spacing[7],
    marginLeft: spacing[4],
  },
});
