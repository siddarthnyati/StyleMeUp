import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizing, spacing, type } from '@/tokens';

const outfitPieces = [
  {
    name: 'camel jacket',
    detail: 'soft shoulder',
    variant: 'jacket',
  },
  {
    name: 'oxford',
    detail: 'blue cotton',
    variant: 'oxford',
  },
  {
    name: 'indigo denim',
    detail: 'straight leg',
    variant: 'denim',
  },
] as const;

export function OutfitComposition() {
  return (
    <View style={styles.stage} accessibilityLabel="camel jacket, oxford, indigo denim" accessible>
      {outfitPieces.map((piece) => (
        <View key={piece.name} style={[styles.piece, pieceStyles[piece.variant]]}>
          <View style={styles.cutout}>
            <Text style={styles.pieceName}>{piece.name}</Text>
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
});
