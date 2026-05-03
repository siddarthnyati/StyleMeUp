import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizing, spacing, type } from '@/tokens';

export type GarmentKind = 'tee' | 'oxford' | 'denim' | 'sneaker' | 'jacket' | 'trouser' | 'skirt' | 'cap';

type GarmentTileProps = {
  label: string;
  kind: GarmentKind;
  register: 'Magazine' | 'Sanctuary';
  detail?: string;
};

export function GarmentTile({ detail, kind, label, register }: GarmentTileProps) {
  const isMagazine = register === 'Magazine';

  return (
    <View style={[styles.tile, isMagazine && styles.tileMagazine]}>
      <View style={styles.stage}>
        <View style={[styles.silhouette, silhouetteStyles[kind], isMagazine && styles.silhouetteMagazine]}>
          <View style={[styles.innerLine, isMagazine && styles.innerLineMagazine]} />
        </View>
      </View>
      <View style={styles.caption}>
        <Text style={[styles.label, isMagazine && styles.labelMagazine]}>{label}</Text>
        {detail ? <Text style={[styles.detail, isMagazine && styles.detailMagazine]}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: sizing.garmentTileHeight,
    justifyContent: 'space-between',
    borderRadius: radius.none,
    backgroundColor: colors.bone,
    padding: spacing[4],
  },
  tileMagazine: {
    borderColor: colors.smoke[500],
    borderWidth: sizing.hairline,
    backgroundColor: colors.shadow,
  },
  stage: {
    minHeight: sizing.garmentStageHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouette: {
    borderColor: colors.smoke[200],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
    backgroundColor: colors.paper,
  },
  silhouetteMagazine: {
    borderColor: colors.smoke[400],
    backgroundColor: colors.void,
  },
  innerLine: {
    flex: 1,
    margin: spacing[2],
    borderColor: colors.smoke[100],
    borderRadius: radius.none,
    borderWidth: sizing.hairline,
  },
  innerLineMagazine: {
    borderColor: colors.smoke[500],
  },
  caption: {
    gap: spacing[1],
  },
  label: {
    color: colors.ink,
    fontFamily: type.families.body,
    fontSize: type.bodyMd.size,
    fontWeight: type.bodyMd.weight,
    lineHeight: type.bodyMd.lineHeight,
  },
  labelMagazine: {
    color: colors.paper,
  },
  detail: {
    color: colors.smoke[300],
    fontFamily: type.families.body,
    fontSize: type.micro.size,
    fontWeight: type.micro.weight,
    letterSpacing: type.micro.letterSpacing,
    lineHeight: type.micro.lineHeight,
    textTransform: 'uppercase',
  },
  detailMagazine: {
    color: colors.smoke[300],
  },
});

const silhouetteStyles = StyleSheet.create({
  tee: {
    width: sizing.garment.tee.width,
    height: sizing.garment.tee.height,
  },
  oxford: {
    width: sizing.garment.oxford.width,
    height: sizing.garment.oxford.height,
  },
  denim: {
    width: sizing.garment.denim.width,
    height: sizing.garment.denim.height,
  },
  sneaker: {
    width: sizing.garment.sneaker.width,
    height: sizing.garment.sneaker.height,
    borderRadius: radius.xs,
  },
  jacket: {
    width: sizing.garment.jacket.width,
    height: sizing.garment.jacket.height,
  },
  trouser: {
    width: sizing.garment.trouser.width,
    height: sizing.garment.trouser.height,
  },
  skirt: {
    width: sizing.garment.skirt.width,
    height: sizing.garment.skirt.height,
  },
  cap: {
    width: sizing.garment.cap.width,
    height: sizing.garment.cap.height,
    borderRadius: radius.pill,
  },
});
